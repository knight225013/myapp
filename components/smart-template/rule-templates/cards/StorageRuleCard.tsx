'use client';
import React from 'react';

interface StorageRuleCardProps {
  rule: {
    id: string;
    type: string;
    field: string;
    value: number;
    freeDays?: number;
    dailyFee?: number;
    label: string;
    condition: string;
    formula: string;
  };
  onUpdate: (id: string, payload: Partial<any>) => void;
  onRemove: (id: string) => void;
}

export const StorageRuleCard = React.memo(function StorageRuleCard({
  rule,
  onUpdate,
  onRemove,
}: StorageRuleCardProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2">
        <label className="text-gray-600">条件：存放天数 {'>'} </label>
        <div className="relative">
          <input
            type="number"
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
            placeholder="免费天数"
            value={rule.freeDays ?? ''}
            onChange={(e) => onUpdate(rule.id, { freeDays: Number(e.target.value) })}
          />
          <span className="absolute right-2 top-2 text-gray-500">天</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-gray-600">费用：超出天数 ×</label>
        <div className="relative">
          <input
            type="number"
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
            placeholder="每日费用"
            value={rule.dailyFee ?? ''}
            onChange={(e) => onUpdate(rule.id, { dailyFee: Number(e.target.value) })}
          />
          <span className="absolute right-2 top-2 text-gray-500">元/天</span>
        </div>
      </div>
    </div>
  );
});
