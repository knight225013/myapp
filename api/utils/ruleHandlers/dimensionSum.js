module.exports = function (box, rule) {
  const { min, max, price } = rule.params || {};
  if (price === undefined) return 0;

  const sum = [Number(box.length || 0), Number(box.width || 0), Number(box.height || 0)]
    .reduce((acc, val) => acc + (isNaN(val) ? 0 : val), 0);

  if (sum >= (min || 0) && (max === undefined || sum <= max)) {
    return Number(price);
  }

  return 0;
};
