// api/utils/ruleHandlers/longestSide.js

module.exports = function (box, rule) {
    const { min, max, price } = rule.params || {};
    if (price === undefined) return 0;
  
    const longest = Math.max(box.length || 0, box.width || 0, box.height || 0);
  
    if (longest >= (min || 0) && (max === undefined || longest < max)) {
      return Number(price);
    }
  
    return 0;
  };