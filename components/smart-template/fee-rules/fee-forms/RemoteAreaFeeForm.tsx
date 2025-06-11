import { useState } from 'react';
import { FormProps, FeeRule } from '../types';

interface Props extends FormProps {
  editingRule?: FeeRule | null;
}

export default function RemoteAreaFeeForm({ module, onSubmit, editingRule }: Props) {
  const labelPrefix = '偏远地区费';
  const chargeUnitOptions = [
    { value: '票', label: '票' },
    { value: '箱', label: '箱' },
  ];
  const [country, setCountry] = useState(() => editingRule?.params.country || '');
  const [regions, setRegions] = useState<string[]>(() => editingRule?.params.regions || []);
  const [price, setPrice] = useState(() => editingRule?.params.price ?? 0);
  const [chargeUnit, setChargeUnit] = useState(() => editingRule?.params.chargeUnit || '票');
  const [currency, setCurrency] = useState(() => editingRule?.currency ?? 'CNY');

  const isValid = country !== '' && price >= 0 && chargeUnit !== '';

  const currentRulePreview = isValid
    ? `当前规则：${labelPrefix}：${price}元/${chargeUnit} in ${country}${regions.length ? ` (${regions.join(', ')})` : ''}`
    : '规则无效，请检查输入';

  const handleSubmit = () => {
    if (!isValid) {
      console.log('无效表单数据:', { country, regions, price, chargeUnit });
      return;
    }
    const rule: Omit<FeeRule, 'id'> & { id?: string } = {
      module,
      type: 'remote_area_fee',
      name: labelPrefix,
      params: {
        price,
        chargeUnit,
        field: 'remote_area',
        country,
        regions,
        label: `${labelPrefix}：${price}元/${chargeUnit} in ${country}${regions.length ? ` (${regions.join(', ')})` : ''}`,
      },
      currency,
      ...(editingRule ? { id: editingRule.id } : {}),
    };
    console.log('提交规则:', rule);
    onSubmit(rule);
    if (!editingRule) {
      setCountry('');
      setRegions([]);
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
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">国家</label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">选择国家</option>
          <option value="US">美国</option>
          <option value="CN">中国</option>
          <option value="JP">日本</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">行政区</label>
        <input
          type="text"
          placeholder="行政区 (逗号分隔)"
          value={regions.join(',')}
          onChange={(e) => setRegions(e.target.value.split(',').map((r) => r.trim()))}
          className="w-full p-2 border rounded"
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
