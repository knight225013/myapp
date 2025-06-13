'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Package, Activity, User, Phone, Mail, MapPin, Calendar,
  DollarSign, AlertTriangle, TrendingUp, Clock, Globe, Edit2
} from 'lucide-react';
import ClientStatusBadge from '@/components/clients/ClientStatusBadge';
import CopyButton from '@/components/ui/CopyButton';
import ShipmentTrendChart from '@/components/charts/ShipmentTrendChart';
import SalesRepSelector from '@/components/clients/SalesRepSelector';

interface Client {
  id: string;
  name: string;
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 'active' | 'frozen' | 'blacklisted';
  createdAt: string;
  updatedAt?: string;
  financeContact?: {
    id: string;
    name: string;
    email: string;
  };
  shipmentStats: Record<string, number>;
  accountBalance: number;
  overdueAmount: number;
  shipmentTrend: Array<{
    date: string;
    count: number;
  }>;
  lastLogin?: {
    id: string;
    ip: string;
    device: string;
    userAgent: string;
    loginAt: string;
  };
  loginLogs: Array<{
    id: string;
    ip: string;
    device: string;
    userAgent: string;
    loginAt: string;
  }>;
}

interface ShipmentData {
  statusCounts: Array<{ status: string; _count: { id: number } }>;
  total: number;
  shipments: Array<{
    id: string;
    status: string;
    createdAt: string;
    channel: { name: string };
    recipient: string;
    country: string;
  }>;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'shipments' | 'logs' | 'finance'>('overview');
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingSalesRep, setIsEditingSalesRep] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchClientData();
    }
  }, [params.id]);

  useEffect(() => {
    if (activeTab === 'shipments' && params.id) {
      fetchShipmentData();
    }
  }, [activeTab, params.id]);

  const fetchClientData = async () => {
    try {
      const response = await fetch(`/api/clients/${params.id}`);
      const result = await response.json();
      if (result.success) {
        setClient(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch client:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShipmentData = async () => {
    try {
      const response = await fetch(`/api/clients/${params.id}/shipments`);
      const result = await response.json();
      if (result.success) {
        setShipmentData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch shipment data:', error);
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleSalesRepSelect = async (repId: string) => {
    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          financeContactId: repId || null
        }),
      });

      if (response.ok) {
        // 重新获取客户数据
        await fetchClientData();
        setIsEditingSalesRep(false);
      }
    } catch (error) {
      console.error('Failed to update sales rep:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      '已下单': 'bg-blue-100 text-blue-800',
      '已收货': 'bg-yellow-100 text-yellow-800',
      '转运中': 'bg-purple-100 text-purple-800',
      '已签收': 'bg-green-100 text-green-800',
      '退件': 'bg-red-100 text-red-800',
      '已取消': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDisplayName = (status: string) => {
    const names: Record<string, string> = {
      '已下单': '待付款',
      '已收货': '已提交',
      '转运中': '运输中',
      '已签收': '已送达',
      '退件': '异常',
      '已取消': '已取消'
    };
    return names[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">客户不存在</h2>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {client.companyName || client.name || '未提供'}
              </h1>
              <p className="text-gray-600 mt-1">客户详情</p>
            </div>
            <ClientStatusBadge status={client.status} />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  概览
                </div>
              </button>
              <button
                onClick={() => setActiveTab('shipments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'shipments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  运单记录
                </div>
              </button>
              <button
                onClick={() => setActiveTab('finance')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'finance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  财务信息
                </div>
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'logs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  登录日志
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'overview' && (
            <div className="p-6">
              {/* 基本信息卡片 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* 联系信息 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">联系信息</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">联系人</p>
                          <p className="text-sm font-medium text-gray-900">{client.name}</p>
                        </div>
                      </div>
                    </div>
                    
                    {client.phone && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">电话</p>
                            <p className="text-sm font-medium text-gray-900">{client.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CopyButton text={client.phone} />
                          <button
                            onClick={() => handleCall(client.phone!)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                            title="拨打电话"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {client.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">邮箱</p>
                          <p className="text-sm font-medium text-gray-900">{client.email}</p>
                        </div>
                      </div>
                    )}

                    {client.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">地址</p>
                          <p className="text-sm font-medium text-gray-900">{client.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 销售代表 */}
                <div className="bg-gray-50 p-6 rounded-lg relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">销售代表</h3>
                    <button
                      onClick={() => setIsEditingSalesRep(!isEditingSalesRep)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="编辑销售代表"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {client.financeContact ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">
                        {client.financeContact.name}
                      </p>
                      <p className="text-sm text-gray-500">{client.financeContact.email}</p>
                      <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                        查看客户列表
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">未分配销售代表</p>
                  )}

                  {isEditingSalesRep && (
                    <SalesRepSelector
                      currentRepId={client.financeContact?.id}
                      onSelect={handleSalesRepSelect}
                      onCancel={() => setIsEditingSalesRep(false)}
                    />
                  )}
                </div>

                {/* 最后登录 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">最后登录</h3>
                  {client.lastLogin ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-900">
                          {new Date(client.lastLogin.loginAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{client.lastLogin.ip}</p>
                        <CopyButton text={client.lastLogin.ip} />
                      </div>
                      <p className="text-xs text-gray-500 truncate" title={client.lastLogin.userAgent}>
                        {client.lastLogin.device}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">从未登录</p>
                  )}
                </div>
              </div>

              {/* 运单状态统计 */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">运单状态统计</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(client.shipmentStats).map(([status, count]) => (
                    <div key={status} className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className={`text-sm px-2 py-1 rounded-full inline-block mt-2 ${getStatusColor(status)}`}>
                        {getStatusDisplayName(status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 趋势图表 */}
              <ShipmentTrendChart data={client.shipmentTrend} />
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 账户余额 */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900">当前账户余额</h3>
                  </div>
                  <div className={`text-3xl font-bold ${client.accountBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ¥{client.accountBalance.toFixed(2)}
                  </div>
                  {client.accountBalance < 0 && (
                    <p className="text-sm text-red-600 mt-2">账户透支或结算逾期</p>
                  )}
                </div>

                {/* 逾期金额 */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                    <h3 className="text-lg font-medium text-gray-900">逾期金额</h3>
                  </div>
                  <div className={`text-3xl font-bold ${client.overdueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ¥{client.overdueAmount.toFixed(2)}
                  </div>
                  {client.overdueAmount === 0 && (
                    <p className="text-sm text-green-600 mt-2">无逾期账款</p>
                  )}
                </div>
              </div>

              {/* 财务联系人 */}
              <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">财务联系人</h3>
                {client.financeContact ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{client.financeContact.name}</p>
                      <p className="text-sm text-gray-600">{client.financeContact.email}</p>
                    </div>
                    <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      联系财务
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">未设置财务联系人</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'shipments' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">运单统计</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {shipmentData?.total || 0}
                    </div>
                    <div className="text-sm text-blue-600">总运单数</div>
                  </div>
                  {shipmentData?.statusCounts.map((item) => (
                    <div key={item.status} className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {item._count.id}
                      </div>
                      <div className="text-sm text-gray-600">{getStatusDisplayName(item.status)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">最近运单</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">运单号</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">渠道</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">收件人</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">目的地</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {shipmentData?.shipments.map((shipment) => (
                        <tr key={shipment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            #{shipment.id.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {shipment.channel.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {shipment.recipient}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {shipment.country}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                              {getStatusDisplayName(shipment.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(shipment.createdAt).toLocaleDateString('zh-CN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!shipmentData?.shipments || shipmentData.shipments.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">暂无运单记录</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">登录日志（最近5次）</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP地址</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">设备</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户代理</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">登录时间</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {client.loginLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            {log.ip}
                            <CopyButton text={log.ip} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.device}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={log.userAgent}>
                          {log.userAgent}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(log.loginAt).toLocaleString('zh-CN')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            查看详情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {client.loginLogs.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">暂无登录记录</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 