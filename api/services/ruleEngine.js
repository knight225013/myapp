// api/services/ruleEngine.js

const ruleHandlers = require('../utils/ruleHandlers');

function calculateExtraFees(order, rules = []) {
  let totalFee = 0;

  if (!Array.isArray(rules) || !rules.length) return totalFee;

  for (const rule of rules) {
    const handler = ruleHandlers[rule.type];
    if (!handler) {
      console.warn(`❗ 无效规则类型: ${rule.type}`);
      continue;
    }

    try {
      const isPerBox = rule.params?.chargeUnit === 'box';

      if (isPerBox && Array.isArray(order.boxes)) {
        for (const box of order.boxes) {
          const fee = handler(box, rule);
          if (typeof fee === 'number' && fee > 0) {
            totalFee += fee;
            break; // 命中一个规则就停止
          }
        }
      } else {
        const fee = handler(order, rule);
        if (typeof fee === 'number' && fee > 0) {
          totalFee += fee;
        }
      }
    } catch (err) {
      console.error(`❌ 计算规则失败: ${rule.name || rule.type}`, err);
    }
  }

  return totalFee;
}

module.exports = {
  calculateExtraFees,
};
