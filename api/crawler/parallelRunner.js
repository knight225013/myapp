// crawler/parallelRunner.js
const { chromium } = require('playwright');
const trackAndStoreTrackingNumber = require('./trackAndStore');
const pLimit = require('p-limit').default;

const CONCURRENCY = 20; // 并发限制

async function runBatchTracking(orders) {
  const browser = await chromium.launch({ headless: true });
  const limit = pLimit(CONCURRENCY);
  let results = []; // ✅ 改为 let

  try {
    const tasks = orders.map((order) =>
      limit(async () => {
        const page = await browser.newPage();
        try {
          const res = await trackAndStoreTrackingNumber(
            order.trackingNumber,
            order.carrier || 'sagawa',
            page,
          );
          console.log(`✅ 运单 ${order.trackingNumber} 完成`);
          return { trackingNumber: order.trackingNumber, result: res };
        } catch (error) {
          console.error(`❌ 运单 ${order.trackingNumber} 失败: ${error.message}`);
          return { trackingNumber: order.trackingNumber, error: error.message };
        } finally {
          await page.close();
        }
      }),
    );

    results = await Promise.all(tasks); // ✅ 赋值给 let 变量
  } finally {
    await browser.close();
  }

  return results;
}

module.exports = { runBatchTracking };
