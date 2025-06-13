const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateInvoiceNumber } = require('../utils/numberGenerator');
const { calculateTax } = require('../utils/taxCalculator');
const { convertCurrency } = require('../utils/currencyConverter');
const PDFGenerator = require('../utils/pdfGenerator');

class InvoiceController {
  // 获取发票列表
  async getInvoices(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        customerId,
        type,
        dateFrom,
        dateTo,
        search
      } = req.query;

      const skip = (page - 1) * limit;
      const where = {};

      // 构建查询条件
      if (status) where.status = status;
      if (customerId) where.customerId = customerId;
      if (type) where.type = type;
      if (dateFrom || dateTo) {
        where.issueDate = {};
        if (dateFrom) where.issueDate.gte = new Date(dateFrom);
        if (dateTo) where.issueDate.lte = new Date(dateTo);
      }
      if (search) {
        where.OR = [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [invoices, total] = await Promise.all([
        prisma.financeInvoice.findMany({
          where,
          include: {
            customer: {
              select: { id: true, name: true, companyName: true }
            },
            items: {
              include: {
                chargeType: true,
                shipment: {
                  select: { id: true, recipient: true, country: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: parseInt(skip),
          take: parseInt(limit)
        }),
        prisma.financeInvoice.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          invoices,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('获取发票列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取发票列表失败'
      });
    }
  }

  // 创建发票
  async createInvoice(req, res) {
    try {
      const {
        customerId,
        type = 'COMMERCIAL',
        currency = 'CNY',
        items,
        description,
        terms,
        dueDate
      } = req.body;

      // 获取客户信息
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: { credit: true }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: '客户不存在'
        });
      }

      // 生成发票号
      const invoiceNumber = `INV-${Date.now()}`;

      // 计算金额
      let subtotal = 0;
      const processedItems = [];

      for (const item of items) {
        const amount = parseFloat(item.quantity) * parseFloat(item.unitPrice);
        subtotal += amount;

        processedItems.push({
          ...item,
          amount,
          currency
        });
      }

      // 计算税额和总额
      const taxAmount = subtotal * 0.13; // 假设13%税率
      const totalAmount = subtotal + taxAmount;

      // 创建发票
      const invoice = await prisma.financeInvoice.create({
        data: {
          invoiceNumber,
          type,
          customerId,
          customerName: customer.companyName || customer.name,
          customerAddress: customer.address,
          customerTaxId: customer.taxId,
          currency,
          subtotal,
          taxAmount,
          totalAmount,
          balanceAmount: totalAmount,
          issueDate: new Date(),
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          description,
          terms,
          createdBy: req.user?.id || 'system',
          items: {
            create: processedItems
          }
        },
        include: {
          items: {
            include: {
              chargeType: true,
              shipment: true
            }
          },
          customer: true
        }
      });

      res.status(201).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      console.error('创建发票失败:', error);
      res.status(500).json({
        success: false,
        error: '创建发票失败'
      });
    }
  }

  // 获取单个发票
  async getInvoice(req, res) {
    try {
      const { id } = req.params;

      const invoice = await prisma.financeInvoice.findUnique({
        where: { id },
        include: {
          customer: true,
          items: {
            include: {
              chargeType: true,
              shipment: {
                select: { id: true, recipient: true, country: true, trackingNumber: true }
              }
            }
          },
          payments: {
            include: {
              allocations: true
            }
          },
          parentInvoice: true,
          childInvoices: true
        }
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: '发票不存在'
        });
      }

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      console.error('获取发票失败:', error);
      res.status(500).json({
        success: false,
        error: '获取发票失败'
      });
    }
  }

  // 审批发票
  async approveInvoice(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const invoice = await prisma.financeInvoice.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy: req.user?.id || 'system',
          approvedAt: new Date(),
          notes: notes
        },
        include: {
          customer: true,
          items: {
            include: {
              chargeType: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      console.error('审批发票失败:', error);
      res.status(500).json({
        success: false,
        error: '审批发票失败'
      });
    }
  }

  // 发送发票
  async sendInvoice(req, res) {
    try {
      const { id } = req.params;

      await prisma.financeInvoice.update({
        where: { id },
        data: {
          status: 'SENT'
        }
      });

      res.json({
        success: true,
        message: '发票已发送'
      });
    } catch (error) {
      console.error('发送发票失败:', error);
      res.status(500).json({
        success: false,
        error: '发送发票失败'
      });
    }
  }

  // 作废发票
  async voidInvoice(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const invoice = await prisma.financeInvoice.findUnique({
        where: { id }
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: '发票不存在'
        });
      }

      if (invoice.paidAmount > 0) {
        return res.status(400).json({
          success: false,
          error: '已付款的发票不能作废'
        });
      }

      await prisma.financeInvoice.update({
        where: { id },
        data: {
          status: 'VOIDED',
          notes: `${invoice.notes || ''}\n作废原因: ${reason}`
        }
      });

      res.json({
        success: true,
        message: '发票已作废'
      });
    } catch (error) {
      console.error('作废发票失败:', error);
      res.status(500).json({
        success: false,
        error: '作废发票失败'
      });
    }
  }

  // 创建贷记单
  async createCreditNote(req, res) {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body;

      const originalInvoice = await prisma.financeInvoice.findUnique({
        where: { id },
        include: { customer: true }
      });

      if (!originalInvoice) {
        return res.status(404).json({
          success: false,
          error: '原发票不存在'
        });
      }

      // 生成贷记单号
      const creditNoteNumber = `CN-${Date.now()}`;

      // 创建贷记单
      const creditNote = await prisma.financeInvoice.create({
        data: {
          invoiceNumber: creditNoteNumber,
          type: 'CREDIT_NOTE',
          parentInvoiceId: id,
          customerId: originalInvoice.customerId,
          customerName: originalInvoice.customerName,
          customerAddress: originalInvoice.customerAddress,
          customerTaxId: originalInvoice.customerTaxId,
          currency: originalInvoice.currency,
          subtotal: -Math.abs(amount),
          totalAmount: -Math.abs(amount),
          balanceAmount: -Math.abs(amount),
          issueDate: new Date(),
          dueDate: new Date(),
          description: `贷记单 - ${reason}`,
          createdBy: req.user?.id || 'system',
          status: 'APPROVED'
        }
      });

      // 更新原发票余额
      await prisma.financeInvoice.update({
        where: { id },
        data: {
          balanceAmount: {
            decrement: Math.abs(amount)
          }
        }
      });

      res.status(201).json({
        success: true,
        data: creditNote
      });
    } catch (error) {
      console.error('创建贷记单失败:', error);
      res.status(500).json({
        success: false,
        error: '创建贷记单失败'
      });
    }
  }

  // 生成发票PDF
  async generateInvoicePDF(req, res) {
    try {
      const { id } = req.params;

      const invoice = await prisma.financeInvoice.findUnique({
        where: { id },
        include: {
          customer: true,
          items: {
            include: {
              chargeType: true,
              shipment: true
            }
          }
        }
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: '发票不存在'
        });
      }

      // 这里应该生成PDF，暂时返回成功
      res.json({
        success: true,
        message: 'PDF生成功能待实现'
      });
    } catch (error) {
      console.error('生成发票PDF失败:', error);
      res.status(500).json({
        success: false,
        error: '生成发票PDF失败'
      });
    }
  }

  // 更新发票
  async updateInvoice(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingInvoice = await prisma.financeInvoice.findUnique({
        where: { id }
      });

      if (!existingInvoice) {
        return res.status(404).json({
          success: false,
          error: '发票不存在'
        });
      }

      if (existingInvoice.status !== 'DRAFT') {
        return res.status(400).json({
          success: false,
          error: '只能修改草稿状态的发票'
        });
      }

      const invoice = await prisma.financeInvoice.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          items: {
            include: {
              chargeType: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      console.error('更新发票失败:', error);
      res.status(500).json({
        success: false,
        error: '更新发票失败'
      });
    }
  }

  // 删除发票
  async deleteInvoice(req, res) {
    try {
      const { id } = req.params;

      const invoice = await prisma.financeInvoice.findUnique({
        where: { id }
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: '发票不存在'
        });
      }

      if (invoice.status !== 'DRAFT') {
        return res.status(400).json({
          success: false,
          error: '只能删除草稿状态的发票'
        });
      }

      await prisma.financeInvoice.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: '发票已删除'
      });
    } catch (error) {
      console.error('删除发票失败:', error);
      res.status(500).json({
        success: false,
        error: '删除发票失败'
      });
    }
  }
}

module.exports = new InvoiceController(); 