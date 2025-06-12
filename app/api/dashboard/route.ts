import { NextResponse } from 'next/server';

export async function GET() {
  // Mock dashboard data
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
    shippingTypes: [
      {
        type: 'FBA Shipments',
        value: 456,
        color: '#3b82f6',
        percentage: 65
      },
      {
        type: 'Regular Cargo',
        value: 234,
        color: '#10b981',
        percentage: 33
      },
      {
        type: 'Express',
        value: 14,
        color: '#f59e0b',
        percentage: 2
      }
    ],
    activities: [
      {
        id: '1',
        type: 'shipment_delivered',
        title: 'Shipment Delivered',
        description: 'Package TRK001234567 delivered to John Smith in New York',
        timestamp: '2 hours ago',
        icon: 'fas fa-check-circle',
        color: 'bg-green-500'
      },
      {
        id: '2',
        type: 'shipment_created',
        title: 'New Shipment Created',
        description: 'Package TRK001234572 created for delivery to Miami',
        timestamp: '4 hours ago',
        icon: 'fas fa-plus-circle',
        color: 'bg-blue-500'
      },
      {
        id: '3',
        type: 'payment_received',
        title: 'Payment Received',
        description: 'Payment of $234.75 received for shipment TRK001234569',
        timestamp: '6 hours ago',
        icon: 'fas fa-dollar-sign',
        color: 'bg-purple-500'
      },
      {
        id: '4',
        type: 'status_updated',
        title: 'Status Updated',
        description: 'Package TRK001234568 is now in transit to Los Angeles',
        timestamp: '8 hours ago',
        icon: 'fas fa-truck',
        color: 'bg-orange-500'
      }
    ]
  };

  return NextResponse.json(dashboardData);
} 