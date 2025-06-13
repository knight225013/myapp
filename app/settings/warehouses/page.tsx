'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { 
  Warehouse, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin,
  ArrowLeft,
  Building,
  Users,
  Package,
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface WarehouseData {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  country: string;
  manager?: string;
  phone?: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  capacity?: number;
  area?: number;
  description?: string;
  createdAt: string;
  locationCount: number;
  inventoryValue: number;
  utilizationRate: number;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchWarehouses();
  }, [searchTerm, statusFilter]);

  const fetchWarehouses = async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockWarehouses: WarehouseData[] = [
        {
          id: '1',
          code: 'WH001',
          name: '上海主仓库',
          address: '上海市浦东新区张江高科技园区',
          city: '上海',
          country: '中国',
          manager: '张经理',
          phone: '+86-21-12345678',
          email: 'shanghai@warehouse.com',
          status: 'ACTIVE',
          capacity: 10000,
          area: 5000,
          description: '主要用于进出口货物的存储和分拣',
          createdAt: '2024-01-01T00:00:00Z',
          locationCount: 150,
          inventoryValue: 2500000,
          utilizationRate: 85
        },
        {
          id: '2',
          code: 'WH002',
          name: '深圳分仓库',
          address: '深圳市南山区科技园',
          city: '深圳',
          country: '中国',
          manager: '李经理',
          phone: '+86-755-87654321',
          email: 'shenzhen@warehouse.com',
          status: 'ACTIVE',
          capacity: 8000,
          area: 4000,
          description: '华南地区货物集散中心',
          createdAt: '2024-01-02T00:00:00Z',
          locationCount: 120,
          inventoryValue: 1800000,
          utilizationRate: 72
        },
        {
          id: '3',
          code: 'WH003',
          name: '北京仓库',
          address: '北京市朝阳区望京SOHO',
          city: '北京',
          country: '中国',
          manager: '王经理',
          phone: '+86-10-98765432',
          email: 'beijing@warehouse.com',
          status: 'MAINTENANCE',
          capacity: 6000,
          area: 3000,
          description: '华北地区货物存储中心，目前正在维护升级',
          createdAt: '2024-01-03T00:00:00Z',
          locationCount: 80,
          inventoryValue: 1200000,
          utilizationRate: 45
        }
      ];

      // 应用过滤器
      let filtered = mockWarehouses;
      
      if (searchTerm) {
        filtered = filtered.filter(warehouse =>
          warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          warehouse.city.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter) {
        filtered = filtered.filter(warehouse => warehouse.status === statusFilter);
      }

      setWarehouses(filtered);
    } catch (error) {
      console.error('获取仓库列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'success' as const, text: '正常运营', icon: CheckCircle },
      INACTIVE: { variant: 'secondary' as const, text: '暂停使用', icon: Package },
      MAINTENANCE: { variant: 'warning' as const, text: '维护中', icon: AlertTriangle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  const formatArea = (area: number) => {
    return `${area.toLocaleString()} m²`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Warehouse className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">仓库管理</h1>
            <p className="text-gray-600 mt-1">管理仓库信息、库位和存储策略</p>
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/settings/warehouses/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加仓库
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索仓库名称、编码或城市..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部状态</option>
            <option value="ACTIVE">正常运营</option>
            <option value="INACTIVE">暂停使用</option>
            <option value="MAINTENANCE">维护中</option>
          </select>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总仓库数</p>
                <p className="text-2xl font-bold text-gray-900">{warehouses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">正常运营</p>
                <p className="text-2xl font-bold text-gray-900">
                  {warehouses.filter(w => w.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总库位数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {warehouses.reduce((sum, w) => sum + w.locationCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">库存价值</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(warehouses.reduce((sum, w) => sum + w.inventoryValue, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 仓库列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => (
          <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {warehouse.name}
                  </h3>
                  <p className="text-sm text-gray-500">编码: {warehouse.code}</p>
                </div>
                {getStatusBadge(warehouse.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* 基本信息 */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {warehouse.city}, {warehouse.country}
                </div>
                {warehouse.manager && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {warehouse.manager}
                  </div>
                )}
              </div>

              {/* 容量信息 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">面积</p>
                  <p className="font-medium">{warehouse.area ? formatArea(warehouse.area) : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">容量</p>
                  <p className="font-medium">{warehouse.capacity ? warehouse.capacity.toLocaleString() : '-'}</p>
                </div>
              </div>

              {/* 使用率 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">使用率</span>
                  <span className="font-medium">{warehouse.utilizationRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      warehouse.utilizationRate >= 90 
                        ? 'bg-red-500' 
                        : warehouse.utilizationRate >= 70 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${warehouse.utilizationRate}%` }}
                  ></div>
                </div>
              </div>

              {/* 统计信息 */}
              <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                <div>
                  <p className="text-gray-500">库位数量</p>
                  <p className="font-medium">{warehouse.locationCount}</p>
                </div>
                <div>
                  <p className="text-gray-500">库存价值</p>
                  <p className="font-medium">{formatCurrency(warehouse.inventoryValue)}</p>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Link href={`/settings/warehouses/${warehouse.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      编辑
                    </Button>
                  </Link>
                  <Link href={`/settings/warehouses/${warehouse.id}/settings`}>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      设置
                    </Button>
                  </Link>
                </div>
                
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {warehouses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Warehouse className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无仓库</h3>
            <p className="mt-1 text-sm text-gray-500">
              开始创建第一个仓库
            </p>
            <div className="mt-6">
              <Link href="/settings/warehouses/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  添加仓库
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 