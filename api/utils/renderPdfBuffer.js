// src/utils/renderPdfBuffer.js

const puppeteer = require('puppeteer');

exports.renderPdfBuffer = async function (html, width, height) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new', // 新版 Puppeteer 推荐设置
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' }); // 等待页面资源加载完成

    const pdfBuffer = await page.pdf({
      width: `${width}mm`,
      height: `${height}mm`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return pdfBuffer;
  } catch (error) {
    throw new Error(`PDF 生成失败: ${error.message}`);
  } finally {
    if (browser) await browser.close(); // 确保关闭 browser，避免资源泄露
  }
};
