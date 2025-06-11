import { useState } from 'react';
import { FormProps, FeeRule } from '../types';

interface Props extends FormProps {
  editingRule?: FeeRule | null;
}

export default function CustomsAgentFeeForm({ module, onSubmit, editingRule }: Props) {
  const labelPrefix = '报关代理费';
  const chargeUnitOptions = [{ value: '票', label: '票' }];
  const [price, setPrice] = useState(() => editingRule?.params.price ?? 0);
  const [chargeUnit, setChargeUnit] = useState(() => editingRule?.params.chargeUnit || '票');
  const [currency, setCurrency] = useState(() => editingRule?.currency ?? 'CNY');

  const isValid = price >= 0 && chargeUnit !== '';

  const currentRulePreview = isValid
    ? `当前规则：${labelPrefix}：${price}元/${chargeUnit}`
    : '规则无效，请检查输入';

  const handleSubmit = () => {
    if (!isValid) {
      console.log('无效表单数据:', { price, chargeUnit });
      return;
    }
    const rule: Omit<FeeRule, 'id'> & { id?: string } = {
      module,
      type: 'customs_agent',
      name: labelPrefix,
      params: {
        price,
        chargeUnit,
        field: 'customs_agent',
        label: `${labelPrefix}：${price}元/${chargeUnit}`,
      },
      currency,
      ...(editingRule ? { id: editingRule.id } : {}),
    };
    console.log('提交规则:', rule);
    onSubmit(rule);
    if (!editingRule) {
      setPrice(0);
      setChargeUnit('票');
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
        <span className="font-semibold">费用：</span>
        <input
          type="number"
          className="w-24 p-2 border rounded"
          value={price}
          onChange={(e) => setPrice(+e.target.value)}
          onBlur={() => setPrice(Math.max(0, price))}
        />
        <span>元/</span>
        <select
          className="w-24 p-2 border rounded"
          value={chargeUnit}
          onChange={(e) => setChargeUnit(e.target.value)}
        >
          {chargeUnitOptions.map((unit) => (
            <option key={unit.value} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </select>
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
