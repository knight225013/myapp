import { useState } from 'react';
import { FormProps, FeeRule } from '../types';

interface Props extends FormProps {
  editingRule?: FeeRule | null;
}

export default function TimedPromoForm({ module, onSubmit, editingRule }: Props) {
  const labelPrefix = '限时促销';
  const [price, setPrice] = useState(() => editingRule?.params.price ?? 0);
  const [startDate, setStartDate] = useState(() => editingRule?.activeFrom || '');
  const [endDate, setEndDate] = useState(() => editingRule?.activeTo || '');
  const [currency, setCurrency] = useState(() => editingRule?.currency ?? 'CNY');

  const isValid = price >= 0 && startDate !== '' && endDate !== '';

  const currentRulePreview = isValid
    ? `当前规则：${labelPrefix}：${price}元 (${startDate} - ${endDate})`
    : '规则无效，请检查输入';

  const handleSubmit = () => {
    if (!isValid) {
      console.log('无效表单数据:', { price, startDate, endDate });
      return;
    }
    const rule: Omit<FeeRule, 'id'> & { id?: string } = {
      module,
      type: 'timed_promo',
      name: labelPrefix,
      params: {
        price,
        chargeUnit: 'fixed',
        field: 'timed_promo',
        label: `${labelPrefix}：${price}元 (${startDate} - ${endDate})`,
      },
      currency,
      activeFrom: startDate,
      activeTo: endDate,
      ...(editingRule ? { id: editingRule.id } : {}),
    };
    console.log('提交规则:', rule);
    onSubmit(rule);
    if (!editingRule) {
      setPrice(0);
      setStartDate('');
      setEndDate('');
      setCurrency('CNY');
    }
  };

  return (
    <div className="border rounded-xl shadow-md p-4 bg-white text-sm space-y-3">
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">规则名称</label>
        <input
          type="text"
          value={labelPrefix}
          disabled
          className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">返利金额：</span>
        <input
          type="number"
          className="w-24 p-2 border rounded"
          value={price}
          onChange={(e) => setPrice(+e.target.value)}
          onBlur={() => setPrice(Math.max(0, price))}
        />
        <span>元</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">开始日期：</span>
        <input
          type="date"
          className="w-40 p-2 border rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">结束日期：</span>
        <input
          type="date"
          className="w-40 p-2 border rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="CNY">CNY</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="JPY">JPY</option>
      </select>
      <div className="text-red-600 font-semibold text-sm mt-1">{currentRulePreview}</div>
      <div className="text-right pt-2">
        <button
          className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
          onClick={handleSubmit}
          disabled={!isValid}
        >
          {editingRule ? '更新规则' : '添加规则'}
        </button>
      </div>
    </div>
  );
}
