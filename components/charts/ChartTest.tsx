'use client';

import ShipmentTrendChart from './ShipmentTrendChart';

export default function ChartTest() {
  // 测试数据 - 正常情况
  const normalData = Array.from({ length: 60 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (59 - i));
    return {
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 20) + 1
    };
  });

  // 测试数据 - 空数据
  const emptyData: any[] = [];

  // 测试数据 - 单点数据
  const singleData = [{
    date: new Date().toISOString().split('T')[0],
    count: 5
  }];

  // 测试数据 - 全零数据
  const zeroData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      count: 0
    };
  });

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900">趋势图表测试</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">正常数据（60天）</h2>
          <ShipmentTrendChart data={normalData} />
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">空数据</h2>
          <ShipmentTrendChart data={emptyData} />
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">单点数据</h2>
          <ShipmentTrendChart data={singleData} />
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">全零数据（30天）</h2>
          <ShipmentTrendChart data={zeroData} />
        </div>
      </div>
    </div>
  );
} 