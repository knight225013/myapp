import { useState, useEffect } from 'react';
import { LadderRuleFormProps, FeeRule } from '../types';

interface Props extends LadderRuleFormProps {
  editingRule?: FeeRule | null;
}

export default function SecondLongestSideFeeForm({
  labelPrefix = '次长边',
  conditionUnit = 'cm',
  chargeUnitOptions = [{ value: 'ticket', label: '每票' }],
  field = 'second_longest_side',
  module,
  onSubmit,
  editingRule,
}: Props) {
  const [min, setMin] = useState(() => Number(editingRule?.params.min) || 0);
  const [max, setMax] = useState(() =>
    editingRule?.params.max ? Number(editingRule.params.max) : undefined,
  );
  const [price, setPrice] = useState(() => Number(editingRule?.params.price) || 0);
  const [chargeUnit, setChargeUnit] = useState(() => {
    const unit = editingRule?.params.chargeUnit;
    return unit && chargeUnitOptions.some((opt) => opt.value === unit)
      ? unit
      : chargeUnitOptions[0]?.value || '';
  });
  const [currency, setCurrency] = useState(() => editingRule?.currency ?? 'CNY');

  const fallbackOptions = [{ value: 'ticket', label: '每票' }];
  const mergedOptions = chargeUnitOptions.length ? chargeUnitOptions : fallbackOptions;

  useEffect(() => {
    if (
      editingRule?.params.chargeUnit &&
      !chargeUnitOptions.some((opt) => opt.value === editingRule.params.chargeUnit)
    ) {
      console.warn('无效的计费单位:', editingRule.params.chargeUnit);
      setChargeUnit(mergedOptions[0]?.value || '');
    }
  }, [editingRule, chargeUnitOptions]);

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
      type: 'second_longest_side_fee',
      name: 'Second Longest Side',
      params: {
        min,
        max,
        price,
        conditionUnit,
        chargeUnit,
        field,
        label: `Second Longest Side: ${min} ~ ${max ?? '∞'} ${conditionUnit} → ${price} ${currency}/${chargeUnit}`,
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
      setChargeUnit(mergedOptions[0]?.value || '');
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
            disabled={!mergedOptions.length}
          >
            {mergedOptions.length ? (
              mergedOptions.map((unit) => (
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
      {!mergedOptions.length && <div className="text-red-600 text-sm">计费单位未配置</div>}
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
