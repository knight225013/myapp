// src/utils/renderWithTemplate.js

const Handlebars = require('handlebars');

exports.renderWithTemplate = function (templateContent, data) {
  try {
    // 注册常用 helper（如果需要）
    Handlebars.registerHelper('uppercase', (str) => str.toUpperCase());
    Handlebars.registerHelper('lowercase', (str) => str.toLowerCase());

    // 编译模板
    const template = Handlebars.compile(templateContent);

    // 渲染数据
    const renderedHtml = template(data);

    return renderedHtml;
  } catch (error) {
    throw new Error(`模板渲染失败: ${error.message}`);
  }
};
