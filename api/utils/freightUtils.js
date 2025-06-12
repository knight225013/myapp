const { evaluateExpression } = require('./expressionUtils');
const { applyChannelRules } = require('./channelUtils');

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

module.exports = {
  calculateFreight,
};