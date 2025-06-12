function validateShipmentAgainstChannel(shipment, channel) {
  const errors = [];

  // 件数限制
  if (channel.minPieces && shipment.quantity < channel.minPieces) {
    errors.push(`件数不能少于最小限制：${channel.minPieces}`);
  }
  if (channel.maxPieces && shipment.quantity > channel.maxPieces) {
    errors.push(`件数不能大于最大限制：${channel.maxPieces}`);
  }

  // 箱实重限制
  if (channel.minBoxRealWeight && shipment.weight < channel.minBoxRealWeight) {
    errors.push(`箱子实重低于最小限制：${channel.minBoxRealWeight}kg`);
  }
  if (channel.maxBoxRealWeight && shipment.weight > channel.maxBoxRealWeight) {
    errors.push(`箱子实重大于最大限制：${channel.maxBoxRealWeight}kg`);
  }

  // 箱收费重限制
  if (channel.minBoxChargeWeight && shipment.chargeWeight < channel.minBoxChargeWeight) {
    errors.push(`箱子收费重低于最小限制：${channel.minBoxChargeWeight}kg`);
  }
  if (channel.maxBoxChargeWeight && shipment.chargeWeight > channel.maxBoxChargeWeight) {
    errors.push(`箱子收费重超过最大限制：${channel.maxBoxChargeWeight}kg`);
  }

  // 必填字段检查
  if (channel.requirePhone && !shipment.phone) {
    errors.push(`手机号为必填`);
  }
  if (channel.requireEmail && !shipment.email) {
    errors.push(`邮箱为必填`);
  }
  if (channel.requireWeight && !shipment.weight) {
    errors.push(`实重为必填`);
  }
  if (channel.requireSize && (!shipment.length || !shipment.width || !shipment.height)) {
    errors.push(`长宽高必须填写`);
  }

  // 申报价值限制
  if (channel.minDeclareValue && shipment.declaredValue < channel.minDeclareValue) {
    errors.push(`申报价值低于最小限制：${channel.minDeclareValue}`);
  }
  if (channel.maxDeclareValue && shipment.declaredValue > channel.maxDeclareValue) {
    errors.push(`申报价值高于最大限制：${channel.maxDeclareValue}`);
  }

  return errors;
}

module.exports = { validateShipmentAgainstChannel };
