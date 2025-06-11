import { useState } from 'react';
import { FormProps, FeeRule } from '../types';

interface Props extends FormProps {
  editingRule?: FeeRule | null;
}

export default function DiscountRateForm({ module, onSubmit, editingRule }: Props) {
  const labelPrefix = '折扣率';
  const [percentage, setPercentage] = useState(() => editingRule?.params.price ?? 0);
  const [currency, setCurrency] = useState(() => editingRule?.currency ?? 'CNY');

  const isValid = percentage >= 0;

  const currentRulePreview = isValid
    ? `当前规则：${labelPrefix}：${percentage}% 折扣`
    : '规则无效，请检查输入';

  const handleSubmit = () => {
    if (!isValid) {
      console.log('无效表单数据:', { percentage });
      return;
    }
    const rule: Omit<FeeRule, 'id'> & { id?: string } = {
      module,
      type: 'discount_rate',
      name: labelPrefix,
      params: {
        price: percentage,
        chargeUnit: 'percent',
        field: 'discount_rate',
        label: `${labelPrefix}：${percentage}% 折扣`,
      },
      currency,
      ...(editingRule ? { id: editingRule.id } : {}),
    };
    console.log('提交规则:', rule);
    onSubmit(rule);
    if (!editingRule) {
      setPercentage(0);
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
        <span className="font-semibold">折扣率：</span>
        <input
          type="number"
          className="w-24 p-2 border rounded"
          value={percentage}
          onChange={(e) => setPercentage(+e.target.value)}
          onBlur={() => setPercentage(Math.max(0, percentage))}
        />
        <span>%</span>
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
