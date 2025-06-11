import { useState } from 'react';
import { FormProps, FeeRule } from '../types';

interface Props extends FormProps {
  editingRule?: FeeRule | null;
}

export default function CustomFeeForm({ module, onSubmit, editingRule }: Props) {
  const labelPrefix = '自定义费用';
  const chargeUnitOptions = [
    { value: '票', label: '票' },
    { value: '箱', label: '箱' },
    { value: 'kg', label: 'kg' },
    { value: 'cbm', label: '方' },
  ];
  const [feeType, setFeeType] = useState<'fixed' | 'percent'>(() =>
    editingRule?.params.chargeUnit === 'percent' ? 'percent' : 'fixed',
  );
  const [price, setPrice] = useState(() => editingRule?.params.price ?? 0);
  const [chargeUnit, setChargeUnit] = useState(() => editingRule?.params.chargeUnit || '票');
  const [percentage, setPercentage] = useState(() =>
    editingRule?.params.chargeUnit === 'percent' ? editingRule?.params.price : 0,
  );
  const [baseField, setBaseField] = useState(() => editingRule?.params.baseField || '运费');
  const [currency, setCurrency] = useState(() => editingRule?.currency ?? 'CNY');

  const isValid =
    feeType === 'fixed' ? price >= 0 && chargeUnit !== '' : percentage >= 0 && baseField !== '';

  const currentRulePreview = isValid
    ? `当前规则：${labelPrefix}：${feeType === 'fixed' ? `${price}元/${chargeUnit}` : `${percentage}% of ${baseField}`}`
    : '规则无效，请检查输入';

  const handleSubmit = () => {
    if (!isValid) {
      console.log('无效表单数据:', { feeType, price, percentage, chargeUnit, baseField });
      return;
    }
    const rule: Omit<FeeRule, 'id'> & { id?: string } = {
      module,
      type: 'custom_fee',
      name: labelPrefix,
      params:
        feeType === 'fixed'
          ? {
              price,
              chargeUnit,
              field: 'custom_fixed',
              label: `${labelPrefix}：${price}元/${chargeUnit}`,
            }
          : {
              price: percentage,
              chargeUnit: 'percent',
              field: 'custom_percent',
              baseField,
              label: `${labelPrefix}：${percentage}% of ${baseField}`,
            },
      currency,
      ...(editingRule ? { id: editingRule.id } : {}),
    };
    console.log('提交规则:', rule);
    onSubmit(rule);
    if (!editingRule) {
      setFeeType('fixed');
      setPrice(0);
      setChargeUnit('票');
      setPercentage(0);
      setBaseField('运费');
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
      <div className="space-y-2">
        <span className="font-semibold">费用类型：</span>
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              value="fixed"
              checked={feeType === 'fixed'}
              onChange={() => setFeeType('fixed')}
            />
            固定费用
          </label>
          <label>
            <input
              type="radio"
              value="percent"
              checked={feeType === 'percent'}
              onChange={() => setFeeType('percent')}
            />
            百分比
          </label>
        </div>
      </div>
      {feeType === 'fixed' && (
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
      )}
      {feeType === 'percent' && (
        <div className="flex items-center gap-2">
          <span className="font-semibold">费用：</span>
          <input
            type="number"
            className="w-24 p-2 border rounded"
            value={percentage}
            onChange={(e) => setPercentage(+e.target.value)}
            onBlur={() => setPercentage(Math.max(0, percentage))}
          />
          <span>% of</span>
          <select
            className="w-24 p-2 border rounded"
            value={baseField}
            onChange={(e) => setBaseField(e.target.value)}
          >
            <option value="运费">运费</option>
            <option value="申报价">申报价</option>
          </select>
        </div>
      )}
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
