'use client';
import React from 'react';

interface PerPieceRuleCardProps {
  rule: {
    id: string;
    type: string;
    field: string;
    value: number;
    price?: number;
    label: string;
    condition: string;
    formula: string;
  };
  onUpdate: (id: string, payload: Partial<any>) => void;
  onRemove: (id: string) => void;
}

export const PerPieceRuleCard = React.memo(function PerPieceRuleCard({
  rule,
  onUpdate,
  onRemove,
}: PerPieceRuleCardProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2">
        <label className="text-gray-600">单价：</label>
        <span>每件 </span>
        <div className="relative">
          <input
            type="number"
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
            placeholder="单价"
            value={rule.price ?? ''}
            onChange={(e) => onUpdate(rule.id, { price: Number(e.target.value) })}
          />
          <span className="absolute right-2 top-2 text-gray-500">元</span>
        </div>
      </div>
    </div>
  );
});
