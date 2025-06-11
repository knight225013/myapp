import { useState } from 'react';
import { LadderRuleFormProps, FeeRule } from '../types';

interface Props extends LadderRuleFormProps {
  editingRule?: FeeRule | null;
}

export default function GirthFeeForm({
  labelPrefix = '围长',
  conditionUnit = 'cm',
  chargeUnitOptions = [],
  field,
  module,
  onSubmit,
  editingRule,
}: Props) {
  const [min, setMin] = useState(() => editingRule?.params.min ?? 0);
  const [max, setMax] = useState(() => editingRule?.params.max);
  const [price, setPrice] = useState(() => editingRule?.params.price ?? 0);
  const [chargeUnit, setChargeUnit] = useState(
    () => editingRule?.params.chargeUnit || chargeUnitOptions[0]?.value || '',
  );
  const [currency, setCurrency] = useState(() => editingRule?.currency ?? 'CNY');

  const isValid = min >= 0 && price >= 0 && (max === undefined || max > min) && chargeUnit !== '';

  const currentRulePreview = isValid
    ? `当前规则：${labelPrefix}：${min} ~ ${max ?? '∞'}${conditionUnit}，收取费用：${price}元/${chargeUnit || '单位未设置'}`
    : '规则无效，请检查输入';

  const handleSubmit = () => {
    if (!isValid) {
      console.log('无效表单数据:', { min, max, price, chargeUnit });
      return;
    }
    const rule: Omit<FeeRule, 'id'> & { id?: string } = {
      module,
      type: 'girth_fee',
      name: labelPrefix,
      params: {
        min,
        max,
        price,
        conditionUnit,
        chargeUnit,
        field,
        label: `${labelPrefix}：${min} ~ ${max ?? '∞'} ${conditionUnit} → ${price}元/${chargeUnit}`,
      },
      currency,
      ...(editingRule ? { id: editingRule.id } : {}),
    };
    console.log('提交规则:', rule);
    onSubmit(rule);
    if (!editingRule) {
      setMin(0);
      setMax(undefined);
      setPrice(0);
      setChargeUnit(chargeUnitOptions[0]?.value || '');
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
      <div className="flex flex-wrap items-center gap-4 mt-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">条件：</span>
          <span>{labelPrefix}：</span>
          <input
            type="number"
            className="w-20 p-2 border rounded text-center"
            value={min}
            onChange={(e) => setMin(+e.target.value)}
            onBlur={() => setMin(Math.max(0, min))}
          />
          <span>~</span>
          <input
            type="number"
            className="w-20 p-2 border rounded text-center"
            value={max ?? ''}
            placeholder="∞"
            onChange={(e) => setMax(e.target.value === '' ? undefined : +e.target.value)}
            onBlur={() => {
              if (max !== undefined && max <= min) setMax(min + 1);
            }}
          />
          <span>{conditionUnit}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">费用：</span>
          <input
            type="number"
            className="w-20 p-2 border rounded"
            value={price}
            onChange={(e) => setPrice(+e.target.value)}
            onBlur={() => setPrice(Math.max(0, price))}
          />
          <span>元/</span>
          <select
            className="w-24 p-2 border rounded"
            value={chargeUnit}
            onChange={(e) => setChargeUnit(e.target.value)}
            disabled={!chargeUnitOptions.length}
          >
            {chargeUnitOptions.length ? (
              chargeUnitOptions.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))
            ) : (
              <option value="">无可用单位</option>
            )}
          </select>
        </div>
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
