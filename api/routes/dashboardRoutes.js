const express = require('express');

const router = express.Router();

// 获取仪表板数据
router.get('/', async (req, res) => {
  try {
    // 模拟仪表板数据
    const dashboardData = {
      stats: [
        {
          label: 'Total Orders',
          value: '1,567',
          change: '+12%',
          trend: 'up',
          icon: 'fas fa-box',
          color: 'bg-blue-500'
        },
        {
          label: 'Delivered',
          value: '1,234',
          change: '+8%',
          trend: 'up',
          icon: 'fas fa-check-circle',
          color: 'bg-green-500'
        },
        {
          label: 'In Transit',
          value: '234',
          change: '-2%',
          trend: 'down',
          icon: 'fas fa-truck',
          color: 'bg-orange-500'
        },
        {
          label: 'Revenue',
          value: '$45,678',
          change: '+15%',
          trend: 'up',
          icon: 'fas fa-dollar-sign',
          color: 'bg-purple-500'
        }
      ],
      waybills: [
        {
          id: '1',
          trackingNumber: 'TRK001234567',
          recipient: 'John Smith',
          destination: 'New York, NY',
          status: 'delivered',
          createdAt: '2024-01-15',
          value: 125.50
        },
        {
          id: '2',
          trackingNumber: 'TRK001234568',
          recipient: 'Jane Doe',
          destination: 'Los Angeles, CA',
          status: 'in_transit',
          createdAt: '2024-01-14',
          value: 89.99
        },
        {
          id: '3',
          trackingNumber: 'TRK001234569',
          recipient: 'Bob Johnson',
          destination: 'Chicago, IL',
          status: 'pending',
          createdAt: '2024-01-13',
          value: 234.75
        },
        {
          id: '4',
          trackingNumber: 'TRK001234570',
          recipient: 'Alice Brown',
          destination: 'Houston, TX',
          status: 'delivered',
          createdAt: '2024-01-12',
          value: 156.25
        },
        {
          id: '5',
          trackingNumber: 'TRK001234571',
          recipient: 'Charlie Wilson',
          destination: 'Phoenix, AZ',
          status: 'cancelled',
          createdAt: '2024-01-11',
          value: 67.80
        }
      ],
      chartData: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Delivered',
            data: [45, 52, 38, 67, 73, 89, 95],
            color: '#10b981'
          },
          {
            label: 'In Transit',
            data: [23, 28, 35, 42, 38, 45, 52],
            color: '#f59e0b'
          },
          {
            label: 'Pending',
            data: [12, 15, 18, 22, 25, 28, 30],
            color: '#ef4444'
          }
        ]
      },
      recentActivity: [
        {
          id: '1',
          type: 'order_created',
          message: 'New order TRK001234572 created',
          timestamp: new Date().toISOString(),
          user: 'System'
        },
        {
          id: '2',
          type: 'status_update',
          message: 'Order TRK001234571 status updated to delivered',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: 'Admin'
        }
      ]
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('获取仪表板数据失败:', error);
    res.status(500).json({ success: false, error: '获取仪表板数据失败' });
  }
});

module.exports = router; 