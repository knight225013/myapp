import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Waybill {
  id: string;
  trackingNumber: string;
  recipient: string;
  destination: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
  value: number;
}

interface ShipmentTableProps {
  waybills: Waybill[];
}

const statusConfig = {
  pending: { variant: 'warning' as const, label: 'Pending' },
  in_transit: { variant: 'info' as const, label: 'In Transit' },
  delivered: { variant: 'success' as const, label: 'Delivered' },
  cancelled: { variant: 'error' as const, label: 'Cancelled' }
};

const ShipmentTable: React.FC<ShipmentTableProps> = ({ waybills }) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Shipments</h3>
          <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Tracking #</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Recipient</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Destination</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Value</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {waybills.map((waybill) => (
                <tr key={waybill.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-blue-600">{waybill.trackingNumber}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{waybill.recipient}</td>
                  <td className="py-3 px-4 text-gray-600">{waybill.destination}</td>
                  <td className="py-3 px-4">
                    <Badge variant={statusConfig[waybill.status].variant}>
                      {statusConfig[waybill.status].label}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-900">${waybill.value.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-600">{waybill.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShipmentTable; 