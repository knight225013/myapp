'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BillDetailHeaderProps {
  bill: {
    billNo: string;
    clientName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  };
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  audited: 'bg-blue-100 text-blue-800',
  issued: 'bg-green-100 text-green-800',
  settled: 'bg-purple-100 text-purple-800',
  void: 'bg-red-100 text-red-800',
};

const statusLabels = {
  draft: '草稿',
  audited: '已审核',
  issued: '已开票',
  settled: '已结算',
  void: '已作废',
};

export default function BillDetailHeader({ bill }: BillDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回账单列表
        </button>
        
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[bill.status as keyof typeof statusColors]
          }`}
        >
          {statusLabels[bill.status as keyof typeof statusLabels]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-500">账单编号</label>
          <p className="text-lg font-semibold text-gray-900">{bill.billNo}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">客户名称</label>
          <p className="text-lg font-semibold text-gray-900">{bill.clientName}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">总金额</label>
          <p className="text-lg font-semibold text-green-600">
            ¥{bill.totalAmount.toFixed(2)}
          </p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">创建时间</label>
          <p className="text-lg font-semibold text-gray-900">
            {new Date(bill.createdAt).toLocaleDateString('zh-CN')}
          </p>
        </div>
      </div>
    </div>
  );
} 