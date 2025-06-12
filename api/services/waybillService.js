const { PrismaClient } = require('@prisma/client');
const { calculateFreight } = require('../utils/freightUtils');
const { validateShipmentAgainstChannel } = require('../utils/channelValidation');
const { cleanPrismaData } = require('../utils/cleanPrismaInput');

const prisma = new PrismaClient();
const tenantId = 'b21918cb-9cb6-4482-ac33-19c70b2c0a12';
const customerId = '380080d7-68eb-4461-b607-8c7d365f3fd1';
const userId = 'some-user-id'; // 请替换为实际操作人ID

// 创建运单
async function createWaybill(data) {
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
  } = data;

  if (rest.channel) delete rest.channel;

  if (type !== 'FBA') {
    throw new Error('仅支持创建 FBA 运单');
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
        !data[field] ||
        (typeof data[field] === 'string' && data[field].trim() === ''),
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
    throw new Error(validationErrors.join('；'));
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
  const customer = await prisma.customer.findFirst();
  const user = await prisma.user.findFirst();
  if (!tenant) throw new Error('未找到有效的租户，请先创建租户');
  if (!customer) throw new Error('未找到有效的客户，请先创建客户');
  if (!user) throw new Error('未找到有效的操作人，请先创建用户');

  if (senderId) {
    const sender = await prisma.customer.findUnique({ where: { id: senderId } });
    if (!sender) throw new Error(`发件人 ID ${senderId} 不存在`);
  }

  const freight = calculateFreight(
    { weight, chargeWeight, quantity: parsedBoxCount, declaredValue, boxes: finalBoxes },
    channelData,
  );

  const waybillData = {
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

  delete waybillData.tenant;
  delete waybillData.tenantInput;
  delete waybillData.tenant_id;
  delete waybillData.tenantRef;

  const cleanData = cleanPrismaData(waybillData);

  const newWaybill = await prisma.fBAOrder.create({
    data: {
      ...cleanData,
      tenant: { connect: { id: tenant.id } },
      customer: { connect: { id: customer.id } },
      user: { connect: { id: user.id } },
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

  return newWaybill;
}

// 更新运单
async function updateShipment(id, data) {
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
  } = data;

  const shipment = await prisma.fBAOrder.findUnique({ where: { id } });
  if (!shipment) throw new Error('运单不存在');

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

  return updatedShipment;
}

module.exports = {
  createWaybill,
  updateShipment,
};