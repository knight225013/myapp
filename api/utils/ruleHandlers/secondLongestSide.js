// src/utils/ruleHandlers/secondLongestSide.js

module.exports = function (order, rule) {
  const { field, min, max, price } = rule.params || {};
  if (!field || price === undefined) return 0;

  // Extract dimensions
  const dimensions = [
    Number(order.length || 0),
    Number(order.width || 0),
    Number(order.height || 0),
  ].filter((val) => !isNaN(val) && val > 0);

  if (dimensions.length < 2) return 0;

  // Sort to find second longest side
  dimensions.sort((a, b) => b - a);
  const secondLongest = dimensions[1];

  if (secondLongest >= (min || 0) && (max === undefined || secondLongest <= max)) {
    return Number(price);
  }

  return 0;
};
