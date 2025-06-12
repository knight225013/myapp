// 计算箱子汇总字段
function calculateBoxSummary(boxes, channel) {
  const volRatio = channel?.volRatio || 6000;

  const totalWeight = boxes.reduce((sum, box) => sum + (box.weight || 0), 0);
  const volume = boxes.reduce((sum, box) => {
    const l = box.length || 0;
    const w = box.width || 0;
    const h = box.height || 0;
    return sum + (l * w * h) / 1000000;
  }, 0);
  const volumetricWeight = boxes.reduce((sum, box) => {
    const l = box.length || 0;
    const w = box.width || 0;
    const h = box.height || 0;
    return sum + (l * w * h) / volRatio;
  }, 0);

  return { totalWeight, volume, volumetricWeight };
}

module.exports = { calculateBoxSummary };
