const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const { v4: uuid } = require('uuid');

const prisma = new PrismaClient();

async function getChannels() {
  const channels = await prisma.channel.findMany({ include: { rates: true } });
  return channels;
}

async function createChannel(data) {
  // 验证渠道名称唯一性
  const existingChannel = await prisma.channel.findUnique({
    where: { name: data.name },
  });
  if (existingChannel) {
    throw new Error('渠道名称已存在');
  }

  // 验证 rates 数据
  if (data.rates?.length) {
    for (const rate of data.rates) {
      if (rate.minWeight > rate.maxWeight) {
        throw new Error('最低重量不能大于最高重量');
      }
      if (!rate.weightType || rate.baseRate < 0) {
        throw new Error('重量单位和基础费率无效');
      }
    }
  }

  // 验证运费字段
  if (data.chargePrice && data.chargePrice < 0) {
    throw new Error('收费价格不能为负数');
  }
  if (data.unitType && !['KG', 'CBM'].includes(data.unitType)) {
    throw new Error('计费单位无效');
  }
  if (data.chargeWeight && data.chargeWeight < 0) {
    throw new Error('收费重量不能为负数');
  }
  if (data.chargeVolume && data.chargeVolume < 0) {
    throw new Error('收费体积不能为负数');
  }

  const channel = await prisma.channel.create({
    data: {
      id: uuid(),
      name: data.name,
      code: data.code,
      type: data.type,
      country: data.country,
      warehouse: data.warehouse,
      origin: data.origin,
      currency: data.currency,
      decimal: data.decimal,
      method: data.method,
      rounding: data.rounding,
      compareMode: data.compareMode,
      volRatio: data.volRatio,
      cubeRatio: data.cubeRatio,
      splitRatio: data.splitRatio,
      chargeMethod: data.chargeMethod,
      minCharge: data.minCharge,
      ticketPrecision: data.ticketPrecision,
      boxPrecision: data.boxPrecision,
      sizePrecision: data.sizePrecision,
      minPieces: data.minPieces,
      maxPieces: data.maxPieces,
      minBoxRealWeight: data.minBoxRealWeight,
      minBoxMaterialWeight: data.minBoxMaterialWeight,
      minBoxChargeWeight: data.minBoxChargeWeight,
      minBoxAvgWeight: data.minBoxAvgWeight,
      minTicketChargeWeight: data.minTicketChargeWeight,
      maxTicketChargeWeight: data.maxTicketChargeWeight,
      minTicketRealWeight: data.minTicketRealWeight,
      maxTicketRealWeight: data.maxTicketRealWeight,
      minBoxRealWeightLimit: data.minBoxRealWeightLimit,
      maxBoxRealWeight: data.maxBoxRealWeight,
      minBoxChargeWeightLimit: data.minBoxChargeWeightLimit,
      maxBoxChargeWeight: data.maxBoxChargeWeight,
      minDeclareValue: data.minDeclareValue,
      maxDeclareValue: data.maxDeclareValue,
      aging: data.aging,
      waybillRuleId: data.waybillRule,
      labelCode: data.labelCode,
      assignedUser: data.assignedUser,
      userLevel: data.userLevel,
      declareCurrency: data.declareCurrency,
      defaultDeclareCurrency: data.defaultDeclareCurrency,
      sender: data.sender,
      showWeight: data.showWeight,
      showSize: data.showSize,
      requireWeight: data.requireWeight,
      requireSize: data.requireSize,
      requirePhone: data.requirePhone,
      requireEmail: data.requireEmail,
      requirePackingList: data.requirePackingList,
      verifySalesLink: data.verifySalesLink,
      verifyImageLink: data.verifyImageLink,
      requireVAT: data.requireVAT,
      requireVATFiling: data.requireVATFiling,
      requireEORI: data.requireEORI,
      enableBilling: data.enableBilling,
      showBilling: data.showBilling,
      controlBilling: data.controlBilling,
      controlReceivingFee: data.controlReceivingFee,
      promptUnderpayment: data.promptUnderpayment,
      modifyVolRatio: data.modifyVolRatio,
      showSupplierData: data.showSupplierData,
      orderBySKULibrary: data.orderBySKULibrary,
      allowCancel: data.allowCancel,
      noAutoCancelAPIFail: data.noAutoCancelAPIFail,
      allowChannelChange: data.allowChannelChange,
      allowEdit: data.allowEdit,
      allowTrackingEntry: data.allowTrackingEntry,
      allowLabelUpload: data.allowLabelUpload,
      hideCarrier: data.hideCarrier,
      refundOnReturn: data.refundOnReturn,
      noRefundOnCancel: data.noRefundOnCancel,
      showInWMS: data.showInWMS,
      enableCOD: data.enableCOD,
      restrictWarehouseCode: data.restrictWarehouseCode,
      roundBeforeSplit: data.roundBeforeSplit,
      chargeWeight: data.chargeWeight,
      chargeVolume: data.chargeVolume,
      chargePrice: data.chargePrice,
      unitType: data.unitType,
      extraFeeRules: data.feeRules || [],
      rates: {
        create:
          data.rates?.map((rate) => ({
            id: rate.id || uuid(),
            minWeight: rate.minWeight,
            maxWeight: rate.maxWeight,
            weightType: rate.weightType,
            divisor: rate.divisor,
            sideRule: rate.sideRule,
            extraFee: rate.extraFee,
            baseRate: rate.baseRate,
            taxRate: rate.taxRate,
            otherFee: rate.otherFee,
            priority: rate.priority,
          })) || [],
      },
    },
  });
  return channel;
}

async function updateChannel(id, data) {
  // 验证 rates 数据
  if (data.rates?.length) {
    for (const rate of data.rates) {
      if (rate.minWeight > rate.maxWeight) {
        throw new Error('最低重量不能大于最高重量');
      }
      if (!rate.weightType || rate.baseRate < 0) {
        throw new Error('重量单位和基础费率无效');
      }
    }
  }

  // 验证运费字段
  if (data.chargePrice && data.chargePrice < 0) {
    throw new Error('收费价格不能为负数');
  }
  if (data.unitType && !['KG', 'CBM'].includes(data.unitType)) {
    throw new Error('计费单位无效');
  }
  if (data.chargeWeight && data.chargeWeight < 0) {
    throw new Error('收费重量不能为负数');
  }
  if (data.chargeVolume && data.chargeVolume < 0) {
    throw new Error('收费体积不能为负数');
  }

  const updated = await prisma.$transaction(async (prisma) => {
    await prisma.rateRule.deleteMany({ where: { channelId: id } });
    return prisma.channel.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        country: data.country,
        warehouse: data.warehouse,
        origin: data.origin,
        currency: data.currency,
        decimal: data.decimal,
        method: data.method,
        rounding: data.rounding,
        compareMode: data.compareMode,
        volRatio: data.volRatio,
        cubeRatio: data.cubeRatio,
        splitRatio: data.splitRatio,
        chargeMethod: data.chargeMethod,
        minCharge: data.minCharge,
        ticketPrecision: data.ticketPrecision,
        boxPrecision: data.boxPrecision,
        sizePrecision: data.sizePrecision,
        minPieces: data.minPieces,
        maxPieces: data.maxPieces,
        minBoxRealWeight: data.minBoxRealWeight,
        minBoxMaterialWeight: data.minBoxMaterialWeight,
        minBoxChargeWeight: data.minBoxChargeWeight,
        minBoxAvgWeight: data.minBoxAvgWeight,
        minTicketChargeWeight: data.minTicketChargeWeight,
        maxTicketChargeWeight: data.maxTicketChargeWeight,
        minTicketRealWeight: data.minTicketRealWeight,
        maxTicketRealWeight: data.maxTicketRealWeight,
        minBoxRealWeightLimit: data.minBoxRealWeightLimit,
        maxBoxRealWeight: data.maxBoxRealWeight,
        minBoxChargeWeightLimit: data.minBoxChargeWeightLimit,
        maxBoxChargeWeight: data.maxBoxChargeWeight,
        minDeclareValue: data.minDeclareValue,
        maxDeclareValue: data.maxDeclareValue,
        aging: data.aging,
        waybillRuleId: data.waybillRule,
        labelCode: data.labelCode,
        assignedUser: data.assignedUser,
        userLevel: data.userLevel,
        declareCurrency: data.declareCurrency,
        defaultDeclareCurrency: data.defaultDeclareCurrency,
        sender: data.sender,
        showWeight: data.showWeight,
        showSize: data.showSize,
        requireWeight: data.requireWeight,
        requireSize: data.requireSize,
        requirePhone: data.requirePhone,
        requireEmail: data.requireEmail,
        requirePackingList: data.requirePackingList,
        verifySalesLink: data.verifySalesLink,
        verifyImageLink: data.verifyImageLink,
        requireVAT: data.requireVAT,
        requireVATFiling: data.requireVATFiling,
        requireEORI: data.requireEORI,
        enableBilling: data.enableBilling,
        showBilling: data.showBilling,
        controlBilling: data.controlBilling,
        controlReceivingFee: data.controlReceivingFee,
        promptUnderpayment: data.promptUnderpayment,
        modifyVolRatio: data.modifyVolRatio,
        showSupplierData: data.showSupplierData,
        orderBySKULibrary: data.orderBySKULibrary,
        allowCancel: data.allowCancel,
        noAutoCancelAPIFail: data.noAutoCancelAPIFail,
        allowChannelChange: data.allowChannelChange,
        allowEdit: data.allowEdit,
        allowTrackingEntry: data.allowTrackingEntry,
        allowLabelUpload: data.allowLabelUpload,
        hideCarrier: data.hideCarrier,
        refundOnReturn: data.refundOnReturn,
        noRefundOnCancel: data.noRefundOnCancel,
        showInWMS: data.showInWMS,
        enableCOD: data.enableCOD,
        restrictWarehouseCode: data.restrictWarehouseCode,
        roundBeforeSplit: data.roundBeforeSplit,
        chargeWeight: data.chargeWeight,
        chargeVolume: data.chargeVolume,
        chargePrice: data.chargePrice,
        unitType: data.unitType,
        extraFeeRules: data.feeRules || [],
        rates: {
          create:
            data.rates?.map((rate) => ({
              id: rate.id || uuid(),
              minWeight: rate.minWeight,
              maxWeight: rate.maxWeight,
              weightType: rate.weightType,
              divisor: rate.divisor,
              sideRule: rate.sideRule,
              extraFee: rate.extraFee,
              baseRate: rate.baseRate,
              taxRate: rate.taxRate,
              otherFee: rate.otherFee,
              priority: rate.priority,
            })) || [],
        },
      },
      include: { rates: true },
    });
  });

  return updated;
}

async function deleteChannel(id) {
  await prisma.$transaction(async (prisma) => {
    await prisma.rateRule.deleteMany({ where: { channelId: id } });
    await prisma.channel.delete({ where: { id } });
  });
}

async function estimateCost(length, width, height, weight, country, warehouse, origin) {
  const channels = await prisma.channel.findMany({
    where: {
      OR: [
        { country: null, warehouse: null, origin: null },
        { country, warehouse: null, origin: null },
        { country, warehouse, origin: null },
        { country, warehouse, origin },
      ],
    },
    include: { rates: true },
  });

  const results = channels
    .map((channel) => {
      const volume = (length * width * height) / 1000000; // Convert to cubic meters
      let freightCost = 0;
      if (channel.chargePrice) {
        freightCost =
          channel.unitType === 'KG' && channel.chargeWeight
            ? channel.chargePrice * channel.chargeWeight
            : channel.unitType === 'CBM' && channel.chargeVolume
              ? channel.chargePrice * channel.chargeVolume
              : 0;
      }

      const matchingRules = channel.rates
        .filter((rate) => weight >= rate.minWeight && weight <= rate.maxWeight)
        .sort((a, b) => a.priority - b.priority);

      if (!matchingRules.length && !channel.chargePrice) return null;

      let rateBase = 0;
      let chargeWeight = 0;
      let tax = 0;
      let extraFee = 0;
      let otherFee = 0;

      if (matchingRules.length) {
        const rate = matchingRules[0];
        const volumeWeight = rate.divisor ? (length * width * height) / rate.divisor : 0;
        chargeWeight = rate.weightType === 'KG' ? Math.max(weight, volumeWeight) : volume;
        rateBase = chargeWeight * rate.baseRate;
        tax = ((rate.taxRate || 0) / 100) * rateBase;
        extraFee = rate.extraFee || 0;
        otherFee = rate.otherFee || 0;
      }

      const total = freightCost + rateBase + extraFee + otherFee + tax;

      return {
        channelId: channel.id,
        channelName: channel.name,
        currency: channel.currency,
        chargeWeight,
        freightCost,
        rateBase,
        tax,
        extraFee,
        otherFee,
        total,
      };
    })
    .filter((result) => result !== null);

  return results;
}

async function exportChannels() {
  const channels = await prisma.channel.findMany({ include: { rates: true } });
  const data = channels.flatMap((channel) =>
    channel.rates.map((rate) => ({
      channelName: channel.name,
      type: channel.type,
      country: channel.country || '',
      warehouse: channel.warehouse || '',
      origin: channel.origin || '',
      currency: channel.currency,
      chargeWeight: channel.chargeWeight || '',
      chargeVolume: channel.chargeVolume || '',
      chargePrice: channel.chargePrice || '',
      unitType: channel.unitType || '',
      minWeight: rate.minWeight,
      maxWeight: rate.maxWeight,
      weightType: rate.weightType,
      divisor: rate.divisor || '',
      sideRule: rate.sideRule || '',
      extraFee: rate.extraFee || 0,
      baseRate: rate.baseRate,
      taxRate: rate.taxRate || 0,
      otherFee: rate.otherFee || 0,
      priority: rate.priority,
    })),
  );

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Channels');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

  return buffer;
}

async function importChannels(file) {
  const workbook = XLSX.read(file, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  await prisma.$transaction(async (prisma) => {
    for (const row of data) {
      const {
        channelName,
        type,
        country,
        warehouse,
        origin,
        currency,
        chargeWeight,
        chargeVolume,
        chargePrice,
        unitType,
        ...rateData
      } = row;
      const channel = await prisma.channel.upsert({
        where: { name: channelName },
        update: {},
        create: {
          name: channelName,
          type,
          country: country || null,
          warehouse: warehouse || null,
          origin: origin || null,
          currency,
          chargeWeight: chargeWeight ? parseFloat(chargeWeight) : null,
          chargeVolume: chargeVolume ? parseFloat(chargeVolume) : null,
          chargePrice: chargePrice ? parseFloat(chargePrice) : null,
          unitType: unitType || null,
        },
      });

      await prisma.rateRule.create({
        data: {
          channelId: channel.id,
          minWeight: parseFloat(rateData.minWeight),
          maxWeight: parseFloat(rateData.maxWeight),
          weightType: rateData.weightType,
          divisor: rateData.divisor ? parseInt(rateData.divisor) : null,
          sideRule: rateData.sideRule || null,
          extraFee: rateData.extraFee ? parseFloat(rateData.extraFee) : null,
          baseRate: parseFloat(rateData.baseRate),
          taxRate: rateData.taxRate ? parseFloat(rateData.taxRate) : null,
          otherFee: rateData.otherFee ? parseFloat(rateData.otherFee) : null,
          priority: parseInt(rateData.priority),
        },
      });
    }
  });
}

async function getWaybillRules() {
  const rules = await prisma.waybillRule.findMany({
    select: { id: true, name: true },
  });
  return rules;
}

module.exports = {
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel,
  estimateCost,
  exportChannels,
  importChannels,
  getWaybillRules,
};