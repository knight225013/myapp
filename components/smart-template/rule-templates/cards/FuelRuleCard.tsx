'use client';
import React from 'react';

interface FuelRuleCardProps {
  rule: {
    id: string;
    type: string;
    field: string;
    value: number;
    rate?: number;
    label: string;
    condition: string;
    formula: string;
  };
  onUpdate: (id: string, payload: Partial<any>) => void;
  onRemove: (id: string) => void;
}

export const FuelRuleCard = React.memo(function FuelRuleCard({
  rule,
  onUpdate,
  onRemove,
}: FuelRuleCardProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2">
        <label className="text-gray-600">比例：</label>
        <span>基础费用 × </span>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
            placeholder="燃油附加比例"
            value={rule.rate ? (rule.rate * 100).toString() : ''}
            onChange={(e) => onUpdate(rule.id, { rate: Number(e.target.value) / 100 })}
          />
          <span className="absolute right-2 top-2 text-gray-500">%</span>
        </div>
      </div>
    </div>
  );
});
