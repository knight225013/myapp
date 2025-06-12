// src/utils/ruleHandlers/dimensionSum.js

module.exports = function (order, rule) {
  const { min, max, price } = rule.params || {};
  if (price === undefined) return 0;

  // Calculate sum of dimensions
  const sum = [
    Number(order.length || 0),
    Number(order.width || 0),
    Number(order.height || 0),
  ].reduce((acc, val) => acc + (isNaN(val) ? 0 : val), 0);

  if (sum >= (min || 0) && (max === undefined || sum <= max)) {
    return Number(price);
  }

  return 0;
};
