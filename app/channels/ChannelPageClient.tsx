'use client';

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import type { Channel } from '@/types/shipment';
import type { FeeRule } from '@/components/smart-template/fee-rules/types';
import type { ExtraFeeRule } from '@/components/ExtraFeeRule/types';

// 动态导入大型组件
const ChannelTable = lazy(() => import('@/components/channel/ChannelTable'));
const ChannelForm = lazy(() => import('@/components/channel/ChannelForm'));
const ChannelEstimateTable = lazy(() => import('@/components/channel/ChannelEstimateTable'));
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

interface Estimate {
  channelId: string;
  channelName: string;
  currency: string;
  chargeWeight: number;
  base: number;
  tax: number;
  extraFee: number;
  otherFee: number;
  total: number;
}

interface ChannelPageClientProps {
  initialData: {
    channels: Channel[];
    estimates: Estimate[];
  };
}

export default function ChannelPageClient({ initialData }: ChannelPageClientProps) {
  // 性能监控
  usePerformanceMonitor('ChannelPageClient');

  // 状态管理
  const [showChannelCreate, setShowChannelCreate] = useState(false);
  const [channels, setChannels] = useState<Channel[]>(initialData.channels);
  const [estimates, setEstimates] = useState<Estimate[]>(initialData.estimates);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showLabelEditor, setShowLabelEditor] = useState(false);
  const [templateChannelId, setTemplateChannelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // 使用防抖优化搜索
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 获取渠道列表 - 使用useCallback优化
  const fetchChannels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/channels', { 
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      if (!res.ok) throw new Error('获取渠道失败');
      const data: ChannelResponse = await res.json();
      if (!data.success) throw new Error('获取渠道数据失败');
      setChannels(data.data);
      setError(null);
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

      setLoading(true);
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
      setLoading(false);
    }
  }, [fetchChannels]);

  // 删除渠道 - 使用useCallback优化
  const handleDeleteChannel = useCallback(async (channel: Channel) => {
    if (!confirm('确定要删除该渠道吗？')) return;
    
    setLoading(true);
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
      setLoading(false);
    }
  }, [fetchChannels]);

  // 初始化数据获取
  useEffect(() => {
    if (initialData.channels.length === 0) {
      fetchChannels();
    }
  }, [fetchChannels, initialData.channels.length]);

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

  // 过滤渠道 - 使用useMemo优化
  const filteredChannels = useMemo(() => {
    if (!debouncedSearchTerm) return channels;
    
    return channels.filter(channel =>
      channel.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      channel.code?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      channel.type.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      channel.country?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [channels, debouncedSearchTerm]);

  // 渠道表单初始数据 - 使用useMemo优化
  const channelFormInitialData = useMemo(() => {
    if (!selectedChannel) return undefined;

    return {
      id: selectedChannel.id,
      name: selectedChannel.name,
      code: selectedChannel.code || '',
      type: selectedChannel.type,
      country: selectedChannel.country,
      warehouse: selectedChannel.warehouse,
      origin: selectedChannel.origin,
      currency: selectedChannel.currency,
      decimal: selectedChannel.decimal,
      method: selectedChannel.method,
      rounding: selectedChannel.rounding,
      compareMode: selectedChannel.compareMode,
      volRatio: selectedChannel.volRatio,
      cubeRatio: selectedChannel.cubeRatio,
      splitRatio: selectedChannel.splitRatio,
      chargeMethod: selectedChannel.chargeMethod,
      minCharge: selectedChannel.minCharge,
      ticketPrecision: selectedChannel.ticketPrecision,
      boxPrecision: selectedChannel.boxPrecision,
      sizePrecision: selectedChannel.sizePrecision,
      minPieces: selectedChannel.minPieces,
      maxPieces: selectedChannel.maxPieces,
      minBoxRealWeight: selectedChannel.minBoxRealWeight,
      minBoxMaterialWeight: selectedChannel.minBoxMaterialWeight,
      minBoxChargeWeight: selectedChannel.minBoxChargeWeight,
      minBoxAvgWeight: selectedChannel.minBoxAvgWeight,
      minTicketChargeWeight: selectedChannel.minTicketChargeWeight,
      maxTicketChargeWeight: selectedChannel.maxTicketChargeWeight,
      minTicketRealWeight: selectedChannel.minTicketRealWeight,
      maxTicketRealWeight: selectedChannel.maxTicketRealWeight,
      minBoxRealWeightLimit: selectedChannel.minBoxRealWeightLimit,
      maxBoxRealWeight: selectedChannel.maxBoxRealWeight,
      minBoxChargeWeightLimit: selectedChannel.minBoxChargeWeightLimit,
      maxBoxChargeWeight: selectedChannel.maxBoxChargeWeight,
      minDeclareValue: selectedChannel.minDeclareValue,
      maxDeclareValue: selectedChannel.maxDeclareValue,
      aging: selectedChannel.aging,
      waybillRule: selectedChannel.waybillRule,
      labelCode: selectedChannel.labelCode,
      assignedUser: selectedChannel.assignedUser,
      userLevel: selectedChannel.userLevel,
      declareCurrency: selectedChannel.declareCurrency,
      defaultDeclareCurrency: selectedChannel.defaultDeclareCurrency,
      sender: selectedChannel.sender,
      showWeight: selectedChannel.showWeight || false,
      showSize: selectedChannel.showSize || false,
      requireWeight: selectedChannel.requireWeight || false,
      requireSize: selectedChannel.requireSize || false,
      requirePhone: selectedChannel.requirePhone || false,
      requireEmail: selectedChannel.requireEmail || false,
      requirePackingList: selectedChannel.requirePackingList || false,
      verifySalesLink: selectedChannel.verifySalesLink || false,
      verifyImageLink: selectedChannel.verifyImageLink || false,
      requireVAT: selectedChannel.requireVAT || false,
      requireVATFiling: selectedChannel.requireVATFiling || false,
      requireEORI: selectedChannel.requireEORI || false,
      enableBilling: selectedChannel.enableBilling || false,
      showBilling: selectedChannel.showBilling || false,
      controlBilling: selectedChannel.controlBilling || false,
      controlReceivingFee: selectedChannel.controlReceivingFee || false,
      promptUnderpayment: selectedChannel.promptUnderpayment || false,
      modifyVolRatio: selectedChannel.modifyVolRatio || false,
      showSupplierData: selectedChannel.showSupplierData || false,
      orderBySKULibrary: selectedChannel.orderBySKULibrary || false,
      allowCancel: selectedChannel.allowCancel || false,
      noAutoCancelAPIFail: selectedChannel.noAutoCancelAPIFail || false,
      allowChannelChange: selectedChannel.allowChannelChange || false,
      allowEdit: selectedChannel.allowEdit || false,
      allowTrackingEntry: selectedChannel.allowTrackingEntry || false,
      allowLabelUpload: selectedChannel.allowLabelUpload || false,
      hideCarrier: selectedChannel.hideCarrier || false,
      refundOnReturn: selectedChannel.refundOnReturn || false,
      noRefundOnCancel: selectedChannel.noRefundOnCancel || false,
      showInWMS: selectedChannel.showInWMS || false,
      enableCOD: selectedChannel.enableCOD || false,
      restrictWarehouseCode: selectedChannel.restrictWarehouseCode || false,
      roundBeforeSplit: selectedChannel.roundBeforeSplit || false,
      feeRules: (selectedChannel.extraFeeRules || []).map((rule: ExtraFeeRule): FeeRule => ({
        id: rule.id,
        module: 'extra',
        type: rule.feeType,
        name: rule.name,
        params: {
          price: rule.value,
          chargeUnit: rule.feeType === 'perKg' ? 'kg' : 'box',
          field: 'weight',
          label: rule.name
        },
        currency: rule.currency
      })),
      rates: selectedChannel.rates || []
    };
  }, [selectedChannel]);

  return (
    <div className="space-y-6">
      {/* 主要内容区域 */}
      <div className="glass rounded-3xl shadow-xl p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">渠道管理</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* 搜索框 */}
            <div className="relative">
              <input
                type="text"
                placeholder="搜索渠道名称、编码、类型..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex gap-4">
              <Link href="/channels/price-maintenance" className="text-blue-500 hover:underline">
                运价维护
              </Link>
              <Suspense fallback={<div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>}>
                <ExcelImportExport onImport={handleExcelImport} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-600">处理中...</p>
          </div>
        )}

        {/* 渠道表格 */}
        <Suspense fallback={<ComponentSkeleton />}>
          <ChannelTable
            channels={filteredChannels}
            onSelectChannel={handleChannelSelect}
            onCreateTemplate={handleCreateTemplate}
            onDeleteChannel={handleDeleteChannel}
          />
        </Suspense>
      </div>

      {/* 估价表格 */}
      {estimates.length > 0 && (
        <div className="glass rounded-3xl shadow-xl p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">运费估算</h3>
          <Suspense fallback={<ComponentSkeleton />}>
            <ChannelEstimateTable estimates={estimates} />
          </Suspense>
        </div>
      )}

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
            initialData={channelFormInitialData}
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
      {selectedChannel && (
        <button
          className="fixed bottom-6 right-[74vw] bg-red-500 text-white px-4 py-2 rounded z-[1000] hover:bg-red-600 transition-colors"
          onClick={() => handleDeleteChannel(selectedChannel)}
          disabled={loading}
        >
          {loading ? '删除中...' : '删除'}
        </button>
      )}
    </div>
  );
} 