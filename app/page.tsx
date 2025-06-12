'use client';

import React, { useEffect, useState } from 'react';
import StatsPanel from '@/components/dashboard/StatsPanel';
import CreateWaybillButton from '@/components/dashboard/CreateWaybillButton';
import ShipmentTable from '@/components/dashboard/ShipmentTable';
import ChartSection from '@/components/dashboard/ChartSection';
import ShippingTypeDonut from '@/components/dashboard/ShippingTypeDonut';
import RecentActivity from '@/components/dashboard/RecentActivity';

interface DashboardData {
  stats: any[];
  waybills: any[];
  chartData: any;
  shippingTypes: any[];
  activities: any[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCreateWaybill = () => {
    // Navigate to waybill creation page
    window.location.href = '/waybill/create';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-orange-500 mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4" />
          <p className="text-gray-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your shipments.</p>
      </div>

      {/* Stats Panel */}
      <StatsPanel stats={data.stats} />

      {/* Create Waybill Button */}
      <CreateWaybillButton onClick={handleCreateWaybill} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts and Table */}
        <div className="lg:col-span-2 space-y-6">
          <ChartSection data={data.chartData} />
          <ShipmentTable waybills={data.waybills} />
        </div>

        {/* Right Column - Donut Chart and Activity */}
        <div className="space-y-6">
          <ShippingTypeDonut data={data.shippingTypes} />
          <RecentActivity activities={data.activities} />
        </div>
      </div>
    </div>
  );
}
