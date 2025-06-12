// scripts/cronJob.js
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { runBatchTracking } = require('../crawler/parallelRunner');

const prisma = new PrismaClient();

// 每 3 小时执行一次
cron.schedule('0 */3 * * *', async () => {
  console.log('开始批量轨迹更新任务:', new Date().toISOString());

  try {
    const orders = await prisma.fBAOrder.findMany({
      where: {
        status: { in: ['已下单', '运输中'] },
        trackingNumber: { not: null },
      },
      select: {
        trackingNumber: true,
        id: true,
        carrier: { select: { code: true } },
      },
    });

    if (orders.length === 0) {
      console.log('无待更新运单');
      return;
    }

    const formattedOrders = orders.map((order) => ({
      trackingNumber: order.trackingNumber,
      carrier: order.carrier?.code || 'sagawa',
    }));

    const results = await runBatchTracking(formattedOrders);

    // 处理结果并写入数据库
    for (const { trackingNumber, result } of results) {
      if (result.error) {
        console.error(`运单 ${trackingNumber} 失败: ${result.error}`);
        continue;
      }

      const order = orders.find((o) => o.trackingNumber === trackingNumber);
      const trackingEvents = result.find((item) => item.tracking_events)?.tracking_events || [];
      const activeStatus = result.find((item) => item.special_note === '当前活跃物流状态');

      // 写入 ShipmentLog
      for (const event of trackingEvents) {
        const { status, time, location } = event;
        const exists = await prisma.shipmentLog.findFirst({
          where: {
            shipmentId: order.id,
            status,
            location,
            timestamp: time ? new Date(time) : undefined,
          },
        });

        if (!exists) {
          await prisma.shipmentLog.create({
            data: {
              shipmentId: order.id,
              status,
              remark: `从 AfterShip 爬取 (${formattedOrders.find((o) => o.trackingNumber === trackingNumber).carrier})`,
              location,
              timestamp: time ? new Date(time) : new Date(),
            },
          });
        }
      }

      // 更新 FBAOrder 状态
      if (activeStatus) {
        let newStatus = null;
        if (activeStatus.mapped_status?.includes('已签收')) {
          newStatus = '已签收';
        } else if (activeStatus.mapped_status?.includes('运输中')) {
          newStatus = '运输中';
        } else if (
          activeStatus.mapped_status?.includes('投递失败') ||
          activeStatus.mapped_status?.includes('异常')
        ) {
          newStatus = '退件';
        } else if (activeStatus.mapped_status?.includes('待处理')) {
          newStatus = '已下单';
        }

        if (newStatus) {
          await prisma.fBAOrder.update({
            where: { id: order.id },
            data: { status: newStatus },
          });
        }
      }
    }

    console.log('✅ 批量轨迹更新完成，总数:', results.length);
  } catch (error) {
    console.error('定时任务错误:', error);
  }
});

console.log('定时任务已启动，每 3 小时更新物流轨迹');
