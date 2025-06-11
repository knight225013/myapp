'use client';
import React from 'react';

interface InsuranceRuleCardProps {
  rule: {
    id: string;
    type: string;
    field: string;
    value: number;
    threshold?: number;
    rate?: number;
    label: string;
    condition: string;
    formula: string;
  };
  onUpdate: (id: string, payload: Partial<any>) => void;
  onRemove: (id: string) => void;
}

export const InsuranceRuleCard = React.memo(function InsuranceRuleCard({
  rule,
  onUpdate,
  onRemove,
}: InsuranceRuleCardProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2">
        <label className="text-gray-600">条件：申报价值 {'>'} </label>
        <div className="relative">
          <input
            type="number"
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
            placeholder="价值阈值"
            value={rule.threshold ?? ''}
            onChange={(e) => onUpdate(rule.id, { threshold: Number(e.target.value) })}
          />
          <span className="absolute right-2 top-2 text-gray-500">元</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-gray-600">费用：申报价值 ×</label>
        <div className="relative">
          <input
            type="number"
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
            placeholder="费率"
            value={rule.rate ? (rule.rate * 100).toString() : ''}
            onChange={(e) => onUpdate(rule.id, { rate: Number(e.target.value) / 100 })}
          />
          <span className="absolute right-2 top-2 text-gray-500">%</span>
        </div>
      </div>
    </div>
  );
});
