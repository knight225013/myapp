'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  Edit,
  Eye,
  Search,
  Filter
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
}

interface CreditInfo {
  id: string;
  customerId: string;
  customerName: string;
  creditLimit: number;
  usedCredit: number;
  availableCredit: number;
  creditScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  paymentHistory: number; // 按时付款率
  overdueAmount: number;
  lastUpdated: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'UNDER_REVIEW';
}

interface RiskAlert {
  id: string;
  customerId: string;
  customerName: string;
  type: 'CREDIT_LIMIT_EXCEEDED' | 'OVERDUE_PAYMENT' | 'CREDIT_SCORE_DROP' | 'SUSPICIOUS_ACTIVITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  createdAt: string;
  resolved: boolean;
}

export default function CreditPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [creditInfos, setCreditInfos] = useState<CreditInfo[]>([]);
  const [filteredCreditInfos, setFilteredCreditInfos] = useState<CreditInfo[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCredit, setEditingCredit] = useState<CreditInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'alerts'>('overview');

  useEffect(() => {
    fetchCustomers();
    fetchCreditInfos();
    fetchRiskAlerts();
  }, []);

  useEffect(() => {
    filterCreditInfos();
  }, [creditInfos, searchTerm, riskFilter]);

  const fetchCustomers = async () => {
    try {
      // 模拟客户数据
      const mockCustomers: Customer[] = [
        { id: '1', name: '张三', companyName: '上海贸易公司', email: 'zhang@example.com', phone: '13800138001' },
        { id: '2', name: '李四', companyName: '深圳物流有限公司', email: 'li@example.com', phone: '13800138002' },
        { id: '3', name: '王五', companyName: '北京进出口公司', email: 'wang@example.com', phone: '13800138003' }
      ];
      setCustomers(mockCustomers);
    } catch (error) {
      console.error('获取客户列表失败:', error);
    }
  };

  const fetchCreditInfos = async () => {
    try {
      // 模拟信用信息数据
      const mockCreditInfos: CreditInfo[] = [
        {
          id: '1',
          customerId: '1',
          customerName: '上海贸易公司',
          creditLimit: 100000,
          usedCredit: 45600,
          availableCredit: 54400,
          creditScore: 85,
          riskLevel: 'LOW',
          paymentHistory: 95.5,
          overdueAmount: 0,
          lastUpdated: '2024-01-15 10:30:00',
          status: 'ACTIVE'
        },
        {
          id: '2',
          customerId: '2',
          customerName: '深圳物流有限公司',
          creditLimit: 80000,
          usedCredit: 72000,
          availableCredit: 8000,
          creditScore: 72,
          riskLevel: 'MEDIUM',
          paymentHistory: 88.2,
          overdueAmount: 5600,
          lastUpdated: '2024-01-14 15:20:00',
          status: 'ACTIVE'
        },
        {
          id: '3',
          customerId: '3',
          customerName: '北京进出口公司',
          creditLimit: 150000,
          usedCredit: 145000,
          availableCredit: 5000,
          creditScore: 58,
          riskLevel: 'HIGH',
          paymentHistory: 76.8,
          overdueAmount: 12300,
          lastUpdated: '2024-01-13 09:45:00',
          status: 'UNDER_REVIEW'
        }
      ];
      setCreditInfos(mockCreditInfos);
    } catch (error) {
      console.error('获取信用信息失败:', error);
    }
  };

  const fetchRiskAlerts = async () => {
    try {
      // 模拟风险警报数据
      const mockRiskAlerts: RiskAlert[] = [
        {
          id: '1',
          customerId: '3',
          customerName: '北京进出口公司',
          type: 'CREDIT_LIMIT_EXCEEDED',
          severity: 'HIGH',
          message: '客户已使用信用额度的96.7%，接近信用限额',
          createdAt: '2024-01-15 14:30:00',
          resolved: false
        },
        {
          id: '2',
          customerId: '2',
          customerName: '深圳物流有限公司',
          type: 'OVERDUE_PAYMENT',
          severity: 'MEDIUM',
          message: '客户有5,600元逾期未付款项',
          createdAt: '2024-01-14 16:45:00',
          resolved: false
        },
        {
          id: '3',
          customerId: '3',
          customerName: '北京进出口公司',
          type: 'CREDIT_SCORE_DROP',
          severity: 'HIGH',
          message: '客户信用评分从72分下降至58分',
          createdAt: '2024-01-13 11:20:00',
          resolved: false
        }
      ];
      setRiskAlerts(mockRiskAlerts);
    } catch (error) {
      console.error('获取风险警报失败:', error);
    }
  };

  const filterCreditInfos = () => {
    let filtered = creditInfos;

    if (searchTerm) {
      filtered = filtered.filter(credit =>
        credit.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (riskFilter) {
      filtered = filtered.filter(credit => credit.riskLevel === riskFilter);
    }

    setFilteredCreditInfos(filtered);
  };

  const getRiskBadge = (riskLevel: string) => {
    const riskConfig = {
      LOW: { variant: 'success' as const, text: '低风险' },
      MEDIUM: { variant: 'warning' as const, text: '中风险' },
      HIGH: { variant: 'destructive' as const, text: '高风险' },
      CRITICAL: { variant: 'destructive' as const, text: '极高风险' }
    };
    
    const config = riskConfig[riskLevel as keyof typeof riskConfig];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'success' as const, text: '正常' },
      SUSPENDED: { variant: 'destructive' as const, text: '暂停' },
      UNDER_REVIEW: { variant: 'warning' as const, text: '审核中' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      LOW: { variant: 'secondary' as const, text: '低' },
      MEDIUM: { variant: 'warning' as const, text: '中' },
      HIGH: { variant: 'destructive' as const, text: '高' },
      CRITICAL: { variant: 'destructive' as const, text: '紧急' }
    };
    
    const config = severityConfig[severity as keyof typeof severityConfig];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  const getCreditUtilization = (used: number, limit: number) => {
    return ((used / limit) * 100).toFixed(1);
  };

  const resolveAlert = async (alertId: string) => {
    setRiskAlerts(alerts => 
      alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true }
          : alert
      )
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">信用管理</h1>
          <p className="text-gray-600 mt-1">管理客户信用额度和风险控制</p>
        </div>
        <Button onClick={() => setShowEditForm(true)}>
          <Edit className="h-4 w-4 mr-2" />
          设置信用额度
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总客户数</p>
                <p className="text-2xl font-bold text-gray-900">{creditInfos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总信用额度</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(creditInfos.reduce((sum, c) => sum + c.creditLimit, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已用信用</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(creditInfos.reduce((sum, c) => sum + c.usedCredit, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">风险警报</p>
                <p className="text-2xl font-bold text-gray-900">
                  {riskAlerts.filter(alert => !alert.resolved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: '概览' },
            { key: 'customers', label: '客户信用' },
            { key: 'alerts', label: '风险警报' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 概览 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 风险分布 */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">风险等级分布</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { level: 'LOW', label: '低风险', color: 'bg-green-100 text-green-800', icon: Shield },
                  { level: 'MEDIUM', label: '中风险', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
                  { level: 'HIGH', label: '高风险', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
                  { level: 'CRITICAL', label: '极高风险', color: 'bg-red-200 text-red-900', icon: AlertTriangle }
                ].map(risk => {
                  const count = creditInfos.filter(c => c.riskLevel === risk.level).length;
                  const Icon = risk.icon;
                  
                  return (
                    <div key={risk.level} className={`p-4 rounded-lg ${risk.color}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{risk.label}</p>
                          <p className="text-2xl font-bold">{count}</p>
                        </div>
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 信用使用率排行 */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">信用使用率排行</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creditInfos
                  .sort((a, b) => (b.usedCredit / b.creditLimit) - (a.usedCredit / a.creditLimit))
                  .slice(0, 5)
                  .map((credit, index) => {
                    const utilization = parseFloat(getCreditUtilization(credit.usedCredit, credit.creditLimit));
                    
                    return (
                      <div key={credit.id} className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {credit.customerName}
                            </span>
                            <span className="text-sm text-gray-600">
                              {utilization}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                utilization >= 90 ? 'bg-red-500' : 
                                utilization >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${utilization}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(credit.usedCredit)}
                          </div>
                          <div className="text-xs text-gray-500">
                            / {formatCurrency(credit.creditLimit)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 客户信用 */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* 搜索和筛选 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="搜索客户名称..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">全部风险等级</option>
                    <option value="LOW">低风险</option>
                    <option value="MEDIUM">中风险</option>
                    <option value="HIGH">高风险</option>
                    <option value="CRITICAL">极高风险</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 客户信用列表 */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">客户信用信息</h3>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        客户名称
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        信用额度
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        已用额度
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        可用额度
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        信用评分
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        风险等级
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCreditInfos.map((credit) => (
                      <tr key={credit.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {credit.customerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              付款率: {credit.paymentHistory.toFixed(1)}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(credit.creditLimit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(credit.usedCredit)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getCreditUtilization(credit.usedCredit, credit.creditLimit)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(credit.availableCredit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 mr-2">
                              {credit.creditScore}
                            </div>
                            <div className={`w-2 h-2 rounded-full ${
                              credit.creditScore >= 80 ? 'bg-green-500' :
                              credit.creditScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRiskBadge(credit.riskLevel)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(credit.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingCredit(credit);
                                setShowEditForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 风险警报 */}
      {activeTab === 'alerts' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">风险警报</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.resolved 
                      ? 'bg-gray-50 border-gray-300' 
                      : alert.severity === 'CRITICAL' 
                        ? 'bg-red-50 border-red-500'
                        : alert.severity === 'HIGH'
                          ? 'bg-orange-50 border-orange-500'
                          : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {alert.customerName}
                        </h4>
                        {getSeverityBadge(alert.severity)}
                        {alert.resolved && (
                          <Badge variant="success">已解决</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {alert.createdAt}
                      </p>
                    </div>
                    {!alert.resolved && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        标记已解决
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 