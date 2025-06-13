'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit,
  CreditCard,
  DollarSign,
  TrendingUp,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface Payment {
  id: string;
  paymentNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  method: string;
  paymentDate: string;
  transactionRef: string;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  invoiceId?: string;
  invoiceNumber?: string;
  isAdvance: boolean;
  createdAt: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, methodFilter, dateRange]);

  const fetchPayments = async () => {
    try {
      // 模拟付款数据
      const mockPayments: Payment[] = [
        {
          id: '1',
          paymentNumber: 'PAY-2024-001',
          customerId: '1',
          customerName: '上海贸易公司',
          amount: 15600.00,
          currency: 'CNY',
          method: 'BANK_TRANSFER',
          paymentDate: '2024-01-15',
          transactionRef: 'TXN20240115001',
          description: '发票INV-2024-001付款',
          status: 'COMPLETED',
          invoiceId: '1',
          invoiceNumber: 'INV-2024-001',
          isAdvance: false,
          createdAt: '2024-01-15 10:30:00'
        },
        {
          id: '2',
          paymentNumber: 'PAY-2024-002',
          customerId: '2',
          customerName: '深圳物流有限公司',
          amount: 8500.00,
          currency: 'USD',
          method: 'ALIPAY',
          paymentDate: '2024-01-14',
          transactionRef: 'ALI20240114002',
          description: '预付款',
          status: 'COMPLETED',
          isAdvance: true,
          createdAt: '2024-01-14 15:20:00'
        },
        {
          id: '3',
          paymentNumber: 'PAY-2024-003',
          customerId: '3',
          customerName: '北京进出口公司',
          amount: 12300.00,
          currency: 'CNY',
          method: 'WECHAT',
          paymentDate: '2024-01-13',
          transactionRef: 'WX20240113003',
          description: '发票INV-2024-003部分付款',
          status: 'PENDING',
          invoiceId: '3',
          invoiceNumber: 'INV-2024-003',
          isAdvance: false,
          createdAt: '2024-01-13 09:45:00'
        },
        {
          id: '4',
          paymentNumber: 'PAY-2024-004',
          customerId: '1',
          customerName: '上海贸易公司',
          amount: 5000.00,
          currency: 'CNY',
          method: 'CASH',
          paymentDate: '2024-01-12',
          transactionRef: '',
          description: '现金付款',
          status: 'FAILED',
          invoiceId: '2',
          invoiceNumber: 'INV-2024-002',
          isAdvance: false,
          createdAt: '2024-01-12 14:30:00'
        }
      ];
      setPayments(mockPayments);
    } catch (error) {
      console.error('获取付款记录失败:', error);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionRef.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    if (methodFilter) {
      filtered = filtered.filter(payment => payment.method === methodFilter);
    }

    if (dateRange.startDate) {
      filtered = filtered.filter(payment => payment.paymentDate >= dateRange.startDate);
    }

    if (dateRange.endDate) {
      filtered = filtered.filter(payment => payment.paymentDate <= dateRange.endDate);
    }

    setFilteredPayments(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'warning' as const, text: '待处理' },
      COMPLETED: { variant: 'success' as const, text: '已完成' },
      FAILED: { variant: 'destructive' as const, text: '失败' },
      CANCELLED: { variant: 'secondary' as const, text: '已取消' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getMethodText = (method: string) => {
    const methods = {
      'BANK_TRANSFER': '银行转账',
      'ALIPAY': '支付宝',
      'WECHAT': '微信支付',
      'CASH': '现金',
      'CHECK': '支票',
      'CREDIT_CARD': '信用卡'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getTotalStats = () => {
    const completed = filteredPayments.filter(p => p.status === 'COMPLETED');
    const totalAmount = completed.reduce((sum, p) => {
      // 简化处理，统一按CNY计算
      const rate = p.currency === 'USD' ? 7.2 : p.currency === 'EUR' ? 7.8 : 1;
      return sum + (p.amount * rate);
    }, 0);
    
    return {
      totalPayments: filteredPayments.length,
      completedPayments: completed.length,
      totalAmount: totalAmount,
      advancePayments: completed.filter(p => p.isAdvance).length
    };
  };

  const stats = getTotalStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">付款管理</h1>
          <p className="text-gray-600 mt-1">管理客户付款记录</p>
        </div>
        <Link href="/finance/payments/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            记录付款
          </Button>
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总付款数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总金额</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalAmount, 'CNY')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">预付款</p>
                <p className="text-2xl font-bold text-gray-900">{stats.advancePayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索付款号、客户或交易号..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部状态</option>
                <option value="PENDING">待处理</option>
                <option value="COMPLETED">已完成</option>
                <option value="FAILED">失败</option>
                <option value="CANCELLED">已取消</option>
              </select>
            </div>

            <div>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部付款方式</option>
                <option value="BANK_TRANSFER">银行转账</option>
                <option value="ALIPAY">支付宝</option>
                <option value="WECHAT">微信支付</option>
                <option value="CASH">现金</option>
                <option value="CHECK">支票</option>
                <option value="CREDIT_CARD">信用卡</option>
              </select>
            </div>

            <div>
              <Input
                type="date"
                placeholder="开始日期"
                value={dateRange.startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setDateRange(prev => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>

            <div>
              <Input
                type="date"
                placeholder="结束日期"
                value={dateRange.endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setDateRange(prev => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 付款列表 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">付款记录</h3>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    付款号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客户
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    付款方式
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    付款日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    关联发票
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
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.paymentNumber}
                        </div>
                        {payment.transactionRef && (
                          <div className="text-sm text-gray-500">
                            {payment.transactionRef}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                      {payment.isAdvance && (
                        <div className="text-xs text-blue-600">预付款</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getMethodText(payment.method)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.paymentDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.invoiceNumber || (payment.isAdvance ? '预付款' : '-')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">暂无付款记录</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter || methodFilter ? '没有符合筛选条件的付款记录' : '还没有任何付款记录'}
              </p>
              {!searchTerm && !statusFilter && !methodFilter && (
                <div className="mt-6">
                  <Link href="/finance/payments/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      记录第一笔付款
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 