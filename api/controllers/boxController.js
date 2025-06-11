const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { applyChannelRules } = require('../utils/channelUtils');
const { calculateBoxSummary } = require('../utils/boxSummary');

// 更新箱子
async function updateBox(req, res) {
  const { id } = req.params;
  const { weight, length, width, height, hasBattery, declaredValue } = req.body;

  try {
    // 更新箱子
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

    // 找到所属运单（只支持 FBAOrder）
    const box = await prisma.box.findUnique({
      where: { id },
      include: {
        fbaOrder: { include: { channel: true } },
      },
    });
    console.log('🧪 updateBox 请求体:', req.body);
    console.log('🧪 更新 box ID:', id);

    if (!box) {
      return res.status(404).json({ success: false, error: '箱子不存在' });
    }

    if (!box.fbaOrderId) {
      return res.status(400).json({ success: false, error: '仅支持更新 FBA 运单的箱子' });
    }

    const orderId = box.fbaOrderId;
    const channel = box.fbaOrder.channel;

    if (!orderId || !channel) {
      return res.status(400).json({ success: false, error: '运单或渠道信息缺失' });
    }

    // 获取运单的所有箱子
    const boxes = await prisma.box.findMany({
      where: { fbaOrderId: orderId },
    });

    // 计算汇总字段
    const { totalWeight, volume, volumetricWeight } = calculateBoxSummary(boxes, channel);
    const chargeWeight = applyChannelRules(Math.max(totalWeight, volumetricWeight), channel);

    // 更新运单
    await prisma.fBAOrder.update({
      where: { id: orderId },
      data: {
        weight: totalWeight,
        volume,
        volumetricWeight,
        chargeWeight,
      },
    });

    res.json({ success: true, data: updatedBox });
  } catch (error) {
    console.error('更新箱子失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { updateBox };
