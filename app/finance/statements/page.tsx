'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { 
  FileText, 
  Download, 
  Send, 
  Plus, 
  Eye, 
  Calendar,
  Filter,
  Search
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  companyName: string;
  email: string;
}

interface Statement {
  id: string;
  statementNumber: string;
  customerId: string;
  customerName: string;
  periodStart: string;
  periodEnd: string;
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  balanceAmount: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID';
  createdAt: string;
  sentAt?: string;
  viewedAt?: string;
}

export default function StatementsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [filteredStatements, setFilteredStatements] = useState<Statement[]>([]);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [generateForm, setGenerateForm] = useState({
    customerId: '',
    periodStart: '',
    periodEnd: '',
    currency: 'CNY'
  });

  useEffect(() => {
    fetchCustomers();
    fetchStatements();
  }, []);

  useEffect(() => {
    filterStatements();
  }, [statements, searchTerm, statusFilter]);

  const fetchCustomers = async () => {
    try {
      // 模拟客户数据
      const mockCustomers: Customer[] = [
        { id: '1', name: '张三', companyName: '上海贸易公司', email: 'zhang@example.com' },
        { id: '2', name: '李四', companyName: '深圳物流有限公司', email: 'li@example.com' },
        { id: '3', name: '王五', companyName: '北京进出口公司', email: 'wang@example.com' }
      ];
      setCustomers(mockCustomers);
    } catch (error) {
      console.error('获取客户列表失败:', error);
    }
  };

  const fetchStatements = async () => {
    try {
      // 模拟对账单数据
      const mockStatements: Statement[] = [
        {
          id: '1',
          statementNumber: 'STMT-2024-001',
          customerId: '1',
          customerName: '上海贸易公司',
          periodStart: '2024-01-01',
          periodEnd: '2024-01-31',
          totalInvoices: 5,
          totalAmount: 15600.00,
          totalPaid: 12000.00,
          balanceAmount: 3600.00,
          currency: 'CNY',
          status: 'SENT',
          createdAt: '2024-02-01 10:00:00',
          sentAt: '2024-02-01 14:30:00'
        },
        {
          id: '2',
          statementNumber: 'STMT-2024-002',
          customerId: '2',
          customerName: '深圳物流有限公司',
          periodStart: '2024-01-01',
          periodEnd: '2024-01-31',
          totalInvoices: 3,
          totalAmount: 8500.00,
          totalPaid: 8500.00,
          balanceAmount: 0,
          currency: 'USD',
          status: 'PAID',
          createdAt: '2024-02-01 11:00:00',
          sentAt: '2024-02-01 15:00:00',
          viewedAt: '2024-02-02 09:15:00'
        },
        {
          id: '3',
          statementNumber: 'STMT-2024-003',
          customerId: '3',
          customerName: '北京进出口公司',
          periodStart: '2024-01-01',
          periodEnd: '2024-01-31',
          totalInvoices: 7,
          totalAmount: 22300.00,
          totalPaid: 18000.00,
          balanceAmount: 4300.00,
          currency: 'CNY',
          status: 'VIEWED',
          createdAt: '2024-02-01 12:00:00',
          sentAt: '2024-02-01 16:00:00',
          viewedAt: '2024-02-03 10:30:00'
        }
      ];
      setStatements(mockStatements);
    } catch (error) {
      console.error('获取对账单列表失败:', error);
    }
  };

  const filterStatements = () => {
    let filtered = statements;

    if (searchTerm) {
      filtered = filtered.filter(statement =>
        statement.statementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        statement.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(statement => statement.status === statusFilter);
    }

    setFilteredStatements(filtered);
  };

  const handleGenerateStatement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!generateForm.customerId || !generateForm.periodStart || !generateForm.periodEnd) {
      alert('请填写完整信息');
      return;
    }

    setLoading(true);
    try {
      // 模拟生成对账单
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const customer = customers.find(c => c.id === generateForm.customerId);
      const newStatement: Statement = {
        id: Date.now().toString(),
        statementNumber: `STMT-2024-${String(statements.length + 1).padStart(3, '0')}`,
        customerId: generateForm.customerId,
        customerName: customer?.companyName || customer?.name || '',
        periodStart: generateForm.periodStart,
        periodEnd: generateForm.periodEnd,
        totalInvoices: Math.floor(Math.random() * 10) + 1,
        totalAmount: Math.random() * 20000 + 5000,
        totalPaid: 0,
        balanceAmount: 0,
        currency: generateForm.currency,
        status: 'DRAFT',
        createdAt: new Date().toLocaleString()
      };
      
      newStatement.balanceAmount = newStatement.totalAmount - newStatement.totalPaid;
      
      setStatements([newStatement, ...statements]);
      setShowGenerateForm(false);
      setGenerateForm({
        customerId: '',
        periodStart: '',
        periodEnd: '',
        currency: 'CNY'
      });
      
      alert('对账单生成成功！');
    } catch (error) {
      console.error('生成对账单失败:', error);
      alert('生成对账单失败');
    } finally {
      setLoading(false);
    }
  };

  const sendStatement = async (statementId: string) => {
    try {
      setStatements(statements.map(stmt => 
        stmt.id === statementId 
          ? { ...stmt, status: 'SENT' as const, sentAt: new Date().toLocaleString() }
          : stmt
      ));
      alert('对账单发送成功！');
    } catch (error) {
      console.error('发送对账单失败:', error);
      alert('发送对账单失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: 'secondary' as const, text: '草稿' },
      SENT: { variant: 'warning' as const, text: '已发送' },
      VIEWED: { variant: 'info' as const, text: '已查看' },
      PAID: { variant: 'success' as const, text: '已付款' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">对账单管理</h1>
          <p className="text-gray-600 mt-1">生成和管理客户对账单</p>
        </div>
        <Button onClick={() => setShowGenerateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          生成对账单
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总对账单</p>
                <p className="text-2xl font-bold text-gray-900">{statements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已发送</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statements.filter(s => s.status !== 'DRAFT').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已查看</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statements.filter(s => s.status === 'VIEWED' || s.status === 'PAID').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">未付余额</p>
                <p className="text-2xl font-bold text-gray-900">
                  ¥{statements.reduce((sum, s) => sum + s.balanceAmount, 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索对账单号或客户名称..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部状态</option>
                <option value="DRAFT">草稿</option>
                <option value="SENT">已发送</option>
                <option value="VIEWED">已查看</option>
                <option value="PAID">已付款</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 对账单列表 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">对账单列表</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    对账单号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客户
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    账期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    发票数量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    总金额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    未付余额
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
                {filteredStatements.map((statement) => (
                  <tr key={statement.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {statement.statementNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {statement.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {statement.periodStart} ~ {statement.periodEnd}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {statement.totalInvoices}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {statement.totalAmount.toFixed(2)} {statement.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={statement.balanceAmount > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                        {statement.balanceAmount.toFixed(2)} {statement.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(statement.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        {statement.status === 'DRAFT' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => sendStatement(statement.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 生成对账单表单 */}
      {showGenerateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">生成对账单</h3>
            <form onSubmit={handleGenerateStatement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  客户 *
                </label>
                <select
                  value={generateForm.customerId}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, customerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">请选择客户</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.companyName || customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    开始日期 *
                  </label>
                  <Input
                    type="date"
                    value={generateForm.periodStart}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setGenerateForm(prev => ({ ...prev, periodStart: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    结束日期 *
                  </label>
                  <Input
                    type="date"
                    value={generateForm.periodEnd}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setGenerateForm(prev => ({ ...prev, periodEnd: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  币种
                </label>
                <select
                  value={generateForm.currency}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CNY">人民币 (CNY)</option>
                  <option value="USD">美元 (USD)</option>
                  <option value="EUR">欧元 (EUR)</option>
                  <option value="GBP">英镑 (GBP)</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowGenerateForm(false)}
                >
                  取消
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? '生成中...' : '生成对账单'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 