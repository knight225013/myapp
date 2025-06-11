function applyRounding(value, precision, method) {
  const base = value / precision;
  switch (method) {
    case 'ceil':
      return Math.ceil(base) * precision;
    case 'floor':
      return Math.floor(base) * precision;
    case 'round':
    default:
      return Math.round(base) * precision;
  }
}

function applyChannelRules(realWeight, volumeWeight, channel) {
  const precision = parseFloat(channel?.decimal || '1');
  const rounding = channel?.rounding || 'ceil';
  const minCharge = parseFloat(channel?.minCharge || '0');
  const compareMode = channel?.compareMode || 'round_then_compare';
  const rates = Array.isArray(channel?.rates) ? channel.rates : [];

  // Step 1: Check for tiered pricing (rates)
  if (rates.length) {
    const rate = rates
      .filter((r) => realWeight >= r.minWeight && realWeight <= r.maxWeight)
      .sort((a, b) => a.priority - b.priority)[0];

    if (rate) {
      // Apply rounding and restrictions specific to the rate
      let chargeWeight;
      if (compareMode === 'round_then_compare') {
        const rw = applyRounding(realWeight, precision, rounding);
        const vw = applyRounding(volumeWeight, precision, rounding);
        chargeWeight = Math.max(rw, vw);
      } else {
        const max = Math.max(realWeight, volumeWeight);
        chargeWeight = applyRounding(max, precision, rounding);
      }

      // Apply min/max weight restrictions from the rate
      if (rate.minWeight && chargeWeight < rate.minWeight) {
        chargeWeight = rate.minWeight;
      }
      if (rate.maxWeight && chargeWeight > rate.maxWeight) {
        chargeWeight = rate.maxWeight;
      }

      // Calculate freight cost using rate's baseRate
      const freightCost = chargeWeight * rate.baseRate;

      return {
        chargeWeight,
        freightCost: parseFloat(freightCost.toFixed(2)),
      };
    }
  }

  // Step 2: Fallback to original chargeWeight calculation
  let chargeWeight;
  if (compareMode === 'round_then_compare') {
    const rw = applyRounding(realWeight, precision, rounding);
    const vw = applyRounding(volumeWeight, precision, rounding);
    chargeWeight = Math.max(rw, vw);
  } else {
    const max = Math.max(realWeight, volumeWeight);
    chargeWeight = applyRounding(max, precision, rounding);
  }

  // Apply min/max box weight restrictions
  if (channel?.minBoxChargeWeight && chargeWeight < channel.minBoxChargeWeight) {
    chargeWeight = channel.minBoxChargeWeight;
  }
  if (channel?.maxBoxChargeWeight && chargeWeight > channel.maxBoxChargeWeight) {
    chargeWeight = channel.maxBoxChargeWeight;
  }

  // Ensure minimum charge weight
  chargeWeight = Math.max(chargeWeight, minCharge);

  return { chargeWeight };
}

module.exports = { applyChannelRules };
