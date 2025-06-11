// controllers/trackController.js
const { PrismaClient } = require('@prisma/client');
const { runBatchTracking } = require('../crawler/parallelRunner');
const prisma = new PrismaClient();

exports.updateTrackByNumber = async (req, res) => {
  const { trackingNumber, carrier } = req.body;
  if (!trackingNumber || !carrier) {
    return res.status(400).json({ success: false, error: '缺少 trackingNumber 或 carrier' });
  }

  try {
    // 查找订单
    const order = await prisma.fBAOrder.findFirst({
      where: { trackingNumber },
    });
    if (!order) {
      return res.status(404).json({ success: false, error: '运单未找到' });
    }

    // 调用批量爬虫（单条包装为数组）
    const results = await runBatchTracking([{ trackingNumber, carrier }]);
    const result = results[0];

    if (result.error) {
      return res.status(500).json({ success: false, error: result.error });
    }

    // 处理爬虫返回的轨迹数据
    const trackingEvents =
      result.result.find((item) => item.tracking_events)?.tracking_events || [];
    const activeStatus = result.result.find((item) => item.special_note === '当前活跃物流状态');

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
            remark: `从 AfterShip 爬取 (${carrier})`,
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

    res.json({ success: true, message: '更新成功', data: result.result });
  } catch (e) {
    res.status(500).json({ success: false, error: `运行错误: ${e.message}` });
  }
};

exports.batchTrack = async (req, res) => {
  const { orders } = req.body; // [{ trackingNumber: 'xxx', carrier: 'sagawa' }]
  if (!Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json({ success: false, error: '缺少 orders 或 orders 无效' });
  }

  try {
    const results = await runBatchTracking(orders);

    // 处理结果并写入数据库
    for (const { trackingNumber, result } of results) {
      if (result.error) {
        continue;
      }

      const order = await prisma.fBAOrder.findFirst({
        where: { trackingNumber },
      });
      if (!order) {
        continue;
      }

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
              remark: `从 AfterShip 爬取 (${orders.find((o) => o.trackingNumber === trackingNumber).carrier})`,
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

    res.json({ success: true, message: '批量更新成功', data: results });
  } catch (e) {
    res.status(500).json({ success: false, error: `运行错误: ${e.message}` });
  }
};
