const weight = require('./weight');
const dimensionSum = require('./dimensionSum');
const secondLongestSide = require('./secondLongestSide');
const longestSide = require('./longestSide'); // 👈 新增

module.exports = {
  weight,
  dimensionSum,
  secondLongestSide,
  longestSide, // 👈 注册进去
};
