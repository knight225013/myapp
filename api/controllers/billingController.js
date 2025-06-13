const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class BillingController {
  // 自动生成计费
  async autoGenerateBilling(req, res) {
    try {
      const { shipmentIds, customerId } = req.body;

      if (!shipmentIds || !Array.isArray(shipmentIds)) {
        return res.status(400).json({
          success: false,
          error: '请提供有效的运单ID列表'
        });
      }

      const results = [];

      for (const shipmentId of shipmentIds) {
        // 获取运单信息
        const shipment = await prisma.fBAOrder.findUnique({
          where: { id: shipmentId },
          include: {
            customer: true,
            channel: {
              include: {
                billingRules: {
                  where: { isActive: true },
                  include: { chargeType: true }
                }
              }
            }
          }
        });

        if (!shipment) {
          results.push({
            shipmentId,
            success: false,
            error: '运单不存在'
          });
          continue;
        }

        if (shipment.isBilled) {
          results.push({
            shipmentId,
            success: false,
            error: '运单已计费'
          });
          continue;
        }

        // 计算费用
        const billingItems = await this.calculateShipmentCharges(shipment);

        if (billingItems.length === 0) {
          results.push({
            shipmentId,
            success: false,
            error: '未找到适用的计费规则'
          });
          continue;
        }

        // 创建发票
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const subtotal = billingItems.reduce((sum, item) => sum + item.amount, 0);
        const taxAmount = subtotal * 0.13;
        const totalAmount = subtotal + taxAmount;

        const invoice = await prisma.financeInvoice.create({
          data: {
            invoiceNumber,
            type: 'COMMERCIAL',
            customerId: customerId || shipment.customerId,
            customerName: shipment.customer.companyName || shipment.customer.name,
            customerAddress: shipment.customer.address,
            currency: 'CNY',
            subtotal,
            taxAmount,
            totalAmount,
            balanceAmount: totalAmount,
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            description: `运单 ${shipment.recipient} 自动计费`,
            createdBy: req.user?.id || 'system',
            items: {
              create: billingItems.map(item => ({
                shipmentId,
                chargeTypeId: item.chargeTypeId,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount,
                currency: 'CNY'
              }))
            }
          }
        });

        // 标记运单已计费
        await prisma.fBAOrder.update({
          where: { id: shipmentId },
          data: {
            isBilled: true,
            billedAt: new Date(),
            billedBy: req.user?.id || 'system'
          }
        });

        results.push({
          shipmentId,
          success: true,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          totalAmount
        });
      }

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('自动计费失败:', error);
      res.status(500).json({
        success: false,
        error: '自动计费失败'
      });
    }
  }

  // 计算运单费用
  async calculateShipmentCharges(shipment) {
    const billingItems = [];
    const rules = shipment.channel?.billingRules || [];

    for (const rule of rules) {
      let amount = 0;
      let quantity = 1;
      let unitPrice = 0;

      switch (rule.unitType) {
        case 'per_kg':
          quantity = parseFloat(shipment.weight) || 0;
          unitPrice = parseFloat(rule.baseRate);
          amount = quantity * unitPrice;
          break;

        case 'per_cbm':
          const volumeWeight = (parseFloat(shipment.length || 0) * 
                               parseFloat(shipment.width || 0) * 
                               parseFloat(shipment.height || 0)) / 5000;
          quantity = Math.max(parseFloat(shipment.weight || 0), volumeWeight);
          unitPrice = parseFloat(rule.baseRate);
          amount = quantity * unitPrice;
          break;

        case 'per_shipment':
          quantity = 1;
          unitPrice = parseFloat(rule.baseRate);
          amount = unitPrice;
          break;

        case 'percentage':
          const goodsValue = parseFloat(shipment.declaredValue || 0);
          amount = goodsValue * (parseFloat(rule.baseRate) / 100);
          unitPrice = parseFloat(rule.baseRate);
          quantity = goodsValue;
          break;

        default:
          continue;
      }

      // 应用最小/最大费用限制
      if (rule.minCharge && amount < parseFloat(rule.minCharge)) {
        amount = parseFloat(rule.minCharge);
      }
      if (rule.maxCharge && amount > parseFloat(rule.maxCharge)) {
        amount = parseFloat(rule.maxCharge);
      }

      if (amount > 0) {
        billingItems.push({
          chargeTypeId: rule.chargeTypeId,
          description: `${rule.chargeType.name} - ${shipment.recipient}`,
          quantity,
          unitPrice,
          amount
        });
      }
    }

    return billingItems;
  }

  // 获取计费规则
  async getBillingRules(req, res) {
    try {
      const { channelId, chargeTypeId, isActive } = req.query;
      const where = {};

      if (channelId) where.channelId = channelId;
      if (chargeTypeId) where.chargeTypeId = chargeTypeId;
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const rules = await prisma.billingRule.findMany({
        where,
        include: {
          channel: {
            select: { id: true, name: true }
          },
          chargeType: {
            select: { id: true, name: true, code: true, category: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      console.error('获取计费规则失败:', error);
      res.status(500).json({
        success: false,
        error: '获取计费规则失败'
      });
    }
  }

  // 创建计费规则
  async createBillingRule(req, res) {
    try {
      const {
        channelId,
        chargeTypeId,
        currency = 'CNY',
        unitType,
        baseRate,
        minCharge,
        maxCharge,
        conditions,
        effectiveDate,
        expiryDate
      } = req.body;

      if (!channelId || !chargeTypeId || !unitType || !baseRate) {
        return res.status(400).json({
          success: false,
          error: '请填写所有必填字段'
        });
      }

      const rule = await prisma.billingRule.create({
        data: {
          channelId,
          chargeTypeId,
          currency,
          unitType,
          baseRate: parseFloat(baseRate),
          minCharge: minCharge ? parseFloat(minCharge) : null,
          maxCharge: maxCharge ? parseFloat(maxCharge) : null,
          conditions: conditions || null,
          effectiveDate: new Date(effectiveDate || Date.now()),
          expiryDate: expiryDate ? new Date(expiryDate) : null
        },
        include: {
          channel: {
            select: { id: true, name: true }
          },
          chargeType: {
            select: { id: true, name: true, code: true, category: true }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: rule
      });
    } catch (error) {
      console.error('创建计费规则失败:', error);
      res.status(500).json({
        success: false,
        error: '创建计费规则失败'
      });
    }
  }

  // 更新计费规则
  async updateBillingRule(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (updateData.baseRate) updateData.baseRate = parseFloat(updateData.baseRate);
      if (updateData.minCharge) updateData.minCharge = parseFloat(updateData.minCharge);
      if (updateData.maxCharge) updateData.maxCharge = parseFloat(updateData.maxCharge);
      if (updateData.effectiveDate) updateData.effectiveDate = new Date(updateData.effectiveDate);
      if (updateData.expiryDate) updateData.expiryDate = new Date(updateData.expiryDate);

      const rule = await prisma.billingRule.update({
        where: { id },
        data: updateData,
        include: {
          channel: {
            select: { id: true, name: true }
          },
          chargeType: {
            select: { id: true, name: true, code: true, category: true }
          }
        }
      });

      res.json({
        success: true,
        data: rule
      });
    } catch (error) {
      console.error('更新计费规则失败:', error);
      res.status(500).json({
        success: false,
        error: '更新计费规则失败'
      });
    }
  }

  // 预览计费
  async previewBilling(req, res) {
    try {
      const { shipmentId } = req.params;

      const shipment = await prisma.fBAOrder.findUnique({
        where: { id: shipmentId },
        include: {
          customer: true,
          channel: {
            include: {
              billingRules: {
                where: { isActive: true },
                include: { chargeType: true }
              }
            }
          }
        }
      });

      if (!shipment) {
        return res.status(404).json({
          success: false,
          error: '运单不存在'
        });
      }

      const billingItems = await this.calculateShipmentCharges(shipment);
      const subtotal = billingItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = subtotal * 0.13;
      const totalAmount = subtotal + taxAmount;

      res.json({
        success: true,
        data: {
          shipment: {
            id: shipment.id,
            recipient: shipment.recipient,
            weight: shipment.weight,
            dimensions: {
              length: shipment.length,
              width: shipment.width,
              height: shipment.height
            },
            declaredValue: shipment.declaredValue
          },
          billingItems,
          summary: {
            subtotal,
            taxAmount,
            totalAmount,
            currency: 'CNY'
          }
        }
      });
    } catch (error) {
      console.error('预览计费失败:', error);
      res.status(500).json({
        success: false,
        error: '预览计费失败'
      });
    }
  }
}

module.exports = new BillingController(); 