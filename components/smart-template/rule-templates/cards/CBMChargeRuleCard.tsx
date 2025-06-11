'use client';
import React from 'react';

interface CBMChargeRuleCardProps {
  rule: {
    id: string;
    type: string;
    field: string;
    value: number;
    cbmRate?: number;
    label: string;
    condition: string;
    formula: string;
  };
  onUpdate: (id: string, payload: Partial<any>) => void;
  onRemove: (id: string) => void;
}

export const CBMChargeRuleCard = React.memo(function CBMChargeRuleCard({
  rule,
  onUpdate,
  onRemove,
}: CBMChargeRuleCardProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2">
        <label className="text-gray-600">CBM 单价</label>
        <span>运费 = 体积(m³) × </span>
        <div className="relative">
          <input
            type="number"
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
            placeholder="单价"
            value={rule.cbmRate ?? ''}
            onChange={(e) => onUpdate(rule.id, { cbmRate: Number(e.target.value) })}
          />
          <span className="absolute right-2 top-2 text-gray-500">元/m³</span>
        </div>
      </div>
    </div>
  );
});
