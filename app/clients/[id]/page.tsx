'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, Activity, User, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import ClientStatusBadge from '@/components/clients/ClientStatusBadge';

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

interface LoginLog {
  id: string;
  ip: string;
  device: string;
  userAgent: string;
  loginAt: string;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'shipments' | 'logs'>('basic');
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchClientData();
    }
  }, [params.id]);

  useEffect(() => {
    if (activeTab === 'shipments' && params.id) {
      fetchShipmentData();
    } else if (activeTab === 'logs' && params.id) {
      fetchLoginLogs();
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

  const fetchLoginLogs = async () => {
    try {
      const response = await fetch(`/api/clients/${params.id}/logs`);
      const result = await response.json();
      if (result.success) {
        setLoginLogs(result.data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch login logs:', error);
    }
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

  const getStatusCounts = () => {
    if (!shipmentData) return {};
    const counts: Record<string, number> = {};
    shipmentData.statusCounts.forEach(item => {
      counts[item.status] = item._count.id;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

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
              <h1 className="text-2xl font-bold text-gray-900">
                {client.companyName || client.name}
              </h1>
              <p className="text-gray-600 mt-1">客户详情</p>
            </div>
            <ClientStatusBadge status={client.status} />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('basic')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'basic'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  基本信息
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'basic' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">联系信息</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">联系人</p>
                        <p className="text-sm font-medium text-gray-900">{client.name}</p>
                      </div>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">电话</p>
                          <p className="text-sm font-medium text-gray-900">{client.phone}</p>
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

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">账户信息</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">创建时间</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(client.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    {client.updatedAt && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">更新时间</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(client.updatedAt).toLocaleString('zh-CN')}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">状态</p>
                        <ClientStatusBadge status={client.status} />
                      </div>
                    </div>
                  </div>
                </div>
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
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {statusCounts['已完成'] || 0}
                    </div>
                    <div className="text-sm text-green-600">已完成</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {statusCounts['运输中'] || 0}
                    </div>
                    <div className="text-sm text-yellow-600">运输中</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {statusCounts['异常'] || 0}
                    </div>
                    <div className="text-sm text-red-600">异常</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">最近运单</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          运单号
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          渠道
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          收件人
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          目的地
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          状态
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          创建时间
                        </th>
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
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {shipment.status}
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">登录日志</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        IP地址
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        设备
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        用户代理
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        登录时间
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loginLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {log.ip}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {log.device}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                          {log.userAgent}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(log.loginAt).toLocaleString('zh-CN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {loginLogs.length === 0 && (
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