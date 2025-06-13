'use client';

import { useMemo } from 'react';

interface TrendData {
  date: string;
  count: number;
}

interface ShipmentTrendChartProps {
  data: TrendData[];
  className?: string;
}

export default function ShipmentTrendChart({ data, className = '' }: ShipmentTrendChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return { 
        points: '', 
        maxCount: 0, 
        dates: [],
        width: 800,
        height: 200,
        padding: 40,
        currentMonthData: [],
        lastMonthData: []
      };
    }

    const maxCount = Math.max(...data.map(d => d.count), 1);
    const width = 800;
    const height = 200;
    const padding = 40;

    // 修复单点数据的问题
    let points = '';
    if (data.length === 1) {
      const x = width / 2;
      const y = height - padding - (data[0].count / maxCount) * (height - 2 * padding);
      points = `${x},${y}`;
    } else {
      points = data.map((item, index) => {
        const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
        const y = height - padding - (item.count / maxCount) * (height - 2 * padding);
        return `${x},${y}`;
      }).join(' ');
    }

    // 获取当前月和上个月的数据 - 修复跨年问题
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // 计算上个月，处理跨年情况
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastYear = lastMonthDate.getFullYear();
    
    const currentMonthData = data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });
    
    const lastMonthData = data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === lastMonth && itemDate.getFullYear() === lastYear;
    });

    return {
      points,
      maxCount,
      width,
      height,
      padding,
      currentMonthData,
      lastMonthData,
      dates: data.map(d => d.date)
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">运单趋势（最近60天）</h3>
        <div className="flex items-center justify-center h-48 text-gray-500">
          暂无数据
        </div>
      </div>
    );
  }

  const currentMonthTotal = chartData.currentMonthData.reduce((sum, item) => sum + item.count, 0);
  const lastMonthTotal = chartData.lastMonthData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">运单趋势（最近60天）</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">本月: {currentMonthTotal}单</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-gray-600">上月: {lastMonthTotal}单</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <svg
          width={chartData.width}
          height={chartData.height}
          className="w-full h-auto border border-gray-100 rounded"
          viewBox={`0 0 ${chartData.width} ${chartData.height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* 背景 */}
          <rect width="100%" height="100%" fill="#fafafa" />
          
          {/* 网格线 */}
          <defs>
            <pattern id={`grid-${Math.random()}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>

          {/* Y轴网格线和标签 */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = chartData.height - chartData.padding - ratio * (chartData.height - 2 * chartData.padding);
            const value = Math.round(ratio * chartData.maxCount);
            return (
              <g key={`y-axis-${index}`}>
                <line
                  x1={chartData.padding}
                  y1={y}
                  x2={chartData.width - chartData.padding}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray={ratio === 0 ? "none" : "2,2"}
                />
                <text
                  x={chartData.padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* 趋势线 */}
          {chartData.points && (
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points={chartData.points}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 数据点 */}
          {data.map((item, index) => {
            let x, y;
            
            if (data.length === 1) {
              x = chartData.width / 2;
              y = chartData.height - chartData.padding - (item.count / chartData.maxCount) * (chartData.height - 2 * chartData.padding);
            } else {
              x = chartData.padding + (index / (data.length - 1)) * (chartData.width - 2 * chartData.padding);
              y = chartData.height - chartData.padding - (item.count / chartData.maxCount) * (chartData.height - 2 * chartData.padding);
            }
            
            return (
              <g key={`point-${index}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3b82f6"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="hover:r-6 transition-all cursor-pointer"
                >
                  <title>{`${item.date}: ${item.count}单`}</title>
                </circle>
                {/* 悬停时显示的大圆圈 */}
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="transparent"
                  className="hover:fill-blue-100 transition-all cursor-pointer"
                >
                  <title>{`${item.date}: ${item.count}单`}</title>
                </circle>
              </g>
            );
          })}

          {/* X轴日期标签 */}
          {data.length > 1 && [0, Math.floor(data.length / 4), Math.floor(data.length / 2), Math.floor(3 * data.length / 4), data.length - 1].map((index) => {
            if (index >= data.length) return null;
            
            const x = chartData.padding + (index / (data.length - 1)) * (chartData.width - 2 * chartData.padding);
            const date = new Date(data[index].date);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            
            return (
              <text
                key={`x-label-${index}`}
                x={x}
                y={chartData.height - 10}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
              >
                {dateStr}
              </text>
            );
          })}

          {/* 单点数据的特殊处理 */}
          {data.length === 1 && (
            <text
              x={chartData.width / 2}
              y={chartData.height - 10}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
            >
              {new Date(data[0].date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
            </text>
          )}
        </svg>
      </div>

      {/* 图表说明 */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        {data.length > 0 ? `显示 ${data.length} 天的数据` : '暂无数据'}
        {chartData.maxCount > 0 && ` · 最高 ${chartData.maxCount} 单/天`}
      </div>
    </div>
  );
} 