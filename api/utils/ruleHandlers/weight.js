// src/utils/ruleHandlers/weight.js

module.exports = function (order, rule) {
  const { min, max, price } = rule.params || {};
  if (price === undefined) return 0;

  const weight = Number(order.weight || 0);
  if (isNaN(weight)) return 0;

  if (weight >= (min || 0) && (max === undefined || weight <= max)) {
    return Number(price);
  }

  return 0;
};
