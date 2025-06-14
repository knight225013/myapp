import { useState, useEffect } from 'react';
import {
  CreditCard,
  Wallet,
  Search,
  FilePlus,
  Upload,
  Settings,
  File,
  Send,
  Eye,
  Check,
  X,
  Clock,
  DollarSign,
  FileCheck,
  Trash,
} from 'lucide-react';
import FinanceFilterPanel from './FinanceFilterPanel';

type FinanceRecord = {
  id: string;
  orderId?: string;
  client: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  exception?: string;
};

type FinanceFilters = {
  client: string;
  currency: string;
  dueDate: string;
  status: string;
};

export default function FinancePanel() {
  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
  const [filters, setFilters] = useState<FinanceFilters>({
    client: '',
    currency: '',
    dueDate: '',
    status: '',
  });
  const [receivables, setReceivables] = useState<FinanceRecord[]>([]);
  const [payables, setPayables] = useState<FinanceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<FinanceRecord[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        type: activeTab,
        status: filters.status,
        ...(filters.dueDate && { dueDate: filters.dueDate }),
        ...(filters.client && { client: filters.client }),
        ...(filters.currency && { currency: filters.currency }),
      }).toString();

      const res = await fetch(`/api/finance/records?${query}`);
      const { success, data, error } = await res.json();
      
      if (!success) {
        throw new Error(error || '获取数据失败');
      }

      if (activeTab === 'receivable') {
        setReceivables(data);
      } else {
        setPayables(data);
      }
      setTotal(data.length);
    } catch (error) {
      console.error('获取财务记录失败:', error);
      if (activeTab === 'receivable') {
        setReceivables([]);
      } else {
        setPayables([]);
      }
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, filters.status, filters.dueDate, filters.client, filters.currency]);

  const statusTabs = [
    { label: '草稿', icon: File },
    { label: '已提交', icon: Send },
    { label: '审核中', icon: Eye },
    { label: '已审核', icon: Check },
    { label: '已驳回', icon: X },
    { label: '待付款', icon: Clock },
    { label: '部分付款', icon: DollarSign },
    { label: '已付款_已收款', icon: FileCheck },
    { label: '已对账', icon: FileCheck },
    { label: '作废', icon: Trash },
  ];

  return (
    <section className="p-8 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="info-card p-4 rounded">
          <p className="text-2xl font-semibold">1,234</p>
          <p className="text-sm text-gray-600">总应收单数</p>
        </div>
        <div className="info-card p-4 rounded">
          <p className="text-2xl font-semibold">987</p>
          <p className="text-sm text-gray-600">已回款</p>
        </div>
        <div className="info-card p-4 rounded">
          <p className="text-2xl font-semibold">245</p>
          <p className="text-sm text-gray-600">待核销</p>
        </div>
        <div className="info-card p-4 rounded">
          <p className="text-2xl font-semibold">12</p>
          <p className="text-sm text-gray-600">异常单数</p>
        </div>
      </div>
      <FinanceFilterPanel
        filters={filters}
        onChange={setFilters}
        onSearch={() => {
          setPage(1);
          fetchData();
        }}
        onReset={() => {
          const cleared = { client: '', currency: '', dueDate: '', status: '' };
          setFilters(cleared);
          setPage(1);
          fetchData();
        }}
      />
      <div className="glass p-4">
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <button
            className="toggle-btn flex items-center text-gray-800 px-6 py-2 rounded-xl shadow-md transform hover:scale-105 active:scale-95 transition-all duration-150"
            onClick={() => {
              setActiveTab('receivable');
              setPage(1);
              fetchData();
            }}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            应收管理
          </button>
          <button
            className="toggle-btn flex items-center text-gray-800 px-6 py-2 rounded-xl shadow-md transform hover:scale-105 active:scale-95 transition-all duration-150"
            onClick={() => {
              setActiveTab('payable');
              setPage(1);
              fetchData();
            }}
          >
            <Wallet className="w-4 h-4 mr-2" />
            应付管理
          </button>
        </div>
        <div id="receivable-section" className={activeTab === 'receivable' ? '' : 'hidden'}>
          <div className="mb-4 flex gap-2">
            <button className="gradient-btn flex items-center px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150">
              <FilePlus className="w-4 h-4 mr-2" />
              创建应收单
            </button>
            <button className="status-btn flex items-center px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150">
              <Upload className="w-4 h-4 mr-2" />
              导出
            </button>
            <button className="status-btn flex items-center px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150">
              <Settings className="w-4 h-4 mr-2" />
              批量操作
            </button>
            <button className="status-btn flex items-center px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150">
              <Settings className="w-4 h-4 mr-2" />
              全部
            </button>
          </div>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-2">
            {statusTabs.slice(0, 5).map((tab) => (
              <button
                key={tab.label}
                className={`status-btn flex items-center px-6 py-3 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150 ${filters.status === tab.label ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, status: tab.label })}
                title={tab.label}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-2">
            {statusTabs.slice(5).map((tab) => (
              <button
                key={tab.label}
                className={`status-btn flex items-center px-6 py-3 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150 ${filters.status === tab.label ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, status: tab.label })}
                title={tab.label}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="info-card p-4 rounded">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left text-sm">订单号</th>
                  <th className="p-2 text-left text-sm">客户</th>
                  <th className="p-2 text-left text-sm">金额</th>
                  <th className="p-2 text-left text-sm">币种</th>
                  <th className="p-2 text-left text-sm">状态</th>
                  <th className="p-2 text-left text-sm">到期日</th>
                  <th className="p-2 text-left text-sm">操作</th>
                  <th className="p-2 text-left text-sm">异常备注</th>
                </tr>
              </thead>
              <tbody>
                {receivables.map((record) => (
                  <tr key={record.id} className="table-row">
                    <td className="p-2 text-sm">{record.orderId || '-'}</td>
                    <td className="p-2 text-sm">{record.client}</td>
                    <td className="p-2 text-sm">{record.amount}</td>
                    <td className="p-2 text-sm">{record.currency}</td>
                    <td className="p-4 text-center flex items-center justify-center gap-2">
                      <i className="w-4 h-4 text-gray-500" />
                      {record.status}
                    </td>
                    <td className="p-2 text-sm">{record.dueDate}</td>
                    <td className="p-2 text-sm">
                      <button className="flex items-center text-blue-600 hover:underline">
                        编辑
                      </button>
                      <button className="flex items-center text-red-500 hover:underline ml-2">
                        删除
                      </button>
                    </td>
                    <td className="p-2 text-sm">{record.exception || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm">共 {total} 条数据</p>
              <div className="flex gap-2">
                <button
                  className="status-btn px-4 py-2 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150"
                  onClick={() => setPage(page > 1 ? page - 1 : 1)}
                  disabled={page === 1}
                >
                  上一页
                </button>
                <button className="gradient-btn px-4 py-2 rounded-xl shadow-lg">{page}</button>
                <button
                  className="status-btn px-4 py-2 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                >
                  下一页
                </button>
                <select className="form-input-style">
                  <option>30 条/页</option>
                </select>
              </div>
            </div>
            <p className="mt-2 text-sm">已选择 0 条记录</p>
          </div>
        </div>
        <div id="payable-section" className={activeTab === 'payable' ? '' : 'hidden'}>
          <div className="mb-4 flex gap-2">
            <button className="gradient-btn flex items-center px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150">
              <FilePlus className="w-4 h-4 mr-2" />
              创建应付单
            </button>
            <button className="status-btn flex items-center px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150">
              <Upload className="w-4 h-4 mr-2" />
              导出
            </button>
            <button className="status-btn flex items-center px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150">
              <Settings className="w-4 h-4 mr-2" />
              批量操作
            </button>
            <button className="status-btn flex items-center px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150">
              <Settings className="w-4 h-4 mr-2" />
              全部
            </button>
          </div>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-2">
            {statusTabs.slice(0, 5).map((tab) => (
              <button
                key={tab.label}
                className={`status-btn flex items-center px-6 py-3 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150 ${filters.status === tab.label ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, status: tab.label })}
                title={tab.label}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-2">
            {statusTabs.slice(5).map((tab) => (
              <button
                key={tab.label}
                className={`status-btn flex items-center px-6 py-3 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150 ${filters.status === tab.label ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, status: tab.label })}
                title={tab.label}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="info-card p-4 rounded">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left text-sm">订单号</th>
                  <th className="p-2 text-left text-sm">供应商</th>
                  <th className="p-2 text-left text-sm">金额</th>
                  <th className="p-2 text-left text-sm">币种</th>
                  <th className="p-2 text-left text-sm">状态</th>
                  <th className="p-2 text-left text-sm">到期日</th>
                  <th className="p-2 text-left text-sm">操作</th>
                  <th className="p-2 text-left text-sm">异常备注</th>
                </tr>
              </thead>
              <tbody>
                {payables.map((record) => (
                  <tr key={record.id} className="table-row">
                    <td className="p-2 text-sm">{record.orderId || '-'}</td>
                    <td className="p-2 text-sm">{record.client}</td>
                    <td className="p-2 text-sm">{record.amount}</td>
                    <td className="p-2 text-sm">{record.currency}</td>
                    <td className="p-4 text-center flex items-center justify-center gap-2">
                      <i className="w-4 h-4 text-gray-500" />
                      {record.status}
                    </td>
                    <td className="p-2 text-sm">{record.dueDate}</td>
                    <td className="p-2 text-sm">
                      <button className="flex items-center text-blue-600 hover:underline">
                        编辑
                      </button>
                      <button className="flex items-center text-red-500 hover:underline ml-2">
                        删除
                      </button>
                    </td>
                    <td className="p-2 text-sm">{record.exception || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm">共 {total} 条数据</p>
              <div className="flex gap-2">
                <button
                  className="status-btn px-4 py-2 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150"
                  onClick={() => setPage(page > 1 ? page - 1 : 1)}
                  disabled={page === 1}
                >
                  上一页
                </button>
                <button className="gradient-btn px-4 py-2 rounded-xl shadow-lg">{page}</button>
                <button
                  className="status-btn px-4 py-2 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                >
                  下一页
                </button>
                <select className="form-input-style">
                  <option>30 条/页</option>
                </select>
              </div>
            </div>
            <p className="mt-2 text-sm">已选择 0 条记录</p>
          </div>
        </div>
      </div>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 gradient-text">最近活动</h2>
        <div className="glass p-4">
          <ul className="space-y-2 text-sm">
            <li>2025-05-01 10:14:54 - 订单 ORD001 已核销</li>
            <li>2025-04-30 15:30:22 - 订单 ORD002 标记为异常</li>
            <li>2025-04-29 09:12:45 - 订单 ORD003 已完成</li>
          </ul>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 gradient-text">系统消息</h2>
        <div className="glass p-4">
          <ul className="space-y-2 text-sm">
            <li>2025-05-10: 新增批量操作功能</li>
            <li>2025-05-12: 系统将于凌晨2:00-3:00进行维护</li>
          </ul>
        </div>
      </section>
    </section>
  );
}
