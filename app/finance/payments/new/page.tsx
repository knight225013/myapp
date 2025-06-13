'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft, Save, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Customer {
  id: string;
  name: string;
  companyName: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  balanceAmount: number;
  currency: string;
}

export default function NewPaymentPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    currency: 'CNY',
    method: 'BANK_TRANSFER',
    paymentDate: new Date().toISOString().split('T')[0],
    transactionRef: '',
    description: '',
    isAdvance: false,
    invoiceId: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerInvoices(selectedCustomer);
    }
  }, [selectedCustomer]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error('获取客户列表失败:', error);
    }
  };

  const fetchCustomerInvoices = async (customerId: string) => {
    try {
      const response = await fetch(`/api/finance/invoices?customerId=${customerId}&status=SENT`);
      const data = await response.json();
      if (data.success) {
        // 模拟发票数据
        const mockInvoices: Invoice[] = [
          {
            id: '1',
            invoiceNumber: 'INV-2024-001',
            totalAmount: 1130.00,
            balanceAmount: 1130.00,
            currency: 'CNY'
          },
          {
            id: '2',
            invoiceNumber: 'INV-2024-002',
            totalAmount: 565.00,
            balanceAmount: 300.00,
            currency: 'USD'
          }
        ];
        setInvoices(mockInvoices);
      }
    } catch (error) {
      console.error('获取发票列表失败:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      alert('请选择客户');
      return;
    }

    if (paymentData.amount <= 0) {
      alert('请输入有效的付款金额');
      return;
    }

    if (!paymentData.isAdvance && !paymentData.invoiceId) {
      alert('请选择要付款的发票，或选择预付款');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/finance/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: selectedCustomer,
          ...paymentData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('付款记录创建成功！');
        router.push('/finance/payments');
      } else {
        alert('创建付款记录失败: ' + data.error);
      }
    } catch (error) {
      console.error('创建付款记录失败:', error);
      alert('创建付款记录失败');
    } finally {
      setLoading(false);
    }
  };

  const selectedInvoice = invoices.find(inv => inv.id === paymentData.invoiceId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Link href="/finance/payments">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">记录付款</h1>
          <p className="text-gray-600 mt-1">记录客户付款信息</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">付款信息</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  客户 *
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  付款方式 *
                </label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="BANK_TRANSFER">银行转账</option>
                  <option value="ALIPAY">支付宝</option>
                  <option value="WECHAT">微信支付</option>
                  <option value="CASH">现金</option>
                  <option value="CHECK">支票</option>
                  <option value="CREDIT_CARD">信用卡</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  付款金额 *
                </label>
                <Input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
                  }
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  币种
                </label>
                <select
                  value={paymentData.currency}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CNY">人民币 (CNY)</option>
                  <option value="USD">美元 (USD)</option>
                  <option value="EUR">欧元 (EUR)</option>
                  <option value="GBP">英镑 (GBP)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  付款日期 *
                </label>
                <Input
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setPaymentData(prev => ({ ...prev, paymentDate: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  交易参考号
                </label>
                <Input
                  value={paymentData.transactionRef}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setPaymentData(prev => ({ ...prev, transactionRef: e.target.value }))
                  }
                  placeholder="银行流水号或交易号"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                付款说明
              </label>
              <Input
                value={paymentData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setPaymentData(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder="付款说明或备注"
              />
            </div>
          </CardContent>
        </Card>

        {/* 付款分配 */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">付款分配</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAdvance"
                checked={paymentData.isAdvance}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  isAdvance: e.target.checked,
                  invoiceId: e.target.checked ? '' : prev.invoiceId
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isAdvance" className="text-sm font-medium text-gray-700">
                这是预付款（不分配到具体发票）
              </label>
            </div>

            {!paymentData.isAdvance && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择发票 *
                </label>
                <select
                  value={paymentData.invoiceId}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, invoiceId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!paymentData.isAdvance}
                >
                  <option value="">请选择要付款的发票</option>
                  {invoices.map(invoice => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber} - 余额: {invoice.balanceAmount.toFixed(2)} {invoice.currency}
                    </option>
                  ))}
                </select>

                {selectedInvoice && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">发票信息</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">发票号:</span>
                        <span className="ml-2 font-medium">{selectedInvoice.invoiceNumber}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">发票总额:</span>
                        <span className="ml-2 font-medium">
                          {selectedInvoice.totalAmount.toFixed(2)} {selectedInvoice.currency}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700">未付余额:</span>
                        <span className="ml-2 font-medium text-red-600">
                          {selectedInvoice.balanceAmount.toFixed(2)} {selectedInvoice.currency}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700">本次付款:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {paymentData.amount.toFixed(2)} {paymentData.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentData.isAdvance && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    此付款将作为预付款记录，可在后续发票中自动抵扣
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-4">
          <Link href="/finance/payments">
            <Button variant="outline">取消</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? '保存中...' : '保存付款记录'}
          </Button>
        </div>
      </form>
    </div>
  );
} 