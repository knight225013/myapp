const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { applyChannelRules } = require('../utils/channelUtils');
const { calculateBoxSummary } = require('../utils/boxSummary');
const { calculateFreight } = require('../utils/freightUtils');
const { createWaybill, updateShipment } = require('../services/waybillService');
const { validateShipmentAgainstChannel } = require('../utils/channelValidation');
const { evaluateExpression } = require('../utils/expressionUtils');
const { cleanPrismaData } = require('../utils/cleanPrismaInput');

const tenantId = 'b21918cb-9cb6-4482-ac33-19c70b2c0a12';
const customerId = '380080d7-68eb-4461-b607-8c7d365f3fd1';

async function createWaybillHandler(req, res) {
  try {
    const newWaybill = await createWaybill(req.body);
    res.json({ success: true, data: newWaybill });
  } catch (error) {
    console.error('运单创建错误:', error);
    res
      .status(error.message.includes('必填') ? 400 : 500)
      .json({ success: false, error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}

// 更新运单
async function updateShipmentHandler(req, res) {
  const { id } = req.params;
  try {
    const updatedShipment = await updateShipment(id, req.body);
    res.json({ success: true, data: updatedShipment });
  } catch (error) {
    console.error('更新运单失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// 获取运单摘要
async function getSummary(req, res) {
  const { id } = req.params;
  try {
    const waybill = await prisma.fBAOrder.findUnique({
      where: { id },
      include: {
        boxes: true,
        channel: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            country: true,
            currency: true,
            chargeMethod: true,
            volRatio: true,
            minCharge: true,
            rates: true,
            extraFeeRules: true,
            decimal: true,
            rounding: true,
            compareMode: true,
            minBoxChargeWeight: true,
            maxBoxChargeWeight: true,
          },
        },
        sender: true,
      },
    });

    if (!waybill) {
      return res.status(404).json({ success: false, error: '运单不存在' });
    }

    if (!waybill.channel) {
      return res.status(400).json({ success: false, error: '渠道数据为空，无法计算' });
    }

    const { totalWeight, volume, volumetricWeight } = calculateBoxSummary(
      waybill.boxes || [],
      waybill,
    );
    const chargeWeight = applyChannelRules(
      totalWeight,
      volumetricWeight,
      waybill.channel,
    ).chargeWeight;
    const freight = calculateFreight(waybill, waybill.channel);

    const safeNumber = (value, digits = 2) =>
      typeof value === 'number' && !isNaN(value) ? parseFloat(value.toFixed(digits)) : 0;

    res.json({
      success: true,
      data: {
        ...waybill,
        weight: safeNumber(totalWeight),
        volume: safeNumber(volume, 4),
        volumetricWeight: safeNumber(volumetricWeight),
        chargeWeight: safeNumber(chargeWeight),
        freightCost: safeNumber(freight.freightCost),
        extraFee: safeNumber(freight.extraFee),
        totalCost: safeNumber(freight.totalCost),
        currency: waybill.channel.currency || 'CNY',
      },
    });
  } catch (error) {
    console.error('❌ 获取运单摘要失败:', {
      message: error.message,
      stack: error.stack,
      waybillId: id,
    });
    res.status(500).json({ success: false, error: error.message || '服务器错误，请稍后重试' });
  }
}

// 创建运单




// 获取运单列表
async function getWaybills(req, res) {
  const {
    page = 1,
    limit = 30,
    status,
    country,
    channel,
    waybillNumber,
    client,
    date,
    type = 'FBA',
  } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = {
      type,
      tenantId: req.user?.tenantId || tenantId,
      customerId: req.user?.customerId || customerId,
    };
    if (status && status !== '全部') where.status = status;
    if (country) where.country = country;
    if (channel) where.channelId = { contains: channel };
    if (waybillNumber) where.id = { contains: waybillNumber };
    if (client) where.clientCode = { contains: client };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      where.createdAt = { gte: startDate.toISOString(), lt: endDate.toISOString() };
    }

    const [waybills, total] = await Promise.all([
      prisma.fBAOrder.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          boxes: true,
          logs: { orderBy: { timestamp: 'desc' }, take: 1 },
          sender: true,
          channel: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
              country: true,
              currency: true,
              chargeMethod: true,
              volRatio: true,
              minCharge: true,
              rates: true,
              extraFeeRules: true,
            },
          },
        },
      }),
      prisma.fBAOrder.count({ where }),
    ]);

    res.json({ success: true, data: waybills, total });
  } catch (error) {
    console.error('获取运单失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// 获取状态统计
async function getStats(req, res) {
  const type = req.query.type || 'FBA';
  const statuses = ['已下单', '已收货', '转运中', '已签收', '已取消', '退件'];
  const data = {};

  try {
    for (const status of statuses) {
      const count = await prisma.fBAOrder.count({ where: { type, status } });
      data[status] = count;
    }

    const total = await prisma.fBAOrder.count({ where: { type } });
    data['全部'] = total;

    res.json({ success: true, data });
  } catch (error) {
    console.error('获取状态统计失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// 更新箱子
async function updateBox(req, res) {
  const { id } = req.params;
  const { weight, length, width, height, hasBattery, declareValue } = req.body;

  try {
    const box = await prisma.box.findUnique({ where: { id } });
    if (!box) return res.status(404).json({ success: false, error: '箱子不存在' });

    const updatedBox = await prisma.box.update({
      where: { id },
      data: {
        weight: parseFloat(weight) || null,
        length: parseFloat(length) || null,
        width: parseFloat(width) || null,
        height: parseFloat(height) || null,
        hasBattery: !!hasBattery,
        declareValue: parseFloat(declareValue) || null,
      },
    });

    if (weight && length && width && height) {
      await prisma.shipmentLog.create({
        data: {
          shipmentId: box.fbaOrderId || box.tradOrderId,
          status: '已收货',
          remark: `箱子 ${box.code} 明细填写完成`,
        },
      });
    }

    res.json({ success: true, data: updatedBox });
  } catch (error) {
    console.error('更新箱子失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// 获取运单摘要


// 获取运单轨迹
async function getLogs(req, res) {
  const { id } = req.params;
  try {
    const logs = await prisma.shipmentLog.findMany({
      where: { shipmentId: id },
      orderBy: { timestamp: 'asc' },
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('获取运单轨迹失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// 添加运单轨迹节点
async function addLog(req, res) {
  const { id } = req.params;
  const { status, remark } = req.body;
  try {
    if (!status) return res.status(400).json({ success: false, error: '状态字段为必填' });
    const shipment = await prisma.fBAOrder.findUnique({ where: { id } });
    if (!shipment) return res.status(404).json({ success: false, error: '运单不存在' });
    const log = await prisma.shipmentLog.create({
      data: { shipmentId: id, status, remark },
    });
    res.json({ success: true, data: log });
  } catch (error) {
    console.error('添加运单轨迹失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// 获取FBA运单轨迹（重复方法，已合并到 getLogs）
exports.getLogs = async (req, res) => {
  await getLogs(req, res);
};

// 添加FBA运单轨迹节点（重复方法，已合并到 addLog）
exports.addLog = async (req, res) => {
  await addLog(req, res);
};

// 获取单个运单
async function getWaybillById(req, res) {
  const { id } = req.params;
  const { type } = req.query;
  try {
    const where = { id };
    if (type) where.type = type;
    const waybill = await prisma.fBAOrder.findUnique({
      where,
      include: {
        boxes: true,
        channel: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            country: true,
            currency: true,
            chargeMethod: true,
            volRatio: true,
            minCharge: true,
            rates: true,
            extraFeeRules: true,
            decimal: true,
            rounding: true,
            compareMode: true,
            minBoxChargeWeight: true,
            maxBoxChargeWeight: true,
          },
        },
        sender: true,
        carrier: true,
      },
    });
    if (!waybill) return res.status(404).json({ success: false, error: '运单不存在' });

    // 添加调试日志
    console.log('运单数据:', {
      id: waybill.id,
      channelId: waybill.channelId,
      channel: waybill.channel,
    });

    const freight = calculateFreight(
      {
        weight: Number(waybill.weight) || 0,
        chargeWeight: Number(waybill.chargeWeight) || 0,
        quantity: Number(waybill.quantity) || 0,
        declaredValue: parseFloat(waybill.declaredValue) || 0,
        boxes: waybill.boxes || [],
      },
      waybill.channel,
    );
    res.json({
      success: true,
      data: {
        ...waybill,
        freightCost: freight.freightCost,
        extraFee: freight.extraFee,
        totalCost: freight.totalCost,
        currency: freight.currency,
      },
    });
  } catch (error) {
    console.error('获取运单失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// 上传附件
async function uploadAttachment(req, res) {
  const { id } = req.params;
  const { uploader } = req.body;
  const file = req.file;

  try {
    if (!file) return res.status(400).json({ success: false, error: '未选择文件' });
    const shipment = await prisma.fBAOrder.findUnique({ where: { id } });
    if (!shipment) return res.status(404).json({ success: false, error: '运单不存在' });

    const attachment = {
      name: file.filename,
      uploader: uploader || '未知用户',
      time: new Date().toISOString(),
    };

    await prisma.fBAOrder.update({
      where: { id },
      data: { attachments: { push: attachment } },
    });

    res.json({ success: true, data: attachment });
  } catch (error) {
    console.error('上传附件失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  uploadAttachment,
  getWaybills,
  createWaybillHandler,
  updateShipmentHandler,
  updateBox,
  getSummary,
  getLogs,
  addLog,
  getStats,
  getWaybillById,
};
