'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Settings, DollarSign } from 'lucide-react';

export default function ChannelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.channelId as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回渠道列表
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <Settings className="w-6 h-6 mr-3 text-blue-600" />
          <h1 className="text-2xl font-bold">渠道详情</h1>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            渠道 ID: <span className="font-mono">{channelId}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push(`/channels/${channelId}/price-maintenance`)}
            className="flex items-center justify-center p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <DollarSign className="w-8 h-8 mr-3 text-green-600" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-green-800">价格维护</h3>
              <p className="text-green-600">管理渠道运费和附加费用</p>
            </div>
          </button>

          <div className="flex items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-center text-gray-500">
              <p>更多功能正在开发中...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 