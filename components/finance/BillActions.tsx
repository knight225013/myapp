'use client';

import { useState } from 'react';
import { CheckCircle, FileText, CreditCard, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BillActionsProps {
  billId: string;
  status: string;
  channelId?: string;
  onStatusChanged: () => void;
}

export default function BillActions({ 
  billId, 
  status, 
  channelId, 
  onStatusChanged 
}: BillActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (action: string, endpoint: string) => {
    const remark = prompt(`请输入${action}备注（可选）:`);
    if (remark === null) return; // 用户取消

    setLoading(action);
    try {
      const response = await fetch(`/api/finance/bills/${billId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remark }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message || `${action}成功`);
        onStatusChanged();
      } else {
        alert(`${action}失败: ` + data.error);
      }
    } catch (error) {
      console.error(`${action}失败:`, error);
      alert(`${action}失败`);
    } finally {
      setLoading(null);
    }
  };

  const handlePriceMaintenance = () => {
    if (channelId) {
      router.push(`/channels/${channelId}/price-maintenance`);
    } else {
      alert('无法获取渠道信息');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">操作</h3>
      
      <div className="space-y-3">
        {/* 审核 */}
        {status === 'draft' && (
          <button
            onClick={() => handleAction('审核', 'audit')}
            disabled={loading === '审核'}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {loading === '审核' ? '审核中...' : '审核账单'}
          </button>
        )}

        {/* 开票 */}
        {status === 'audited' && (
          <button
            onClick={() => handleAction('开票', 'issue')}
            disabled={loading === '开票'}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            {loading === '开票' ? '开票中...' : '开具发票'}
          </button>
        )}

        {/* 结算 */}
        {status === 'issued' && (
          <button
            onClick={() => handleAction('结算', 'settle')}
            disabled={loading === '结算'}
            className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {loading === '结算' ? '结算中...' : '确认结算'}
          </button>
        )}

        {/* 价格维护 */}
        {channelId && (
          <button
            onClick={handlePriceMaintenance}
            className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            价格设置
          </button>
        )}

        {/* 状态说明 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">状态说明</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 草稿: 可以审核</li>
            <li>• 已审核: 可以开票</li>
            <li>• 已开票: 可以结算</li>
            <li>• 已结算: 流程完成</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 