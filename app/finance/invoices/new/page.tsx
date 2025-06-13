'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Customer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [invoiceData, setInvoiceData] = useState({
    type: 'COMMERCIAL',
    currency: 'CNY',
    description: '',
    terms: '30天付款',
    dueDate: ''
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, amount: 0 }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    // 设置默认到期日期（30天后）
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setInvoiceData(prev => ({
      ...prev,
      dueDate: defaultDueDate.toISOString().split('T')[0]
    }));
  }, []);

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

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // 自动计算金额
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.13; // 13%税率
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      alert('请选择客户');
      return;
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      alert('请完善发票明细信息');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/finance/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: selectedCustomer,
          ...invoiceData,
          items: items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            chargeTypeId: 'default-charge-type' // 这里应该从费用类型选择
          }))
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('发票创建成功！');
        router.push('/finance/invoices');
      } else {
        alert('创建发票失败: ' + data.error);
      }
    } catch (error) {
      console.error('创建发票失败:', error);
      alert('创建发票失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Link href="/finance/invoices">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">创建发票</h1>
          <p className="text-gray-600 mt-1">创建新的客户发票</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">基本信息</h3>
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
                  发票类型
                </label>
                <select
                  value={invoiceData.type}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="COMMERCIAL">商业发票</option>
                  <option value="VAT">增值税发票</option>
                  <option value="PROFORMA">形式发票</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  币种
                </label>
                <select
                  value={invoiceData.currency}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, currency: e.target.value }))}
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
                  到期日期
                </label>
                <Input
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                发票描述
              </label>
              <Input
                value={invoiceData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setInvoiceData(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder="请输入发票描述"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                付款条款
              </label>
              <Input
                value={invoiceData.terms}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setInvoiceData(prev => ({ ...prev, terms: e.target.value }))
                }
                placeholder="付款条款"
              />
            </div>
          </CardContent>
        </Card>

        {/* 发票明细 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">发票明细</h3>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                添加明细
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      描述 *
                    </label>
                    <Input
                      value={item.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        updateItem(item.id, 'description', e.target.value)
                      }
                      placeholder="费用描述"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      数量 *
                    </label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      单价 *
                    </label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      金额
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      {item.amount.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* 金额汇总 */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>小计:</span>
                    <span>{calculateSubtotal().toFixed(2)} {invoiceData.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>税额 (13%):</span>
                    <span>{calculateTax().toFixed(2)} {invoiceData.currency}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>总计:</span>
                    <span>{calculateTotal().toFixed(2)} {invoiceData.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-4">
          <Link href="/finance/invoices">
            <Button variant="outline">取消</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? '创建中...' : '创建发票'}
          </Button>
        </div>
      </form>
    </div>
  );
} 