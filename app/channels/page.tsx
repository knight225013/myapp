'use client';

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import Link from 'next/link';
import { Loader2, Plus, Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import type { Channel } from '@/types/shipment';

// 动态导入大型组件
const ChannelTable = lazy(() => import('@/components/channel/ChannelTable'));
const ChannelForm = lazy(() => import('@/components/channel/ChannelForm'));
const ExcelImportExport = lazy(() => import('@/components/smart-template/ExcelImportExport'));
const LabelTemplateEditor = lazy(() => import('@/components/smart-template/LabelTemplateEditor'));

// 组件加载骨架屏
const ComponentSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded mb-4"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

interface ChannelResponse {
  success: boolean;
  data: Channel[];
}

export default function ChannelPage() {
  // 性能监控
  usePerformanceMonitor('ChannelPage');

  // 状态管理
  const [showChannelCreate, setShowChannelCreate] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showLabelEditor, setShowLabelEditor] = useState(false);
  const [templateChannelId, setTemplateChannelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 使用防抖优化搜索
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 获取渠道列表 - 使用useCallback优化
  const fetchChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/channels', { 
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      if (!res.ok) throw new Error('获取渠道失败');
      const data: ChannelResponse = await res.json();
      if (!data.success) throw new Error('获取渠道数据失败');
      setChannels(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(`获取渠道失败: ${message}`);
      console.error('获取渠道失败:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Excel导入处理 - 使用useCallback优化
  const handleExcelImport = useCallback(async (file: File) => {
    try {
      if (file.size > 10 * 1024 * 1024) {
        setError('文件过大，请上传小于10MB的文件');
        return;
      }

      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/channels/import', {
        method: 'POST',
        body: formData,
      });
      
      const result = await res.json();
      if (!result.success) {
        setError(`导入失败: ${result.error || '未知错误'}`);
        return;
      }
      
      setError(null);
      await fetchChannels();
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(`导入失败: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchChannels]);

  // 删除渠道 - 使用useCallback优化
  const handleDeleteChannel = useCallback(async (channel: Channel) => {
    if (!confirm('确定要删除该渠道吗？')) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/channels/${channel.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!result.success) {
        setError(`删除失败: ${result.error || '未知错误'}`);
        return;
      }
      setError(null);
      setSelectedChannel(null);
      setShowChannelCreate(false);
      await fetchChannels();
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(`删除失败: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchChannels]);

  // 初始化数据获取
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // 事件处理函数
  const handleClose = useCallback(() => {
    setSelectedChannel(null);
    setShowChannelCreate(false);
  }, []);

  const handleChannelSelect = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
    setShowChannelCreate(true);
  }, []);

  const handleCreateTemplate = useCallback((channelId: string) => {
    setTemplateChannelId(channelId);
    setShowLabelEditor(true);
  }, []);

  const handleFormSubmitSuccess = useCallback(() => {
    handleClose();
    fetchChannels();
  }, [handleClose, fetchChannels]);

  const handleLabelEditorClose = useCallback(() => {
    setShowLabelEditor(false);
    setTemplateChannelId(null);
  }, []);

  const handleLabelEditorSuccess = useCallback(() => {
    setShowLabelEditor(false);
    setTemplateChannelId(null);
    fetchChannels();
  }, [fetchChannels]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // 过滤渠道 - 使用useMemo优化
  const filteredChannels = useMemo(() => {
    if (!debouncedSearchTerm) return channels;
    
    const searchValue = debouncedSearchTerm.toLowerCase();
    return channels.filter(channel =>
      channel.name.toLowerCase().includes(searchValue) ||
      channel.code?.toLowerCase().includes(searchValue) ||
      channel.type.toLowerCase().includes(searchValue) ||
      channel.country?.toLowerCase().includes(searchValue)
    );
  }, [channels, debouncedSearchTerm]);

  // 统计信息 - 使用useMemo优化
  const stats = useMemo(() => {
    const typeCount = channels.reduce((acc, channel) => {
      acc[channel.type] = (acc[channel.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const countryCount = new Set(channels.map(c => c.country).filter(Boolean)).size;

    return {
      total: channels.length,
      typeCount,
      countryCount,
    };
  }, [channels]);

  // 错误提示组件
  const ErrorAlert = () => error ? (
    <div className="glass rounded-3xl shadow-xl p-4 mb-6 bg-red-50 border border-red-200">
      <div className="flex items-center justify-between">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => setError(null)}
          className="text-red-400 hover:text-red-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <ErrorAlert />
      
      {/* 主要内容区域 */}
      <div className="glass rounded-3xl shadow-xl p-8">
        {/* 标题和操作栏 */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">渠道管理</h2>
            {!loading && (
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span>总渠道数: <strong>{stats.total}</strong></span>
                <span>覆盖国家: <strong>{stats.countryCount}</strong></span>
                {Object.entries(stats.typeCount).map(([type, count]) => (
                  <span key={type}>{type}: <strong>{count}</strong></span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索渠道名称、编码、类型..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                disabled={loading}
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <Link 
                href="/channels/price-maintenance" 
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                运价维护
              </Link>
              <Suspense fallback={<div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>}>
                <ExcelImportExport onImport={handleExcelImport} />
              </Suspense>
              <button
                onClick={() => {
                  setSelectedChannel(null);
                  setShowChannelCreate(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                disabled={loading || isSubmitting}
              >
                <Plus className="w-4 h-4" />
                新建渠道
              </button>
              <button
                onClick={fetchChannels}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={loading || isSubmitting}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '刷新'}
              </button>
            </div>
          </div>
        </div>

        {/* 渠道表格 */}
        {loading && channels.length === 0 ? (
          <ComponentSkeleton />
        ) : (
          <Suspense fallback={<ComponentSkeleton />}>
            <ChannelTable
              channels={filteredChannels}
              onSelectChannel={handleChannelSelect}
              onCreateTemplate={handleCreateTemplate}
            />
          </Suspense>
        )}
      </div>

      {/* 模态框背景 */}
      {showChannelCreate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
          onClick={handleClose}
        />
      )}

      {/* 渠道表单 */}
      {showChannelCreate && (
        <Suspense fallback={<ComponentSkeleton />}>
          <ChannelForm
            isOpen={showChannelCreate}
            onClose={handleClose}
            initialData={selectedChannel || undefined}
            onSubmitSuccess={handleFormSubmitSuccess}
          />
        </Suspense>
      )}

      {/* 标签模板编辑器 */}
      {showLabelEditor && (
        <Suspense fallback={<ComponentSkeleton />}>
          <LabelTemplateEditor
            isOpen={true}
            onClose={handleLabelEditorClose}
            onSubmitSuccess={handleLabelEditorSuccess}
            initialData={{
              name: '',
              content: '<div>{{waybillNumber}}</div>',
              width: 100,
              height: 50
            }}
          />
        </Suspense>
      )}

      {/* 删除按钮 */}
      {selectedChannel && showChannelCreate && (
        <button
          className="fixed bottom-6 right-6 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors z-50 disabled:opacity-50"
          onClick={() => handleDeleteChannel(selectedChannel)}
          disabled={loading || isSubmitting}
        >
          {isSubmitting ? '删除中...' : '删除渠道'}
        </button>
      )}
    </div>
  );
}
