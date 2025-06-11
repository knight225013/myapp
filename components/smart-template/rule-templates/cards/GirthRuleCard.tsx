'use client';
import React from 'react';

interface GirthRuleCardProps {
  rule: {
    id: string;
    type: string;
    field: string;
    value: number;
    limit?: number;
    fee?: number;
    label: string;
    condition: string;
    formula: string;
  };
  onUpdate: (id: string, payload: Partial<any>) => void;
  onRemove: (id: string) => void;
}

export const GirthRuleCard = React.memo(function GirthRuleCard({
  rule,
  onUpdate,
  onRemove,
}: GirthRuleCardProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2">
        <label className="text-gray-600">条件：</label>
        <span>围长 {'>'} </span>
        <div className="relative">
          <input
            type="number"
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
            placeholder="围长阈值"
            value={rule.limit ?? ''}
            onChange={(e) => onUpdate(rule.id, { limit: Number(e.target.value) })}
          />
          <span className="absolute right-2 top-2 text-gray-500">cm</span>
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
