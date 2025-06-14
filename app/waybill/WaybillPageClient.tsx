'use client';

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Package, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
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

// 图标映射 - 在客户端组件中处理
const iconMap = {
  Package,
  CheckCircle,
  Truck,
  AlertCircle,
};

interface Channel {
  id: string;
  name: string;
}

interface StatusButtonConfig {
  label: string;
  status: string;
  iconName: keyof typeof iconMap;
}

interface WaybillPageClientProps {
  initialData: {
    channels: Channel[];
    statusCounts: Record<string, number>;
    initialShipments: Shipment[];
    total: number;
  };
  statusButtons: StatusButtonConfig[];
}

export default function WaybillPageClient({ initialData, statusButtons }: WaybillPageClientProps) {
  // 性能监控
  usePerformanceMonitor('WaybillPageClient');

  // UI状态管理
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 数据状态管理
  const [shipments, setShipments] = useState<Shipment[]>(initialData.initialShipments);
  const [channels, setChannels] = useState<Channel[]>(initialData.channels);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>(initialData.statusCounts);
  const [total, setTotal] = useState(initialData.total);
  
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

  // 将图标名称转换为实际图标组件
  const processedStatusButtons = useMemo(() => 
    statusButtons.map(btn => ({
      label: btn.label,
      status: btn.status,
      count: statusCounts[btn.status] || 0,
      icon: iconMap[btn.iconName],
    })), 
    [statusButtons, statusCounts]
  );

  // 获取渠道列表 - 使用useCallback优化
  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:4000/api/channels');
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setChannels(data.data);
      } else {
        console.error('❌ 获取渠道失败:', data.error || '数据格式错误');
        setChannels([]);
      }
    } catch (err) {
      console.error('❌ 获取渠道失败:', err);
      setChannels([]);
    }
  }, []);

  // 获取运单数据 - 使用useCallback优化
  const fetchWaybills = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        type: 'FBA',
        ...filters,
        [searchType]: debouncedSearchTerm,
      });
      
      const res = await fetch(`http://localhost:4000/api/waybills?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setShipments(data.data || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('获取运单失败:', error);
    }
  }, [currentPage, limit, filters, debouncedSearchTerm, searchType]);

  // 获取状态统计 - 使用useCallback优化
  const fetchStatusCounts = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:4000/api/waybills/status-counts');
      const data = await res.json();
      if (data.success) {
        setStatusCounts(data.data);
      }
    } catch (error) {
      console.error('获取状态统计失败:', error);
    }
  }, []);

  // 初始化数据获取
  useEffect(() => {
    if (initialData.channels.length === 0) {
      fetchChannels();
    }
    if (initialData.initialShipments.length === 0) {
      fetchWaybills();
      fetchStatusCounts();
    }
  }, [fetchChannels, fetchWaybills, fetchStatusCounts, initialData]);

  // 监听搜索和过滤变化
  useEffect(() => {
    fetchWaybills();
  }, [fetchWaybills]);

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

  const handleCreateShipment = useCallback((formData: Record<string, any>) => {
    console.log('创建运单:', formData);
    setShowCreatePanel(false);
    fetchWaybills();
  }, [fetchWaybills]);

  const handleEditSuccess = useCallback(() => {
    fetchWaybills();
    setIsEditing(false);
    setSelectedShipment(null);
  }, [fetchWaybills]);

  const handleClose = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedShipment(null);
  }, []);

  const handleEditClose = useCallback(() => {
    setIsEditing(false);
    setSelectedShipment(null);
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

  return (
    <div className="space-y-6">
      {/* 状态切换器 */}
      <div className="glass rounded-3xl shadow-xl p-6">
        <div className="flex gap-4 overflow-x-auto">
          {processedStatusButtons.map((btn) => (
            <button
              key={btn.status}
              onClick={() => handleStatusClick(btn.status)}
              className={`flex-shrink-0 flex flex-col items-center p-4 rounded-lg transition-colors ${
                selectedStatus === btn.status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <btn.icon className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">{btn.label}</span>
              <span className="text-xs">{btn.count}</span>
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
              >
                <option value="waybillNumber">运单号</option>
                <option value="country">国家</option>
                <option value="recipient">收件人</option>
                <option value="trackingNumber">跟踪号</option>
              </select>
              <input
                type="text"
                value={searchTerm}
                onChange={handleWaveInputChange}
                placeholder={`按${searchType === 'waybillNumber' ? '运单号' : 
                  searchType === 'country' ? '国家' :
                  searchType === 'recipient' ? '收件人' : '跟踪号'}搜索...`}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700"
                >
                  清除
                </button>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreatePanel(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              创建运单
            </button>
          </div>
        </div>
      </div>

      {/* 运单表格 */}
      <div className="glass rounded-3xl shadow-xl p-6">
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