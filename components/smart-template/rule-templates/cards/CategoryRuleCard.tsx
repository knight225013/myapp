'use client';
import React from 'react';

interface CategoryRuleCardProps {
  rule: {
    id: string;
    type: string;
    field: string;
    value: string;
    match?: string;
    fee?: number;
    label: string;
    condition: string;
    formula: string;
  };
  onUpdate: (id: string, payload: Partial<any>) => void;
  onRemove: (id: string) => void;
}

export const CategoryRuleCard = React.memo(function CategoryRuleCard({
  rule,
  onUpdate,
  onRemove,
}: CategoryRuleCardProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2">
        <label className="text-gray-600">品类：</label>
        <span>当品类 = </span>
        <div className="relative">
          <input
            type="text"
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
            placeholder="匹配品类"
            value={rule.match ?? ''}
            onChange={(e) => onUpdate(rule.id, { match: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-gray-600">费用：</label>
        <span>附加费 </span>
        <div className="relative">
          <input
            type="number"
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
            placeholder="费用金额"
            value={rule.fee ?? ''}
            onChange={(e) => onUpdate(rule.id, { fee: Number(e.target.value) })}
          />
          <span className="absolute right-2 top-2 text-gray-500">元</span>
        </div>
      </div>
    </div>
  );
});
