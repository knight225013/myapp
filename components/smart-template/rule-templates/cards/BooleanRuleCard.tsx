'use client';
import React from 'react';
import { Rule } from '../types';

interface BooleanRuleCardProps {
  rule: Rule;
  onUpdate: (id: string, payload: Partial<any>) => void;
  onRemove: (id: string) => void;
}

export const BooleanRuleCard = React.memo(function BooleanRuleCard({
  rule,
  onUpdate,
  onRemove,
}: BooleanRuleCardProps) {
  const getBooleanLabel = () => {
    if (rule.field === 'isWoodProduct') return '是木制品';
    if (rule.field === 'isCustomsDeclared') return '需要报关';
    if (rule.field === 'hasInvoice') return '有发票';
    return rule.label;
  };

  const handleBooleanChange = (value: boolean) => {
    onUpdate(rule.id, { value: rule.field === 'hasInvoice' ? !value : value });
  };

  const handleFeeChange = (feeKey: 'fee' | 'noInvoiceFee', value: string) => {
    onUpdate(rule.id, { [feeKey]: Number(value) });
  };

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2">
        <label className="text-gray-600">{getBooleanLabel()}</label>
        <input
          type="checkbox"
          checked={rule.field === 'hasInvoice' ? !rule.value : rule.value}
          onChange={(e) => handleBooleanChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 rounded"
        />
        <span className="text-gray-700">
          {rule.field === 'hasInvoice'
            ? rule.value
              ? '否 ⬜'
              : '是 ✅'
            : rule.value
              ? '是 ✅'
              : '否 ⬜'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-gray-600">费用：加收</label>
        <div className="relative">
          <input
            type="number"
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
            placeholder="费用金额"
            value={rule.field === 'hasInvoice' ? (rule.noInvoiceFee ?? '') : (rule.fee ?? '')}
            onChange={(e) =>
              handleFeeChange(rule.field === 'hasInvoice' ? 'noInvoiceFee' : 'fee', e.target.value)
            }
          />
          <span className="absolute right-2 top-2 text-gray-500">元</span>
        </div>
      </div>
    </div>
  );
});
