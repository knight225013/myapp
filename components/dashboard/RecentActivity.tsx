import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface ActivityItem {
  id: string;
  type: 'shipment_created' | 'shipment_delivered' | 'payment_received' | 'status_updated';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.color}`}>
                <i className={`${activity.icon} text-white text-sm`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {activity.timestamp}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="text-center py-8">
              <i className="fas fa-inbox text-gray-300 text-3xl mb-3" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity; 