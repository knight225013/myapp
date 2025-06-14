'use client';

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Package, CheckCircle, Truck, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { cache, cachedFetch, useCachedData } from '@/utils/cache';
import { prefetchRoute, smartPrefetch, usePrefetch } from '@/utils/prefetch';
import { Filters } from '@/types/filters';
import { Shipment } from '@/types/shipment';

// 动态导入大型组件
const ShipmentTable = lazy(() => import('@/components/waybill/ShipmentTable'));
const MultiStepShipmentForm = lazy(() => import('@/components/waybill/MultiStepShipmentForm'));
const ShipmentDrawer = lazy(() => import('@/components/waybill/ShipmentDrawer'));
const ShipmentEditForm = lazy(() => import('@/components/waybill/ShipmentEditForm'));

// 组件加载骨架屏
const ComponentSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded mb-4"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

// 状态按钮配置
const statusButtons = [
  { label: '全部', status: '全部', icon: Package },
  { label: '已下单', status: '已下单', icon: CheckCircle },
  { label: '已收货', status: '已收货', icon: Package },
  { label: '转运中', status: '转运中', icon: Truck },
  { label: '已签收', status: '已签收', icon: CheckCircle },
  { label: '已取消', status: '已取消', icon: AlertCircle },
  { label: '退件', status: '退件', icon: AlertCircle },
];

interface Channel {
  id: string;
  name: string;
}

export default function WaybillPage() {
  // 性能监控
  usePerformanceMonitor('WaybillPage');

  // 记录用户访问
  useEffect(() => {
    smartPrefetch.recordVisit('/waybill');
    smartPrefetch.prefetchPredicted('/waybill');
  }, []);

  // UI状态管理
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 数据状态管理
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    '全部': 0,
    '已下单': 0,
    '已收货': 0,
    '转运中': 0,
    '已签收': 0,
    '已取消': 0,
    '退件': 0,
  });
  const [total, setTotal] = useState(0);
  
  // 分页和过滤状态
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(30);
  const [selectedStatus, setSelectedStatus] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'waybillNumber'|'country'|'recipient'|'trackingNumber'>('waybillNumber');
  
  // 使用防抖优化搜索
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const [filters, setFilters] = useState<Filters>({
    status: '',
    country: '',
    channel: '',
    waybillNumber: '',
    client: '',
    date: '',
    trackingNumber: '',
    recipient: '',
  });

  // 编辑相关状态
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 预取下一页数据
  usePrefetch(
    currentPage < Math.ceil(total / limit) ? {
      url: `http://localhost:4000/api/waybills?page=${currentPage + 1}&limit=${limit}&type=FBA`,
      ttl: 300000,
      priority: 'low'
    } : null,
    [currentPage, total, limit]
  );

  // 处理状态按钮数据
  const processedStatusButtons = useMemo(() => 
    statusButtons.map(btn => ({
      label: btn.label,
      status: btn.status,
      count: statusCounts[btn.status] || 0,
      icon: btn.icon,
    })), 
    [statusCounts]
  );

  // 获取渠道列表 - 使用缓存
  const fetchChannels = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        cache.delete('channels-list');
      }
      
      const data = await cachedFetch<any>(
        'http://localhost:4000/api/channels',
        undefined,
        600000 // 10分钟缓存
      );
      
      if (data.success && Array.isArray(data.data)) {
        setChannels(data.data);
      } else {
        console.error('❌ 获取渠道失败:', data.error || '数据格式错误');
        setChannels([]);
      }
    } catch (err) {
      console.error('❌ 获取渠道失败:', err);
      setChannels([]);
      setError('获取渠道列表失败');
    }
  }, []);

  // 获取运单数据 - 使用缓存
  const fetchWaybills = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        type: 'FBA',
        ...filters,
        [searchType]: debouncedSearchTerm,
      });
      
      const cacheKey = `waybills:${params.toString()}`;
      
      if (forceRefresh) {
        cache.delete(cacheKey);
      }
      
      const data = await cachedFetch<any>(
        `http://localhost:4000/api/waybills?${params.toString()}`,
        undefined,
        60000 // 1分钟缓存
      );
      
      if (data.success) {
        setShipments(data.data || []);
        setTotal(data.total || 0);
      } else {
        throw new Error(data.error || '获取运单失败');
      }
    } catch (error) {
      console.error('获取运单失败:', error);
      setError('获取运单数据失败，请稍后重试');
      setShipments([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, filters, debouncedSearchTerm, searchType]);

  // 获取状态统计 - 使用缓存
  const fetchStatusCounts = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        cache.delete('waybill-status-counts');
      }
      
      const data = await cachedFetch<any>(
        'http://localhost:4000/api/waybills/status-counts',
        undefined,
        30000 // 30秒缓存
      );
      
      if (data.success) {
        setStatusCounts(data.data || {
          '全部': 0,
          '已下单': 0,
          '已收货': 0,
          '转运中': 0,
          '已签收': 0,
          '已取消': 0,
          '退件': 0,
        });
      }
    } catch (error) {
      console.error('获取状态统计失败:', error);
    }
  }, []);

  // 初始化数据获取 - 修复重复调用问题
  useEffect(() => {
    let mounted = true;
    
    const initData = async () => {
      if (mounted) {
        await Promise.all([
          fetchChannels(),
          fetchWaybills(),
          fetchStatusCounts()
        ]);
      }
    };
    
    initData();
    
    return () => {
      mounted = false;
    };
  }, []); // 只在组件挂载时执行一次

  // 监听搜索和过滤变化 - 修复依赖问题
  useEffect(() => {
    fetchWaybills();
  }, [currentPage, filters, debouncedSearchTerm, searchType]); // 明确依赖项

  // 刷新所有数据
  const handleRefreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 清除相关缓存
      cache.invalidatePattern('waybills:.*');
      cache.delete('waybill-status-counts');
      
      await Promise.all([
        fetchWaybills(true),
        fetchStatusCounts(true)
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchWaybills, fetchStatusCounts]);

  // 事件处理函数 - 使用useCallback优化
  const handleStatusClick = useCallback((status: string) => {
    setSelectedStatus(status);
    setFilters(prev => ({ ...prev, status: status === '全部' ? '' : status }));
    setCurrentPage(1);
  }, []);

  const handleWaveInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleCreateShipment = useCallback(async (formData: Record<string, any>) => {
    try {
      setIsLoading(true);
      // TODO: 实现创建运单的API调用
      console.log('创建运单:', formData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 清除缓存并刷新
      cache.invalidatePattern('waybills:.*');
      cache.delete('waybill-status-counts');
      
      setShowCreatePanel(false);
      await Promise.all([
        fetchWaybills(true),
        fetchStatusCounts(true)
      ]);
    } catch (error) {
      console.error('创建运单失败:', error);
      setError('创建运单失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, [fetchWaybills, fetchStatusCounts]);

  const handleEditSuccess = useCallback(async () => {
    // 清除缓存并刷新
    cache.invalidatePattern('waybills:.*');
    cache.delete('waybill-status-counts');
    
    await Promise.all([
      fetchWaybills(true),
      fetchStatusCounts(true)
    ]);
    setIsEditing(false);
    setSelectedShipment(null);
  }, [fetchWaybills, fetchStatusCounts]);

  const handleClose = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedShipment(null);
  }, []);

  const handleEditClose = useCallback(() => {
    setIsEditing(false);
    setSelectedShipment(null);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // 使用useMemo优化计算
  const filteredShipments = useMemo(() => {
    return shipments.filter(shipment => {
      if (selectedStatus !== '全部' && shipment.status !== selectedStatus) {
        return false;
      }
      if (debouncedSearchTerm) {
        const searchValue = debouncedSearchTerm.toLowerCase();
        switch (searchType) {
          case 'waybillNumber':
            return shipment.waybillNumber?.toLowerCase().includes(searchValue);
          case 'country':
            return shipment.country?.toLowerCase().includes(searchValue);
          case 'recipient':
            return shipment.recipient?.toLowerCase().includes(searchValue);
          case 'trackingNumber':
            return shipment.trackingNumber?.toLowerCase().includes(searchValue);
          default:
            return true;
        }
      }
      return true;
    });
  }, [shipments, selectedStatus, debouncedSearchTerm, searchType]);

  // 错误提示组件
  const ErrorAlert = () => error ? (
    <div className="glass rounded-3xl shadow-xl p-4 mb-6 bg-red-50 border border-red-200">
      <div className="flex items-center justify-between">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => setError(null)}
          className="text-red-400 hover:text-red-600"
        >
          ✕
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <ErrorAlert />
      
      {/* 状态切换器 */}
      <div className="glass rounded-3xl shadow-xl p-6">
        <div className="flex gap-4 overflow-x-auto">
          {processedStatusButtons.map((btn) => (
            <button
              key={btn.status}
              onClick={() => handleStatusClick(btn.status)}
              className={`flex-shrink-0 flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${
                selectedStatus === btn.status
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={isLoading}
            >
              <btn.icon className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">{btn.label}</span>
              <span className="text-xs font-bold">{btn.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 搜索和操作栏 */}
      <div className="glass rounded-3xl shadow-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="waybillNumber">运单号</option>
                <option value="country">国家</option>
                <option value="recipient">收件人</option>
                <option value="trackingNumber">跟踪号</option>
              </select>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleWaveInputChange}
                  placeholder={`按${searchType === 'waybillNumber' ? '运单号' : 
                    searchType === 'country' ? '国家' :
                    searchType === 'recipient' ? '收件人' : '跟踪号'}搜索...`}
                  className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  disabled={isLoading}
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreatePanel(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              创建运单
            </button>
            <button
              onClick={handleRefreshAll}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              disabled={isLoading || isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              刷新
            </button>
          </div>
        </div>
      </div>

      {/* 运单表格 */}
      <div className="glass rounded-3xl shadow-xl p-6">
        {isLoading && shipments.length === 0 ? (
          <ComponentSkeleton />
        ) : (
          <Suspense fallback={<ComponentSkeleton />}>
            <ShipmentTable
              data={filteredShipments}
              currentPage={currentPage}
              total={total}
              onPageChange={setCurrentPage}
              onSelectShipment={(shipment) => {
                setSelectedShipment(shipment);
                setIsDrawerOpen(true);
              }}
              onEdit={(shipment) => {
                setSelectedShipment(shipment);
                setIsEditing(true);
              }}
              statusCounts={statusCounts}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
            />
          </Suspense>
        )}
      </div>

      {/* 动态加载的模态框和抽屉 */}
      {showCreatePanel && (
        <Suspense fallback={<ComponentSkeleton />}>
          <MultiStepShipmentForm
            isOpen={showCreatePanel}
            onClose={() => setShowCreatePanel(false)}
            onSubmit={handleCreateShipment}
          />
        </Suspense>
      )}

      {isDrawerOpen && selectedShipment && (
        <Suspense fallback={<ComponentSkeleton />}>
          <ShipmentDrawer
            shipment={selectedShipment}
            onClose={handleClose}
            onEdit={() => {
              setIsDrawerOpen(false);
              setIsEditing(true);
            }}
          />
        </Suspense>
      )}

      {isEditing && selectedShipment && (
        <Suspense fallback={<ComponentSkeleton />}>
          <ShipmentEditForm
            shipment={selectedShipment}
            onCancel={handleEditClose}
            onSuccess={handleEditSuccess}
          />
        </Suspense>
      )}
    </div>
  );
}
