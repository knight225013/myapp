'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FileText, CreditCard, TrendingUp, Calendar, Download, Users } from 'lucide-react';

interface Bill {
  id: string;
  billNo: string;
  clientName: string;
  totalAmount: number;
  status: 'draft' | 'audited' | 'issued' | 'settled' | 'void';
  createdAt: string;
}

interface BillTableProps {
  bills: Bill[];
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

export default function BillTable({ bills }: BillTableProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                账单编号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                客户名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                总金额
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                快捷操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bills.map((bill) => (
              <tr
                key={bill.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {bill.billNo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bill.clientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  ¥{bill.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`
                      px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${statusColors[bill.status]}
                    `}
                  >
                    {statusLabels[bill.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(bill.createdAt), 'yyyy-MM-dd HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => router.push(`/finance/bills/${bill.id}`)}
                    className="text-blue-600 hover:text-blue-900 transition-colors duration-150 font-medium"
                  >
                    查看
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => router.push(`/finance/invoices/new?billId=${bill.id}`)}
                      className="flex items-center text-gray-600 hover:text-gray-900 text-xs transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      创建发票
                    </button>
                    <button
                      onClick={() => router.push(`/finance/payments/new?billId=${bill.id}`)}
                      className="flex items-center text-gray-600 hover:text-gray-900 text-xs transition-colors"
                    >
                      <CreditCard className="w-4 h-4 mr-1" />
                      记录付款
                    </button>
                    <button
                      onClick={() => router.push(`/finance/billing?billId=${bill.id}`)}
                      className="flex items-center text-gray-600 hover:text-gray-900 text-xs transition-colors"
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      自动计费
                    </button>
                    <button
                      onClick={() => router.push(`/finance/statements?billId=${bill.id}`)}
                      className="flex items-center text-gray-600 hover:text-gray-900 text-xs transition-colors"
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      生成对账单
                    </button>
                    <button
                      onClick={() => router.push(`/finance/reports?billId=${bill.id}`)}
                      className="flex items-center text-gray-600 hover:text-gray-900 text-xs transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      财务报表
                    </button>
                    <button
                      onClick={() => router.push(`/finance/credit?billId=${bill.id}`)}
                      className="flex items-center text-gray-600 hover:text-gray-900 text-xs transition-colors"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      信用管理
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 