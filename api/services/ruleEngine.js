// src/services/ruleEngine.js

const ruleHandlers = require('../utils/ruleHandlers');

function calculateExtraFees(orderData, rules) {
  let totalFee = 0;

  if (!Array.isArray(rules)) {
    console.warn('No valid extraFeeRules provided');
    return totalFee;
  }

  for (const rule of rules) {
    const handler = ruleHandlers[rule.type];
    if (!handler) {
      console.warn(`Unknown rule type: ${rule.type}`);
      continue;
    }

    try {
      const fee = handler(orderData, rule);
      if (typeof fee === 'number' && !isNaN(fee)) {
        totalFee += fee;
      }
    } catch (err) {
      console.error(`Error calculating rule: ${rule.name || rule.type}`, err);
    }
  }

  return totalFee;
}

module.exports = {
  calculateExtraFees,
};
