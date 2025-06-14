'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Settings, Plus, Upload } from 'lucide-react';

export default function ChannelPriceMaintenancePage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.channelId as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/channels/${channelId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回渠道详情
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Settings className="w-6 h-6 mr-3 text-blue-600" />
            <h1 className="text-2xl font-bold">价格维护</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/channels/${channelId}/price-maintenance/import`)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              批量导入
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              新增价格
            </button>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            渠道 ID: <span className="font-mono">{channelId}</span>
          </p>
          <p className="text-blue-600 mt-2">
            此页面提供完整的渠道价格维护功能，包括：
          </p>
          <ul className="text-blue-600 mt-2 ml-4 list-disc">
            <li>基础运费设置</li>
            <li>额外费用规则配置</li>
            <li>价格历史记录</li>
            <li>批量价格调整</li>
          </ul>
        </div>

        {/* 价格列表区域 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">当前价格设置</h3>
          <div className="text-center text-gray-500 py-8">
            <p>暂无价格数据</p>
            <p className="text-sm mt-2">点击"新增价格"或"批量导入"开始设置价格</p>
          </div>
        </div>
      </div>
    </div>
  );
} 