export function cleanImportRecord(record: Record<string, any>): Record<string, any> {
  return {
    ...record,
    boxes: Array.isArray(record.boxes)
      ? record.boxes
      : record.boxes
        ? [{ code: String(record.boxes) }]
        : [],
    weight: record.weight ? parseFloat(record.weight) : undefined,
    length: record.length ? parseFloat(record.length) : undefined,
    width: record.width ? parseFloat(record.width) : undefined,
    height: record.height ? parseFloat(record.height) : undefined,
    declaredQuantity: record.declaredQuantity ? parseInt(record.declaredQuantity) : undefined,
    boxCount: record.boxCount ? parseInt(record.boxCount) : undefined,
    hasBattery: record.hasBattery === '是' || record.hasBattery === true,
    hasDangerous: record.hasDangerous === '是' || record.hasDangerous === true,
    insurance: record.insurance === '是' || record.insurance === true,
    // 未填字段保留原值，传 undefined，不设置默认值
  };
}
