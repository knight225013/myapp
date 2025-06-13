'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download, 
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';

interface ReportData {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  receivables: number;
  payables: number;
  cashFlow: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface AgingData {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    revenue: 0,
    expenses: 0,
    profit: 0,
    profitMargin: 0,
    receivables: 0,
    payables: 0,
    cashFlow: 0
  });
  
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [agingData, setAgingData] = useState<AgingData>({
    current: 0,
    days30: 0,
    days60: 0,
    days90: 0,
    over90: 0
  });
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<'overview' | 'profit-loss' | 'cash-flow' | 'aging'>('overview');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // 模拟报表数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReportData: ReportData = {
        revenue: 156800.00,
        expenses: 98500.00,
        profit: 58300.00,
        profitMargin: 37.2,
        receivables: 45600.00,
        payables: 23400.00,
        cashFlow: 22200.00
      };
      
      const mockMonthlyData: MonthlyData[] = [
        { month: '2024-01', revenue: 145000, expenses: 89000, profit: 56000 },
        { month: '2024-02', revenue: 156800, expenses: 98500, profit: 58300 },
        { month: '2024-03', revenue: 168900, expenses: 102000, profit: 66900 },
        { month: '2024-04', revenue: 142300, expenses: 87600, profit: 54700 },
        { month: '2024-05', revenue: 159600, expenses: 95800, profit: 63800 },
        { month: '2024-06', revenue: 173400, expenses: 108900, profit: 64500 }
      ];
      
      const mockAgingData: AgingData = {
        current: 28500.00,
        days30: 12300.00,
        days60: 8900.00,
        days90: 4200.00,
        over90: 2100.00
      };
      
      setReportData(mockReportData);
      setMonthlyData(mockMonthlyData);
      setAgingData(mockAgingData);
    } catch (error) {
      console.error('获取报表数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (reportType: string) => {
    try {
      alert(`正在导出${reportType}报表...`);
      // 这里应该调用实际的导出API
    } catch (error) {
      console.error('导出报表失败:', error);
      alert('导出报表失败');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
        <span className="text-sm font-medium">
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">财务报表</h1>
          <p className="text-gray-600 mt-1">查看和分析财务数据</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchReportData()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
          <Button onClick={() => exportReport('综合财务')}>
            <Download className="h-4 w-4 mr-2" />
            导出报表
          </Button>
        </div>
      </div>

      {/* 日期筛选 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开始日期
              </label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setDateRange(prev => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                结束日期
              </label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setDateRange(prev => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
            <Button onClick={fetchReportData} disabled={loading}>
              <Filter className="h-4 w-4 mr-2" />
              应用筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 报表导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: '概览' },
            { key: 'profit-loss', label: '损益表' },
            { key: 'cash-flow', label: '现金流' },
            { key: 'aging', label: '账龄分析' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveReport(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeReport === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 概览报表 */}
      {activeReport === 'overview' && (
        <div className="space-y-6">
          {/* 关键指标 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总收入</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(reportData.revenue)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  {getChangeIndicator(reportData.revenue, 145000)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总支出</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(reportData.expenses)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4">
                  {getChangeIndicator(reportData.expenses, 89000)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">净利润</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(reportData.profit)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  {getChangeIndicator(reportData.profit, 56000)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">利润率</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  {getChangeIndicator(reportData.profitMargin, 38.6)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 月度趋势图 */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">月度趋势</h3>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-end justify-between space-x-2">
                {monthlyData.map((data, index) => {
                  const maxValue = Math.max(...monthlyData.map(d => d.revenue));
                  const revenueHeight = (data.revenue / maxValue) * 100;
                  const expenseHeight = (data.expenses / maxValue) * 100;
                  const profitHeight = (data.profit / maxValue) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                      <div className="w-full flex justify-center space-x-1">
                        <div 
                          className="w-4 bg-blue-500 rounded-t"
                          style={{ height: `${revenueHeight}%` }}
                          title={`收入: ${formatCurrency(data.revenue)}`}
                        />
                        <div 
                          className="w-4 bg-red-500 rounded-t"
                          style={{ height: `${expenseHeight}%` }}
                          title={`支出: ${formatCurrency(data.expenses)}`}
                        />
                        <div 
                          className="w-4 bg-green-500 rounded-t"
                          style={{ height: `${profitHeight}%` }}
                          title={`利润: ${formatCurrency(data.profit)}`}
                        />
                      </div>
                      <div className="text-xs text-gray-600 text-center">
                        {data.month.split('-')[1]}月
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">收入</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">支出</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">利润</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 损益表 */}
      {activeReport === 'profit-loss' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">损益表</h3>
              <Button variant="outline" onClick={() => exportReport('损益表')}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-900 mb-3">收入</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">海运收入</span>
                    <span className="font-medium">{formatCurrency(89600)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">空运收入</span>
                    <span className="font-medium">{formatCurrency(45200)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">其他服务收入</span>
                    <span className="font-medium">{formatCurrency(22000)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>总收入</span>
                    <span>{formatCurrency(reportData.revenue)}</span>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-900 mb-3">支出</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">运输成本</span>
                    <span className="font-medium">{formatCurrency(56800)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">人工成本</span>
                    <span className="font-medium">{formatCurrency(25600)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">管理费用</span>
                    <span className="font-medium">{formatCurrency(12400)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">其他费用</span>
                    <span className="font-medium">{formatCurrency(3700)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>总支出</span>
                    <span>{formatCurrency(reportData.expenses)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-green-800">净利润</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(reportData.profit)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-green-700">利润率</span>
                  <span className="text-lg font-semibold text-green-600">
                    {reportData.profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 现金流报表 */}
      {activeReport === 'cash-flow' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">现金流量表</h3>
              <Button variant="outline" onClick={() => exportReport('现金流量表')}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">应收账款</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(reportData.receivables)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">客户欠款</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">应付账款</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(reportData.payables)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">供应商欠款</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">净现金流</h4>
                    <p className={`text-2xl font-bold ${reportData.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(reportData.cashFlow)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">现金净流入</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-gray-900">现金流明细</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-800">经营活动现金流入</span>
                  <span className="font-semibold text-green-600">{formatCurrency(134500)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-red-800">经营活动现金流出</span>
                  <span className="font-semibold text-red-600">{formatCurrency(112300)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-800">经营活动净现金流</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(22200)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 账龄分析 */}
      {activeReport === 'aging' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">应收账款账龄分析</h3>
              <Button variant="outline" onClick={() => exportReport('账龄分析')}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 账龄分布图 */}
              <div className="h-64 flex items-end justify-between space-x-4">
                {[
                  { label: '当前', amount: agingData.current, color: 'bg-green-500' },
                  { label: '1-30天', amount: agingData.days30, color: 'bg-yellow-500' },
                  { label: '31-60天', amount: agingData.days60, color: 'bg-orange-500' },
                  { label: '61-90天', amount: agingData.days90, color: 'bg-red-500' },
                  { label: '90天以上', amount: agingData.over90, color: 'bg-red-700' }
                ].map((item, index) => {
                  const maxAmount = Math.max(...Object.values(agingData));
                  const height = (item.amount / maxAmount) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                      <div 
                        className={`w-full ${item.color} rounded-t`}
                        style={{ height: `${height}%` }}
                        title={formatCurrency(item.amount)}
                      />
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.amount)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {item.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 账龄详细表格 */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        账龄区间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        金额
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        占比
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        风险等级
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { label: '当前（未到期）', amount: agingData.current, risk: '低', color: 'text-green-600' },
                      { label: '1-30天', amount: agingData.days30, risk: '低', color: 'text-yellow-600' },
                      { label: '31-60天', amount: agingData.days60, risk: '中', color: 'text-orange-600' },
                      { label: '61-90天', amount: agingData.days90, risk: '高', color: 'text-red-600' },
                      { label: '90天以上', amount: agingData.over90, risk: '极高', color: 'text-red-700' }
                    ].map((item, index) => {
                      const total = Object.values(agingData).reduce((sum, val) => sum + val, 0);
                      const percentage = ((item.amount / total) * 100).toFixed(1);
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.label}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {percentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`font-medium ${item.color}`}>
                              {item.risk}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 