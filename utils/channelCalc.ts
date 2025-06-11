export function applyChannelRules(rawWeight: number, channel: any): number {
  const precision = parseFloat(channel?.decimal || '1');
  const rounding = channel?.rounding || 'ceil';
  const minCharge = parseFloat(channel?.minCharge || '0');

  let finalWeight = rawWeight;

  if (rounding === 'ceil') {
    finalWeight = Math.ceil(finalWeight / precision) * precision;
  } else if (rounding === 'floor') {
    finalWeight = Math.floor(finalWeight / precision) * precision;
  } else {
    finalWeight = Math.round(finalWeight / precision) * precision;
  }

  return Math.max(finalWeight, minCharge);
}
