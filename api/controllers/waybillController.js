const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { applyChannelRules } = require('../utils/channelUtils');
const { calculateBoxSummary } = require('../utils/boxSummary');
const { validateShipmentAgainstChannel } = require('../utils/channelValidation');
const { evaluateExpression } = require('../utils/expressionUtils');
const { cleanPrismaData } = require('../utils/cleanPrismaInput');

const tenantId = 'b21918cb-9cb6-4482-ac33-19c70b2c0a12';
const customerId = '380080d7-68eb-4461-b607-8c7d365f3fd1';

// 计算运费
function calculateFreight(waybill, channel) {
  let freightCost = 0;
  let extraFee = 0;

  // 1. Calculate volume and context
  const volume =
    waybill.boxes?.reduce((sum, box) => {
      const boxVolume = ((box.length || 0) * (box.width || 0) * (box.height || 0)) / 1000000;
      return sum + boxVolume;
    }, 0) || 0;

  const context = {
    weight: Number(waybill.weight) || 0,
    volume,
    chargeWeight: Number(waybill.chargeWeight) || 0,
    boxCount: Number(waybill.quantity) || 0,
    declareValue: parseFloat(waybill.declaredValue) || 0,
  };

  // 2. Calculate volume weight based on volRatio
  const volumeWeight = channel.volRatio ? (volume * 1000000) / channel.volRatio : 0;

  // 3. Apply channel rules (handles both tiered and uniform pricing)
  const { chargeWeight, freightCost: rateFreightCost } = applyChannelRules(
    context.weight,
    volumeWeight,
    channel,
  );

  // 4. Determine freight cost
  if (rateFreightCost !== undefined) {
    // Tiered pricing was applied
    freightCost = Math.max(rateFreightCost, channel.minCharge || 0);
  } else {
    // Fallback to uniform pricing
    const baseRate = parseFloat(channel.chargePrice || channel.baseRate || 0);
    if (channel.chargeMethod === '综合' || channel.chargeMethod === '实重') {
      freightCost = chargeWeight * baseRate;
    } else if (channel.chargeMethod === '泡重' && channel.volRatio) {
      freightCost = volumeWeight * baseRate;
    }
    freightCost = Math.max(freightCost, channel.minCharge || 0);
  }

  // 5. Calculate extra fees
  if (Array.isArray(channel.extraFeeRules)) {
    for (const rule of channel.extraFeeRules) {
      try {
        const context = {
          weight: Number(waybill.weight) || 0,
          volume,
          chargeWeight: Number(waybill.chargeWeight) || 0,
          boxCount: Number(waybill.quantity) || 0,
          declareValue: parseFloat(waybill.declaredValue) || 0,
          longest_side: Math.max(
            ...waybill.boxes.map((b) => Math.max(b.length || 0, b.width || 0, b.height || 0)),
          ),
        };

        if (rule.params?.field === 'longest_side') {
          const longest = context.longest_side;
          const min = rule.params.min || 0;
          const max = rule.params.max || Infinity;
          if (longest >= min && longest <= max) {
            const price = rule.params.price || 0;
            const count = context.boxCount || 1;
            const fee = price * count;
            console.log('✅ 命中附加费规则（params）:', rule.name, '→', fee);
            extraFee += fee;
          } else {
            console.log('⛔️ 最长边未命中:', longest);
          }
          continue;
        }
        const isValid = evaluateExpression(rule.expression || [], context);
        if (isValid) {
          let fee = 0;
          if (rule.feeType === 'fixed') {
            fee = rule.value || 0;
          } else if (rule.feeType === 'perKg') {
            fee = (rule.value || 0) * context.weight;
          } else if (rule.feeType === 'percent') {
            fee = ((rule.value || 0) / 100) * context.declareValue;
          }
          extraFee += fee;
        }
      } catch (e) {
        console.error('附加费规则执行失败:', rule.name || '未知规则', e);
      }
    }
  }

  const totalCost = freightCost + extraFee;

  return {
    freightCost: parseFloat(freightCost.toFixed(2)) || 0,
    extraFee: parseFloat(extraFee.toFixed(2)) || 0,
    totalCost: parseFloat(totalCost.toFixed(2)) || 0,
    currency: channel.currency || 'CNY',
  };
}

// 创建运单
async function createWaybill(req, res) {
  try {
    const {
      waybillNumber,
      channelId,
      channelName,
      country,
      warehouse,
      boxCount,
      boxes,
      weight,
      volume,
      volumetricWeight,
      chargeWeight,
      length,
      width,
      height,
      hasBattery,
      hasMagnetic,
      hasDangerous,
      clientCode,
      company,
      recipient,
      address1,
      address2,
      address3,
      city,
      state,
      postalCode,
      phone,
      email,
      store,
      ref1,
      vat,
      currency,
      productName,
      attrs,
      notes,
      insurance,
      type,
      ioss,
      eori,
      senderId,
      senderName,
      declaredValue,
      ...rest
    } = req.body;

    if (rest.channel) delete rest.channel;

    if (type !== 'FBA') {
      return res.status(400).json({ success: false, error: '仅支持创建 FBA 运单' });
    }

    const requiredFields = {
      country: '国家',
      warehouse: '仓库地址',
      boxCount: '件数',
      recipient: '收件人',
    };
    const missingFields = Object.entries(requiredFields)
      .filter(
        ([field]) =>
          !req.body[field] ||
          (typeof req.body[field] === 'string' && req.body[field].trim() === ''),
      )
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      throw new Error(`以下必填字段缺失: ${missingFields.join('、')}`);
    }

    let finalChannelId = channelId;
    if (!finalChannelId && channelName) {
      const channel = await prisma.channel.findFirst({ where: { name: channelName } });
      if (!channel) throw new Error(`渠道名称 ${channelName} 不存在`);
      finalChannelId = channel.id;
    }
    if (!finalChannelId) throw new Error('必须提供有效的渠道 ID');

    const parsedBoxCount = parseInt(boxCount) || 1;
    if (parsedBoxCount < 1) throw new Error('件数必须为正整数');

    const channelData = await prisma.channel.findUnique({
      where: { id: finalChannelId },
      select: {
        id: true,
        chargeWeight: true,
        chargeVolume: true,
        chargePrice: true,
        unitType: true,
        extraFeeRules: true,
        rates: true,
        volRatio: true,
        chargeMethod: true,
        minCharge: true,
        decimal: true,
        rounding: true,
        compareMode: true,
        minBoxChargeWeight: true,
        maxBoxChargeWeight: true,
      },
    });
    if (!channelData) throw new Error(`未找到 ID 为 ${finalChannelId} 的渠道`);

    const shipmentData = {
      quantity: parsedBoxCount,
      weight: parseFloat(weight) || 0,
      chargeWeight: parseFloat(chargeWeight) || 0,
      length: parseFloat(length) || null,
      width: parseFloat(width) || null,
      height: parseFloat(height) || null,
      phone: phone || null,
      email: email || null,
      declaredValue: parseFloat(declaredValue) || null,
    };

    const validationErrors = validateShipmentAgainstChannel(shipmentData, channelData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, error: validationErrors.join('；') });
    }

    let finalBoxes = Array(parsedBoxCount)
      .fill({})
      .map((_, i) => ({
        code: `${i + 1}`,
        fullCode: `BX${String(i + 1).padStart(6, '0')}`,
        weight: null,
        length: null,
        width: null,
        height: null,
        hasBattery: false,
        declaredValue: 0.0,
        declaredQuantity: 1,
      }));

    if (Array.isArray(boxes)) {
      boxes.forEach((box, i) => {
        if (i < parsedBoxCount) {
          finalBoxes[i] = {
            ...finalBoxes[i],
            code: box.code || finalBoxes[i].code,
            fullCode: box.fullCode || finalBoxes[i].fullCode,
            weight: box.weight ? parseFloat(box.weight) : null,
            length: box.length ? parseFloat(box.length) : null,
            width: box.width ? parseFloat(box.width) : null,
            height: box.height ? parseFloat(box.height) : null,
            hasBattery: box.hasBattery || false,
            declaredValue: box.declaredValue ? parseFloat(box.declaredValue) : 0.0,
            declaredQuantity: box.declaredQuantity ? parseInt(box.declaredQuantity) : 1,
          };
        }
      });
    }

    const tenant = await prisma.tenant.findFirst();
    const customer = await prisma.user.findFirst();
    if (!tenant) throw new Error('未找到有效的租户，请先创建租户');
    if (!customer) throw new Error('未找到有效的客户，请先创建用户');

    if (senderId) {
      const sender = await prisma.customer.findUnique({ where: { id: senderId } });
      if (!sender) throw new Error(`发件人 ID ${senderId} 不存在`);
    }

    const freight = calculateFreight(
      { weight, chargeWeight, quantity: parsedBoxCount, declaredValue, boxes: finalBoxes },
      channelData,
    );
    const data = {
      id: waybillNumber || `WB${Date.now()}`,
      type: 'FBA',
      status: '已下单',
      recipient: recipient?.trim() || '',
      country: country || '',
      warehouse: warehouse || null,
      quantity: parseInt(boxCount, 10) || 1,
      weight: parseFloat(weight) || 0,
      volume: parseFloat(volume) || 0,
      volumetricWeight: parseFloat(volumetricWeight) || 0,
      chargeWeight: parseFloat(chargeWeight) || 0,
      length: parseFloat(length) || null,
      width: parseFloat(width) || null,
      height: parseFloat(height) || null,
      hasBattery: !!hasBattery,
      hasMagnetic: !!hasMagnetic,
      hasDangerous: !!hasDangerous,
      hasLiquid: false,
      hasPowder: false,
      clientCode: clientCode || null,
      company: company || null,
      phone: phone || null,
      email: email || null,
      store: store || null,
      vat: vat || null,
      ioss: ioss || null,
      eori: eori || null,
      senderName: senderName || null,
      currency: currency || null,
      productName: productName || null,
      category: null,
      attrs: Array.isArray(attrs) ? attrs : [],
      notes: notes || null,
      insurance: !!insurance,
      address1: address1 || null,
      address2: address2 || null,
      address3: address3 || null,
      addressDetail: null,
      city: city || null,
      state: state || null,
      postalCode: postalCode || null,
      declaredValue: parseFloat(declaredValue)?.toString() || null,
      declaredQuantity: null,
      isCOD: false,
      allowCustomerCancel: false,
      freightCost: typeof freight?.freightCost === 'number' ? freight.freightCost : null,
      extraFee: typeof freight?.extraFee === 'number' ? freight.extraFee : null,
      totalCost: typeof freight?.totalCost === 'number' ? freight.totalCost : null,
      createdAt: new Date(),
      boxes: [],
      waybillRuleId: null,
      waybillNumber: waybillNumber || null,
      billingPrecision: null,
      trackingNumber: null,
      labelUploaded: false,
      errors: [],
      senderId: null,
    };

    delete data.tenant;
    delete data.tenantInput;
    delete data.tenant_id;
    delete data.tenantRef;

    const cleanData = cleanPrismaData(data);
    console.log('🚧 cleanData 内容检查:', Object.keys(cleanData));

    const newWaybill = await prisma.fBAOrder.create({
      data: {
        ...cleanData,
        tenant: { connect: { id: tenantId } },
        customer: { connect: { id: customerId } },
        channel: { connect: { id: finalChannelId } },
        sender: senderId ? { connect: { id: senderId } } : undefined,
        boxes: {
          create: finalBoxes.map((box) => ({
            code: box.code,
            fullCode: box.fullCode,
            weight: box.weight || 0.0,
            length: box.length || null,
            width: box.width || null,
            height: box.height || null,
            hasBattery: box.hasBattery,
            declaredValue: box.declaredValue || 0.0,
            declaredQuantity: box.declaredQuantity || 1,
            productNameEn: '',
            productNameCn: '',
            material: '',
          })),
        },
        attachments: cleanData.attachments?.length
          ? {
              create: cleanData.attachments.map((att) => ({
                name: att.name,
                path: att.path,
                type: att.type || 'PDF',
              })),
            }
          : undefined,
      },
      include: { boxes: true, channel: true, sender: true },
    });

    await prisma.shipmentLog.create({
      data: {
        shipmentId: newWaybill.id,
        status: '已下单',
        remark: '运单创建成功',
        timestamp: new Date(),
      },
    });

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
async function updateShipment(req, res) {
  const { id } = req.params;
  const {
    client,
    senderId,
    senderName,
    vat,
    clientCode,
    company,
    phone,
    email,
    store,
    ref1,
    ioss,
    eori,
    currency,
    category,
    productName,
    attrs,
    notes,
    insurance,
    volume,
    volumetricWeight,
    chargeWeight,
    status,
  } = req.body;

  try {
    const shipment = await prisma.fBAOrder.findUnique({ where: { id } });
    if (!shipment) return res.status(404).json({ success: false, error: '运单不存在' });

    if (senderId) {
      const sender = await prisma.customer.findUnique({ where: { id: senderId } });
      if (!sender) throw new Error(`发件人 ID ${senderId} 不存在`);
    }

    const updatedData = {
      recipient: client,
      senderId: senderId || null,
      senderName: senderName || null,
      vat,
      clientCode,
      company,
      phone,
      email,
      store,
      ref1,
      ioss,
      eori,
      currency,
      category,
      productName,
      attrs,
      notes,
      insurance,
      volume: parseFloat(volume) || null,
      volumetricWeight: parseFloat(volumetricWeight) || null,
      chargeWeight: parseFloat(chargeWeight) || null,
      status: status || shipment.status,
    };

    const updatedShipment = await prisma.fBAOrder.update({
      where: { id },
      data: updatedData,
      include: { boxes: true, sender: true },
    });

    if (status && status !== shipment.status) {
      await prisma.shipmentLog.create({
        data: { shipmentId: id, status, remark: `运单状态变更为 ${status}` },
      });
    }

    res.json({ success: true, data: updatedShipment });
  } catch (error) {
    console.error('更新运单失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

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
          channel: true,
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
async function getSummary(req, res) {
  const { id } = req.params;
  try {
    const waybill = await prisma.fBAOrder.findUnique({
      where: { id },
      include: {
        boxes: true,
        channel: {
          select: {
            volRatio: true,
            cubeRatio: true,
            splitRatio: true,
            minCharge: true,
            chargeMethod: true,
            rounding: true,
            extraFeeRules: true,
            currency: true,
            rates: true,
            decimal: true,
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

    console.log('📦 当前运单渠道数据:', waybill.channel);
    console.log('📦 当前箱子数量:', waybill.boxes?.length);

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
            rates: true,
            extraFeeRules: true,
            chargePrice: true,
            chargeMethod: true,
            volRatio: true,
            minCharge: true,
            currency: true,
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
  createWaybill,
  updateShipment,
  updateBox,
  getSummary,
  getLogs,
  addLog,
  getStats,
  getWaybillById,
};
