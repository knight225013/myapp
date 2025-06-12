// crawler/trackAndStore.js
const { chromium } = require('playwright');

// 颜色到状态的映射
const colorMap = {
  '#214977': '待处理 Pending',
  '#65AEE0': '运输中 In transit',
  '#F5A551': '派送中 Out for delivery',
  '#EF7414': '可自取 Available for pickup',
  '#B789C7': '投递失败 Failed attempt',
  '#4CBB87': '已签收 Delivered',
  '#CCCCCC': '待处理 Pending',
  '#616E7D': '已过期 Expired',
  '#D26759': '异常 Exception',
};

module.exports = async function trackAndStoreTrackingNumber(
  trackingNumber,
  carrier = 'sagawa',
  page,
) {
  let trackingData = [];

  try {
    // 访问 AfterShip 页面
    const url = `https://www.aftership.com/track/${carrier}/${trackingNumber}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(6000); // 等待 6 秒确保 JS 加载

    // 检查是否为无效运单
    const errorText = await page.textContent('div.text-center');
    if (errorText && /Tracking information is not available/i.test(errorText)) {
      trackingData.push({ error: '无效运单或未被收录' });
      return trackingData;
    }

    // 提取状态图标部分
    const statusItems = await page.$$('div.text-base.font-medium.flex.items-center.mt-2');
    let activeStatus = null;

    if (statusItems && statusItems.length > 0) {
      for (const item of statusItems) {
        const style = await item.getAttribute('style');
        const colorMatch = style ? style.match(/color:\s*rgb\(([^)]+)\)/) : null;
        const rgbColor = colorMatch ? colorMatch[1] : '未知RGB';

        const circle = await item.$('svg circle');
        const fillColor = circle ? await circle.getAttribute('fill') : '未知';

        const span = await item.$('span');
        const countText = span ? (await span.textContent()).replace(/[()]/g, '') : '0';
        const count = parseInt(countText) || 0;

        let statusText = '未知状态';
        const tooltip = await item.evaluateHandle((el) =>
          el.closest('.svelte-1avzldp')?.querySelector('.tooltip-content-v2 .font-semibold'),
        );
        if (tooltip) {
          const tooltipText = await tooltip.textContent();
          statusText = tooltipText.trim();
        }

        const mapped = colorMap[fillColor] || statusText;

        if (count === 1) {
          activeStatus = {
            color: fillColor,
            rgb_color: rgbColor,
            count: count,
            status: statusText,
            mapped_status: mapped,
          };
        }

        trackingData.push({
          color: fillColor,
          rgb_color: rgbColor,
          count: count,
          status: statusText,
          mapped_status: mapped,
        });
      }

      if (activeStatus) {
        trackingData.unshift({
          special_note: '当前活跃物流状态',
          ...activeStatus,
        });
      }
    }

    // 提取物流轨迹列表
    const trackingEvents = [];
    const blocks = await page.$$('div[class*="tracking-timeline"] > div');

    for (const block of blocks) {
      const statusEl = await block.$('div.font-semibold');
      const timeEl = await block.$('p');
      const locationEl = await block.$('div:not([class*="font-semibold"])');

      const status = statusEl
        ? (await statusEl.textContent())?.replace(/⇒|↓/g, '').trim()
        : '未知状态';
      const timeText = timeEl ? (await timeEl.textContent())?.trim() : '';
      const time = timeText ? new Date(timeText).toISOString() : null;
      const location = locationEl
        ? (await locationEl.textContent())?.replace(/^·\s*/, '').trim()
        : '未知地点';

      trackingEvents.push({
        status,
        time,
        location,
      });
    }

    if (trackingEvents.length > 0) {
      trackingData.push({
        special_note: '📦 物流轨迹列表',
        tracking_events: trackingEvents,
      });
    } else {
      trackingData.push({
        special_note: '📦 无轨迹数据，可能尚未发货或页面结构已更新',
        tracking_events: [],
      });
    }

    return trackingData;
  } catch (e) {
    trackingData.push({
      error: `运行错误: ${e.message}`,
    });
    return trackingData;
  }
};
