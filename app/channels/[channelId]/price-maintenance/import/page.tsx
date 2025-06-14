'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Download, FileText } from 'lucide-react';

export default function PriceImportPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.channelId as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/channels/${channelId}/price-maintenance`)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回价格维护
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <Upload className="w-6 h-6 mr-3 text-green-600" />
          <h1 className="text-2xl font-bold">批量导入价格</h1>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            渠道 ID: <span className="font-mono">{channelId}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 下载模板 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Download className="w-5 h-5 mr-2 text-blue-600" />
              <h3 className="text-lg font-semibold">1. 下载导入模板</h3>
            </div>
            <p className="text-gray-600 mb-4">
              请先下载标准模板，按照模板格式填写价格数据
            </p>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <FileText className="w-4 h-4 mr-2" />
              下载Excel模板
            </button>
          </div>

          {/* 上传文件 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Upload className="w-5 h-5 mr-2 text-green-600" />
              <h3 className="text-lg font-semibold">2. 上传价格文件</h3>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">拖拽文件到此处或点击选择</p>
              <p className="text-sm text-gray-500">支持 .xlsx, .xls 格式</p>
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors"
              >
                选择文件
              </label>
            </div>
          </div>
        </div>

        {/* 导入说明 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">导入说明</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 请确保数据格式与模板一致</li>
            <li>• 重复的价格设置将被覆盖</li>
            <li>• 导入前请备份现有数据</li>
            <li>• 单次最多支持导入1000条记录</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 