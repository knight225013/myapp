'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { 
  Search, 
  Plus, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Users,
  Calendar,
  Download
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalReceivables: number;
  totalPayables: number;
  overdueAmount: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  creditAlerts: number;
}

interface RecentActivity {
  id: string;
  type: 'invoice' | 'payment' | 'credit_note';
  description: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
}

export default function FinancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalReceivables: 0,
    totalPayables: 0,
    overdueAmount: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
    creditAlerts: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/finance/reports/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data.stats);
        setRecentActivity(data.data.recentActivity);
      }
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch(`/api/finance/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('搜索结果:', data.data);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'CNY') => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PAID': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'OVERDUE': 'bg-red-100 text-red-800',
      'DRAFT': 'bg-gray-100 text-gray-800',
      'APPROVED': 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <FileText className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'credit_note':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">财务管理系统</h1>
          <p className="text-gray-600 mt-1">国际货运代理财务管理平台</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索客户、运单号、发票号..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} variant="outline">
            搜索
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">应收账款</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.totalReceivables)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">应付账款</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.totalPayables)}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">逾期金额</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.overdueAmount)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">本月收入</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.monthlyRevenue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">待处理发票</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.pendingInvoices}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">信用预警</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.creditAlerts}
                </p>
              </div>
              <Users className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5" />
            快捷操作
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link href="/finance/invoices/new">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <FileText className="h-6 w-6" />
                <span className="text-sm">创建发票</span>
              </Button>
            </Link>
            
            <Link href="/finance/payments/new">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <CreditCard className="h-6 w-6" />
                <span className="text-sm">记录付款</span>
              </Button>
            </Link>
            
            <Link href="/finance/billing">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">自动计费</span>
              </Button>
            </Link>
            
            <Link href="/finance/statements">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">生成对账单</span>
              </Button>
            </Link>
            
            <Link href="/finance/reports">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Download className="h-6 w-6" />
                <span className="text-sm">财务报表</span>
              </Button>
            </Link>
            
            <Link href="/finance/credit">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span className="text-sm">信用管理</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">最近活动</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.date).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(activity.amount, activity.currency)}
                    </p>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>暂无最近活动</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
