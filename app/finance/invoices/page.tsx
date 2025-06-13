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
  Eye, 
  Edit, 
  Trash2, 
  Send, 
  Download,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: string;
  status: string;
  customerName: string;
  currency: string;
  totalAmount: number;
  balanceAmount: number;
  issueDate: string;
  dueDate: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, statusFilter, typeFilter, searchQuery]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/finance/invoices?${params}`);
      const data = await response.json();

      if (data.success) {
        setInvoices(data.data.invoices);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('获取发票列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchInvoices();
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
    setCurrentPage(1);
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
      'DRAFT': 'bg-gray-100 text-gray-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-blue-100 text-blue-800',
      'SENT': 'bg-purple-100 text-purple-800',
      'PAID': 'bg-green-100 text-green-800',
      'OVERDUE': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-gray-100 text-gray-800',
      'VOIDED': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'VAT': '增值税发票',
      'COMMERCIAL': '商业发票',
      'PROFORMA': '形式发票',
      'DEBIT_NOTE': '借记单',
      'CREDIT_NOTE': '贷记单'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleApprove = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/finance/invoices/${invoiceId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: '批准发票' })
      });

      if (response.ok) {
        fetchInvoices();
      }
    } catch (error) {
      console.error('审批发票失败:', error);
    }
  };

  const handleSend = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/finance/invoices/${invoiceId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'customer@example.com' })
      });

      if (response.ok) {
        fetchInvoices();
      }
    } catch (error) {
      console.error('发送发票失败:', error);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('确定要删除这张发票吗？')) return;

    try {
      const response = await fetch(`/api/finance/invoices/${invoiceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchInvoices();
      }
    } catch (error) {
      console.error('删除发票失败:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">发票管理</h1>
          <p className="text-gray-600 mt-1">管理客户发票和计费</p>
        </div>
        
        <Link href="/finance/invoices/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            创建发票
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索发票号、客户名称..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有状态</option>
                <option value="DRAFT">草稿</option>
                <option value="PENDING">待审核</option>
                <option value="APPROVED">已审核</option>
                <option value="SENT">已发送</option>
                <option value="PAID">已付款</option>
                <option value="OVERDUE">逾期</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有类型</option>
                <option value="COMMERCIAL">商业发票</option>
                <option value="VAT">增值税发票</option>
                <option value="PROFORMA">形式发票</option>
                <option value="CREDIT_NOTE">贷记单</option>
              </select>
              
              <Button onClick={handleSearch} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">发票列表</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">发票号</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">客户</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">类型</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">金额</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">余额</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">开票日期</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">到期日期</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-blue-600">
                          {invoice.invoiceNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{invoice.customerName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {getTypeLabel(invoice.type)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">
                          {formatCurrency(invoice.totalAmount, invoice.currency)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`font-medium ${invoice.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(invoice.balanceAmount, invoice.currency)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {new Date(invoice.issueDate).toLocaleDateString('zh-CN')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {new Date(invoice.dueDate).toLocaleDateString('zh-CN')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/finance/invoices/${invoice.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {invoice.status === 'DRAFT' && (
                            <>
                              <Link href={`/finance/invoices/${invoice.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDelete(invoice.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {invoice.status === 'PENDING' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleApprove(invoice.id)}
                            >
                              批准
                            </Button>
                          )}
                          
                          {invoice.status === 'APPROVED' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSend(invoice.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>暂无发票数据</p>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            上一页
          </Button>
          
          <span className="flex items-center px-4 py-2 text-sm text-gray-600">
            第 {currentPage} 页，共 {totalPages} 页
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
} 