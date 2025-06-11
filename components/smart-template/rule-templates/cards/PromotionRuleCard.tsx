'use client';
import React from 'react';

interface PromotionRuleCardProps {
  rule: {
    id: string;
    type: string;
    field: string;
    value: number;
    discount?: number;
    label: string;
    condition: string;
    formula: string;
  };
  onUpdate: (id: string, payload: Partial<any>) => void;
  onRemove: (id: string) => void;
}

export const PromotionRuleCard = React.memo(function PromotionRuleCard({
  rule,
  onUpdate,
  onRemove,
}: PromotionRuleCardProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2">
        <label className="text-gray-600">折扣比例：</label>
        <span>应收费用 × (1 - </span>
        <div className="relative">
          <input
            type="number"
            step="0.1"
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
            placeholder="折扣比例"
            value={rule.discount ? (rule.discount * 100).toString() : ''}
            onChange={(e) => onUpdate(rule.id, { discount: Number(e.target.value) / 100 })}
          />
          <span className="absolute right-2 top-2 text-gray-500">%</span>
        </div>
        <span>)</span>
      </div>
    </div>
  );
});
