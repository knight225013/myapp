const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { applyChannelRules } = require('../utils/channelUtils');
const { calculateBoxSummary } = require('../utils/boxSummary');

// 更新箱子
async function updateBox(req, res) {
  const { id } = req.params;
  const { weight, length, width, height, hasBattery, declaredValue } = req.body;

  try {
    // 1. 验证输入数据
    if (!id) {
      return res.status(400).json({ success: false, error: '箱子ID不能为空' });
    }

    // 2. 查找箱子及其关联的运单信息
    const box = await prisma.box.findUnique({
      where: { id },
      include: {
        fbaOrder: {
          include: {
            channel: true,
            boxes: true
          }
        }
      }
    });

    if (!box) {
      return res.status(404).json({ success: false, error: '箱子不存在' });
    }

    if (!box.fbaOrderId) {
      return res.status(400).json({ success: false, error: '仅支持更新 FBA 运单的箱子' });
    }

    // 3. 更新箱子信息
    const updatedBox = await prisma.box.update({
      where: { id },
      data: {
        weight: weight ? parseFloat(weight) : null,
        length: length ? parseFloat(length) : null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        hasBattery: !!hasBattery,
        declaredValue: declaredValue ? parseFloat(declaredValue) : 0.0,
      },
    });

    // 4. 重新计算运单汇总数据
    const { totalWeight, volume, volumetricWeight } = calculateBoxSummary(
      box.fbaOrder.boxes,
      box.fbaOrder.channel
    );

    // 5. 应用渠道规则计算计费重量
    const chargeWeightResult = applyChannelRules(
      totalWeight,
      volumetricWeight,
      box.fbaOrder.channel
    );

    // 6. 更新运单信息
    await prisma.fBAOrder.update({
      where: { id: box.fbaOrderId },
      data: {
        weight: totalWeight,
        volume,
        volumetricWeight,
        chargeWeight: chargeWeightResult.chargeWeight || 0,
      },
    });

    // 7. 记录操作日志
    if (weight && length && width && height) {
      await prisma.shipmentLog.create({
        data: {
          shipmentId: box.fbaOrderId,
          status: '已收货',
          remark: `箱子 ${box.code} 明细填写完成`,
          timestamp: new Date(),
        },
      });
    }

    // 8. 返回更新后的箱子信息
    res.json({
      success: true,
      data: {
        ...updatedBox,
        summary: {
          totalWeight,
          volume,
          volumetricWeight,
          chargeWeight: chargeWeightResult.chargeWeight || 0,
        },
      },
    });
  } catch (error) {
    console.error('更新箱子失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '更新箱子失败',
    });
  }
}

module.exports = { updateBox };
