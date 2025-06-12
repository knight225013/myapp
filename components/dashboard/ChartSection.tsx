import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

interface ChartSectionProps {
  data: ChartData;
}

const ChartSection: React.FC<ChartSectionProps> = ({ data }) => {
  const chartTabs = [
    {
      id: 'daily',
      label: 'Daily',
      content: <ChartPlaceholder data={data} period="Daily" />
    },
    {
      id: 'weekly',
      label: 'Weekly', 
      content: <ChartPlaceholder data={data} period="Weekly" />
    },
    {
      id: 'monthly',
      label: 'Monthly',
      content: <ChartPlaceholder data={data} period="Monthly" />
    }
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Shipment Analytics</h3>
      </CardHeader>
      <CardContent>
        <Tabs tabs={chartTabs} defaultTab="daily" />
      </CardContent>
    </Card>
  );
};

// Placeholder component for chart - can be replaced with actual chart library
const ChartPlaceholder: React.FC<{ data: ChartData; period: string }> = ({ data, period }) => {
  const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-600">{period} Overview</h4>
        <div className="flex space-x-4">
          {data.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: dataset.color }}
              />
              <span className="text-sm text-gray-600">{dataset.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-center space-x-2 p-4">
        {data.labels.map((label, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <div className="flex space-x-1">
              {data.datasets.map((dataset, datasetIndex) => (
                <div
                  key={datasetIndex}
                  className="w-8 rounded-t"
                  style={{
                    height: `${(dataset.data[index] / maxValue) * 200}px`,
                    backgroundColor: dataset.color,
                    minHeight: '4px'
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 transform -rotate-45">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartSection; 