import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface StatItem {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: string;
  color: string;
}

interface StatsPanelProps {
  stats: StatItem[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.change && (
                  <div className="flex items-center mt-2">
                    <i className={`fas fa-arrow-${stat.trend === 'up' ? 'up' : 'down'} text-xs mr-1 ${
                      stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`} />
                    <span className={`text-sm ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                )}
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                <i className={`${stat.icon} text-white text-xl`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsPanel; 