'use client';
import React from 'react';
import { Rule } from '../types';

interface WeightRuleCardProps {
  rule: Rule;
  onUpdate: (id: string, payload: Partial<any>) => void;
  onRemove: (id: string) => void;
}

export const WeightRuleCard = React.memo(function WeightRuleCard({
  rule,
  onUpdate,
  onRemove,
}: WeightRuleCardProps) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(rule.id, { minThreshold: Number(e.target.value) });
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(rule.id, { maxThreshold: Number(e.target.value) });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(rule.id, { price: Number(e.target.value) });
  };

  return (
    <div className="flex flex-col gap-2 text-sm">
      {/* 条件行 */}
      <div className="flex items-center gap-2">
        <label className="text-gray-600">条件：</label>
        <span>重量 ∈</span>
        <input
          type="number"
          value={rule.minThreshold ?? ''}
          onChange={handleMinChange}
          className="border p-2 rounded w-20"
          placeholder="最小"
        />
        <span>~</span>
        {rule.maxThreshold !== undefined ? (
          <input
            type="number"
            value={rule.maxThreshold ?? ''}
            onChange={handleMaxChange}
            className="border p-2 rounded w-20"
            placeholder="最大"
          />
        ) : (
          <span className="text-gray-500">无上限</span>
        )}
        <span>kg</span>
      </div>

      {/* 费用行 */}
      <div className="flex items-center gap-2">
        <label className="text-gray-600">费用：</label>
        <span>重量 ×</span>
        <input
          type="number"
          value={rule.price ?? ''}
          onChange={handlePriceChange}
          className="border p-2 rounded w-24"
          placeholder="单价"
        />
        <span>元/kg</span>
      </div>
    </div>
  );
});
