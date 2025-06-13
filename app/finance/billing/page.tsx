'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { 
  Play, 
  Pause, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Calculator,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface BillingRule {
  id: string;
  name: string;
  chargeType: string;
  rateType: 'PER_KG' | 'PER_CBM' | 'PER_SHIPMENT' | 'PERCENTAGE';
  rate: number;
  currency: string;
  isActive: boolean;
  conditions: string;
  lastRun?: string;
  nextRun?: string;
}

interface AutoBillingJob {
  id: string;
  shipmentId: string;
  shipmentNumber: string;
  customer: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalAmount: number;
  currency: string;
  createdAt: string;
  processedAt?: string;
  error?: string;
}

export default function BillingPage() {
  const [billingRules, setBillingRules] = useState<BillingRule[]>([]);
  const [billingJobs, setBillingJobs] = useState<AutoBillingJob[]>([]);
  const [activeTab, setActiveTab] = useState<'rules' | 'jobs'>('rules');
  const [loading, setLoading] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<BillingRule | null>(null);

  useEffect(() => {
    fetchBillingRules();
    fetchBillingJobs();
  }, []);

  const fetchBillingRules = async () => {
    try {
      // 模拟数据
      const mockRules: BillingRule[] = [
        {
          id: '1',
          name: '海运基础费率',
          chargeType: '海运费',
          rateType: 'PER_CBM',
          rate: 150.00,
          currency: 'USD',
          isActive: true,
          conditions: '目的港: 美国',
          lastRun: '2024-01-15 10:30:00',
          nextRun: '2024-01-16 10:30:00'
        },
        {
          id: '2',
          name: '空运重量费率',
          chargeType: '空运费',
          rateType: 'PER_KG',
          rate: 8.50,
          currency: 'USD',
          isActive: true,
          conditions: '重量 > 100kg',
          lastRun: '2024-01-15 14:20:00',
          nextRun: '2024-01-16 14:20:00'
        },
        {
          id: '3',
          name: '报关服务费',
          chargeType: '报关费',
          rateType: 'PER_SHIPMENT',
          rate: 200.00,
          currency: 'CNY',
          isActive: false,
          conditions: '需要报关服务',
          lastRun: '2024-01-14 09:00:00'
        }
      ];
      setBillingRules(mockRules);
    } catch (error) {
      console.error('获取计费规则失败:', error);
    }
  };

  const fetchBillingJobs = async () => {
    try {
      // 模拟数据
      const mockJobs: AutoBillingJob[] = [
        {
          id: '1',
          shipmentId: 'SH001',
          shipmentNumber: 'SHIP-2024-001',
          customer: '上海贸易公司',
          status: 'COMPLETED',
          totalAmount: 1500.00,
          currency: 'USD',
          createdAt: '2024-01-15 10:30:00',
          processedAt: '2024-01-15 10:31:15'
        },
        {
          id: '2',
          shipmentId: 'SH002',
          shipmentNumber: 'SHIP-2024-002',
          customer: '深圳物流有限公司',
          status: 'PROCESSING',
          totalAmount: 850.00,
          currency: 'USD',
          createdAt: '2024-01-15 14:20:00'
        },
        {
          id: '3',
          shipmentId: 'SH003',
          shipmentNumber: 'SHIP-2024-003',
          customer: '北京进出口公司',
          status: 'FAILED',
          totalAmount: 0,
          currency: 'USD',
          createdAt: '2024-01-15 16:45:00',
          error: '客户信息不完整'
        }
      ];
      setBillingJobs(mockJobs);
    } catch (error) {
      console.error('获取计费任务失败:', error);
    }
  };

  const toggleRule = async (ruleId: string) => {
    setBillingRules(rules => 
      rules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive: !rule.isActive }
          : rule
      )
    );
  };

  const runBilling = async () => {
    setLoading(true);
    try {
      // 模拟运行自动计费
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 添加新的计费任务
      const newJob: AutoBillingJob = {
        id: Date.now().toString(),
        shipmentId: 'SH004',
        shipmentNumber: 'SHIP-2024-004',
        customer: '广州货运代理',
        status: 'PROCESSING',
        totalAmount: 1200.00,
        currency: 'USD',
        createdAt: new Date().toLocaleString()
      };
      
      setBillingJobs(jobs => [newJob, ...jobs]);
      alert('自动计费任务已启动');
    } catch (error) {
      console.error('运行自动计费失败:', error);
      alert('运行自动计费失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, icon: Clock, text: '等待中' },
      PROCESSING: { variant: 'warning' as const, icon: Clock, text: '处理中' },
      COMPLETED: { variant: 'success' as const, icon: CheckCircle, text: '已完成' },
      FAILED: { variant: 'destructive' as const, icon: AlertCircle, text: '失败' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const getRateTypeText = (rateType: string) => {
    const types = {
      'PER_KG': '按重量',
      'PER_CBM': '按体积',
      'PER_SHIPMENT': '按票',
      'PERCENTAGE': '按百分比'
    };
    return types[rateType as keyof typeof types] || rateType;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">自动计费</h1>
          <p className="text-gray-600 mt-1">管理计费规则和自动计费任务</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runBilling} disabled={loading}>
            <Play className="h-4 w-4 mr-2" />
            {loading ? '运行中...' : '运行计费'}
          </Button>
          <Button variant="outline" onClick={() => setShowRuleForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新建规则
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">活跃规则</p>
                <p className="text-2xl font-bold text-gray-900">
                  {billingRules.filter(rule => rule.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">处理中任务</p>
                <p className="text-2xl font-bold text-gray-900">
                  {billingJobs.filter(job => job.status === 'PROCESSING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日完成</p>
                <p className="text-2xl font-bold text-gray-900">
                  {billingJobs.filter(job => job.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">失败任务</p>
                <p className="text-2xl font-bold text-gray-900">
                  {billingJobs.filter(job => job.status === 'FAILED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            计费规则
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'jobs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            计费任务
          </button>
        </nav>
      </div>

      {/* 计费规则 */}
      {activeTab === 'rules' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">计费规则</h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      规则名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      费用类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      计费方式
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      费率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最后运行
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {billingRules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {rule.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {rule.conditions}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rule.chargeType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getRateTypeText(rule.rateType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rule.rate} {rule.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={rule.isActive ? 'success' : 'secondary'}>
                          {rule.isActive ? '启用' : '禁用'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rule.lastRun || '从未运行'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRule(rule.id)}
                          >
                            {rule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingRule(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
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
      )}

      {/* 计费任务 */}
      {activeTab === 'jobs' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">计费任务</h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      货运单号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      客户
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金额
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      处理时间
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {billingJobs.map((job) => (
                    <tr key={job.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {job.shipmentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.totalAmount.toFixed(2)} {job.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(job.status)}
                        {job.error && (
                          <div className="text-xs text-red-600 mt-1">
                            {job.error}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.processedAt || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 