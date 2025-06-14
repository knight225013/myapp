'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { 
  Warehouse, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin,
  ArrowLeft,
  Building,
  Users,
  Phone,
  Settings,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import Link from 'next/link';

interface WarehouseData {
  id: string;
  code: string;
  name: string;
  address: string;
  detailedAddress: string;
  city: string;
  country: string;
  manager: string;
  phone: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
  createdAt: string;
}

interface CreateWarehouseForm {
  code: string;
  name: string;
  address: string;
  detailedAddress: string;
  city: string;
  country: string;
  manager: string;
  phone: string;
  email: string;
  description: string;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseData | null>(null);
  const [createForm, setCreateForm] = useState<CreateWarehouseForm>({
    code: '',
    name: '',
    address: '',
    detailedAddress: '',
    city: '',
    country: '中国',
    manager: '',
    phone: '',
    email: '',
    description: ''
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsWarehouse, setSettingsWarehouse] = useState<WarehouseData | null>(null);
  const [settingsForm, setSettingsForm] = useState({ manager: '', phone: '' });

  useEffect(() => {
    fetchWarehouses();
  }, []);

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
          detailedAddress: '上海市浦东新区张江高科技园区科苑路399号张江创新园10号楼',
          city: '上海',
          country: '中国',
          manager: '张经理',
          phone: '+86-21-12345678',
          email: 'shanghai@warehouse.com',
          status: 'ACTIVE',
          description: '主要用于进出口货物的存储和分拣',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          code: 'WH002',
          name: '深圳分仓库',
          address: '深圳市南山区科技园',
          detailedAddress: '深圳市南山区科技园南区深南大道10000号腾讯大厦A座',
          city: '深圳',
          country: '中国',
          manager: '李经理',
          phone: '+86-755-87654321',
          email: 'shenzhen@warehouse.com',
          status: 'ACTIVE',
          description: '华南地区货物集散中心',
          createdAt: '2024-01-02T00:00:00Z'
        },
        {
          id: '3',
          code: 'WH003',
          name: '北京仓库',
          address: '北京市朝阳区望京SOHO',
          detailedAddress: '北京市朝阳区望京SOHO塔1 A座2901',
          city: '北京',
          country: '中国',
          manager: '王经理',
          phone: '+86-10-98765432',
          email: 'beijing@warehouse.com',
          status: 'INACTIVE',
          description: '华北地区货物存储中心',
          createdAt: '2024-01-03T00:00:00Z'
        }
      ];

      setWarehouses(mockWarehouses);
    } catch (error) {
      console.error('获取仓库列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (warehouseId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      // 模拟API调用
      setWarehouses(prev => prev.map(w => 
        w.id === warehouseId ? { ...w, status: newStatus } : w
      ));
      console.log(`仓库 ${warehouseId} 状态更新为: ${newStatus}`);
    } catch (error) {
      console.error('更新仓库状态失败:', error);
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 模拟API调用
      const newWarehouse: WarehouseData = {
        id: Date.now().toString(),
        ...createForm,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      setWarehouses(prev => [...prev, newWarehouse]);
      setShowCreateModal(false);
      setCreateForm({
        code: '',
        name: '',
        address: '',
        detailedAddress: '',
        city: '',
        country: '中国',
        manager: '',
        phone: '',
        email: '',
        description: ''
      });
    } catch (error) {
      console.error('创建仓库失败:', error);
    }
  };

  const handleEditWarehouse = (warehouse: WarehouseData) => {
    setEditingWarehouse(warehouse);
    setCreateForm({
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address,
      detailedAddress: warehouse.detailedAddress,
      city: warehouse.city,
      country: warehouse.country,
      manager: warehouse.manager,
      phone: warehouse.phone,
      email: warehouse.email || '',
      description: warehouse.description || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWarehouse) return;
    
    try {
      // 模拟API调用
      setWarehouses(prev => prev.map(w => 
        w.id === editingWarehouse.id 
          ? { ...w, ...createForm }
          : w
      ));
      setShowEditModal(false);
      setEditingWarehouse(null);
    } catch (error) {
      console.error('更新仓库失败:', error);
    }
  };

  const handleDeleteWarehouse = async (warehouseId: string) => {
    if (!confirm('确定要删除这个仓库吗？此操作不可恢复。')) return;
    
    try {
      // 模拟API调用
      setWarehouses(prev => prev.filter(w => w.id !== warehouseId));
    } catch (error) {
      console.error('删除仓库失败:', error);
    }
  };

  const handleSettingsWarehouse = (warehouse: WarehouseData) => {
    setSettingsWarehouse(warehouse);
    setSettingsForm({ manager: warehouse.manager, phone: warehouse.phone });
    setShowSettingsModal(true);
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsWarehouse) return;
    setWarehouses(prev => prev.map(w =>
      w.id === settingsWarehouse.id ? { ...w, manager: settingsForm.manager, phone: settingsForm.phone } : w
    ));
    setShowSettingsModal(false);
    setSettingsWarehouse(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'success' as const, text: '开启', icon: CheckCircle },
      INACTIVE: { variant: 'default' as const, text: '关闭', icon: AlertTriangle }
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
            <p className="text-gray-600 mt-1">管理仓库信息和状态</p>
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          添加仓库
        </Button>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <p className="text-sm font-medium text-gray-600">开启仓库</p>
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
              <div className="p-2 bg-gray-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">关闭仓库</p>
                <p className="text-2xl font-bold text-gray-900">
                  {warehouses.filter(w => w.status === 'INACTIVE').length}
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
              {/* 详细地址 */}
              <div className="space-y-2">
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{warehouse.detailedAddress}</span>
                </div>
              </div>

              {/* 负责人信息 */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>负责人: {warehouse.manager}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>联系电话: {warehouse.phone}</span>
                </div>
              </div>

              {/* 状态控制按钮 */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-sm text-gray-500">状态控制:</span>
                <Button
                  size="sm"
                  variant={warehouse.status === 'ACTIVE' ? 'primary' : 'outline'}
                  onClick={() => handleStatusToggle(warehouse.id, 'ACTIVE')}
                  disabled={warehouse.status === 'ACTIVE'}
                >
                  开启
                </Button>
                <Button
                  size="sm"
                  variant={warehouse.status === 'INACTIVE' ? 'primary' : 'outline'}
                  onClick={() => handleStatusToggle(warehouse.id, 'INACTIVE')}
                  disabled={warehouse.status === 'INACTIVE'}
                >
                  关闭
                </Button>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditWarehouse(warehouse)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    编辑
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSettingsWarehouse(warehouse)}>
                    <Settings className="h-4 w-4 mr-1" />
                    设置
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteWarehouse(warehouse.id)}
                >
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
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                添加仓库
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 创建仓库弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">创建仓库</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleCreateWarehouse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="仓库编码"
                  value={createForm.code}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setCreateForm({...createForm, code: e.target.value})}
                  required
                />
                <Input
                  label="仓库名称"
                  value={createForm.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setCreateForm({...createForm, name: e.target.value})}
                  required
                />
              </div>
              
              <Input
                label="详细地址"
                value={createForm.detailedAddress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setCreateForm({...createForm, detailedAddress: e.target.value})}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="城市"
                  value={createForm.city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setCreateForm({...createForm, city: e.target.value})}
                  required
                />
                <Input
                  label="国家"
                  value={createForm.country}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setCreateForm({...createForm, country: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="负责人"
                  value={createForm.manager}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setCreateForm({...createForm, manager: e.target.value})}
                  required
                />
                <Input
                  label="联系电话"
                  value={createForm.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setCreateForm({...createForm, phone: e.target.value})}
                  required
                />
              </div>
              
              <Input
                label="邮箱"
                type="email"
                value={createForm.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setCreateForm({...createForm, email: e.target.value})}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  取消
                </Button>
                <Button type="submit">
                  创建仓库
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑仓库弹窗 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">编辑仓库</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowEditModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleUpdateWarehouse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="仓库编码"
                  value={createForm.code}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setCreateForm({...createForm, code: e.target.value})}
                  required
                />
                <Input
                  label="仓库名称"
                  value={createForm.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setCreateForm({...createForm, name: e.target.value})}
                  required
                />
              </div>
              
              <Input
                label="详细地址"
                value={createForm.detailedAddress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setCreateForm({...createForm, detailedAddress: e.target.value})}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="城市"
                  value={createForm.city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setCreateForm({...createForm, city: e.target.value})}
                  required
                />
                <Input
                  label="国家"
                  value={createForm.country}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setCreateForm({...createForm, country: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="负责人"
                  value={createForm.manager}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setCreateForm({...createForm, manager: e.target.value})}
                  required
                />
                <Input
                  label="联系电话"
                  value={createForm.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setCreateForm({...createForm, phone: e.target.value})}
                  required
                />
              </div>
              
              <Input
                label="邮箱"
                type="email"
                value={createForm.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setCreateForm({...createForm, email: e.target.value})}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  取消
                </Button>
                <Button type="submit">
                  更新仓库
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">仓库设置</h2>
              <Button variant="outline" size="sm" onClick={() => setShowSettingsModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSettingsSave} className="space-y-4">
              <Input
                label="负责人"
                value={settingsForm.manager}
                onChange={e => setSettingsForm({ ...settingsForm, manager: e.target.value })}
                required
              />
              <Input
                label="联系电话"
                value={settingsForm.phone}
                onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                required
              />
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowSettingsModal(false)}>
                  取消
                </Button>
                <Button type="submit">
                  保存设置
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 