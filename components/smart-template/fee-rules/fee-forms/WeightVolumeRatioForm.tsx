import { useState } from 'react';
import { FormProps, FeeRule } from '../types';

interface Props extends FormProps {
  editingRule?: FeeRule | null;
}

export default function WeightVolumeRatioForm({ module, onSubmit, editingRule }: Props) {
  const labelPrefix = '重量/体积比';
  const [mode, setMode] = useState<'实重' | '抛重' | '比例'>(
    () => editingRule?.params.mode || '实重',
  );
  const [ratio, setRatio] = useState(() => editingRule?.params.price ?? 0);
  const [currency, setCurrency] = useState(() => editingRule?.currency ?? 'CNY');

  const isValid = mode !== '比例' || ratio > 0;

  const currentRulePreview = isValid
    ? `当前规则：${labelPrefix}：${mode}${mode === '比例' ? ` (${ratio}%)` : ''}`
    : '规则无效，请检查输入';

  const handleSubmit = () => {
    if (!isValid) {
      console.log('无效表单数据:', { mode, ratio });
      return;
    }
    const rule: Omit<FeeRule, 'id'> & { id?: string } = {
      module,
      type: 'weight_volume_ratio',
      name: labelPrefix,
      params: {
        price: mode === '比例' ? ratio : 0,
        chargeUnit: mode === '比例' ? 'percent' : 'fixed',
        field: 'weight_volume_ratio',
        mode,
        label: `${labelPrefix}：${mode}${mode === '比例' ? ` (${ratio}%)` : ''}`,
      },
      currency,
      ...(editingRule ? { id: editingRule.id } : {}),
    };
    console.log('提交规则:', rule);
    onSubmit(rule);
    if (!editingRule) {
      setMode('实重');
      setRatio(0);
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
        <span className="font-semibold">计费模式：</span>
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              value="实重"
              checked={mode === '实重'}
              onChange={() => setMode('实重')}
            />
            实重
          </label>
          <label>
            <input
              type="radio"
              value="抛重"
              checked={mode === '抛重'}
              onChange={() => setMode('抛重')}
            />
            抛重
          </label>
          <label>
            <input
              type="radio"
              value="比例"
              checked={mode === '比例'}
              onChange={() => setMode('比例')}
            />
            按比例
          </label>
        </div>
      </div>
      {mode === '比例' && (
        <div className="flex items-center gap-2">
          <span className="font-semibold">比例值：</span>
          <input
            type="number"
            className="w-24 p-2 border rounded"
            value={ratio}
            onChange={(e) => setRatio(+e.target.value)}
            onBlur={() => setRatio(Math.max(0.01, ratio))}
          />
          <span>%</span>
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
