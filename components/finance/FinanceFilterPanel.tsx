import { Search } from 'lucide-react';

interface FinanceFilters {
  client: string;
  currency: string;
  dueDate: string;
  status: string;
}

interface Props {
  filters: FinanceFilters;
  onChange: (filters: FinanceFilters) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function FinanceFilterPanel({ filters, onChange, onSearch, onReset }: Props) {
  const handleInputChange = (field: keyof FinanceFilters, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="glass rounded-3xl shadow-xl p-8 mb-8">
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="客户"
          value={filters.client}
          onChange={(e) => handleInputChange('client', e.target.value)}
          className="form-input-style w-full md:w-auto"
        />
        <select
          value={filters.currency}
          onChange={(e) => handleInputChange('currency', e.target.value)}
          className="form-input-style w-full md:w-auto"
        >
          <option value="">币种</option>
          <option value="CNY">CNY</option>
          <option value="USD">USD</option>
        </select>
        <input
          type="date"
          value={filters.dueDate}
          onChange={(e) => handleInputChange('dueDate', e.target.value)}
          className="form-input-style w-full md:w-auto"
        />
        <select
          value={filters.status}
          onChange={(e) => handleInputChange('status', e.target.value)}
          className="form-input-style w-full md:w-auto"
        >
          <option value="">所有状态</option>
          <option value="草稿">草稿</option>
          <option value="已提交">已提交</option>
          <option value="审核中">审核中</option>
          <option value="已审核">已审核</option>
          <option value="已驳回">已驳回</option>
          <option value="待付款">待付款</option>
          <option value="部分付款">部分付款</option>
          <option value="已付款_已收款">已付款 / 已收款</option>
          <option value="已对账">已对账</option>
          <option value="作废">作废</option>
        </select>
        <button
          className="gradient-btn flex items-center px-6 py-2 rounded-xl shadow-md transform hover:scale-105 active:scale-95 transition-all duration-150"
          onClick={onSearch}
        >
          <Search className="w-4 h-4 mr-2" />
          搜索
        </button>
        <button
          className="status-btn flex items-center px-6 py-2 rounded-xl shadow-md transform hover:scale-105 active:scale-95 transition-all duration-150"
          onClick={onReset}
        >
          重置
        </button>
      </div>
    </div>
  );
}
