'use client';

import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BillTimelineProps {
  logs: Array<{
    id: string;
    status: string;
    remark: string;
    timestamp: string;
  }>;
}

const statusIcons = {
  draft: Clock,
  audited: CheckCircle,
  issued: CheckCircle,
  settled: CheckCircle,
  void: XCircle,
};

const statusColors = {
  draft: 'text-gray-500',
  audited: 'text-blue-500',
  issued: 'text-green-500',
  settled: 'text-purple-500',
  void: 'text-red-500',
};

const statusLabels = {
  draft: '创建草稿',
  audited: '审核通过',
  issued: '已开票',
  settled: '已结算',
  void: '已作废',
};

export default function BillTimeline({ logs }: BillTimelineProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">状态时间线</h3>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {logs.map((log, index) => {
            const Icon = statusIcons[log.status as keyof typeof statusIcons] || AlertCircle;
            const isLast = index === logs.length - 1;
            
            return (
              <li key={log.id}>
                <div className="relative pb-8">
                  {!isLast && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          statusColors[log.status as keyof typeof statusColors]
                        }`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-900">
                          {statusLabels[log.status as keyof typeof statusLabels] || log.status}
                        </p>
                        {log.remark && (
                          <p className="text-sm text-gray-500 mt-1">{log.remark}</p>
                        )}
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime={log.timestamp}>
                          {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm')}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
} 