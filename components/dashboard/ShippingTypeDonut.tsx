import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface ShippingTypeData {
  type: string;
  value: number;
  color: string;
  percentage: number;
}

interface ShippingTypeDonutProps {
  data: ShippingTypeData[];
}

const ShippingTypeDonut: React.FC<ShippingTypeDonutProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate angles for donut chart
  let currentAngle = 0;
  const segments = data.map(item => {
    const angle = (item.value / total) * 360;
    const segment = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      angle
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <Card className="mb-8">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Shipping Types</h3>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="relative w-48 h-48">
            {/* Donut Chart SVG */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="10"
              />
              {segments.map((segment, index) => {
                const radius = 35;
                const circumference = 2 * Math.PI * radius;
                const strokeDasharray = `${(segment.angle / 360) * circumference} ${circumference}`;
                const strokeDashoffset = -((segment.startAngle / 360) * circumference);
                
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="10"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 hover:stroke-width-12"
                  />
                );
              })}
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{total}</span>
              <span className="text-sm text-gray-600">Total</span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex-1 ml-8 space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.type}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingTypeDonut; 