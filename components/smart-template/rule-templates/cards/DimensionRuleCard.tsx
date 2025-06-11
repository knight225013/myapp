'use client';
import React from 'react';

interface DimensionRuleCardProps {
  rule: {
    id: string;
    type: string;
    field: string;
    value: number;
    maxThreshold?: number;
    maxFee?: number;
    secondThreshold?: number;
    secondFee?: number;
    label: string;
    condition: string;
    formula: string;
  };
  onUpdate: (id: string, payload: Partial<any>) => void;
  onRemove: (id: string) => void;
}

export const DimensionRuleCard = React.memo(function DimensionRuleCard({
  rule,
  onUpdate,
  onRemove,
}: DimensionRuleCardProps) {
  const isMaxLength = rule.field === 'maxLength';

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2">
        <label className="text-gray-600">条件：</label>
        <span>
          {isMaxLength ? '长边' : '次边'} {'>'}{' '}
        </span>
        <div className="relative">
          <input
            type="number"
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
            placeholder={isMaxLength ? '长边阈值' : '次边阈值'}
            value={isMaxLength ? (rule.maxThreshold ?? '') : (rule.secondThreshold ?? '')}
            onChange={(e) =>
              onUpdate(rule.id, {
                [isMaxLength ? 'maxThreshold' : 'secondThreshold']: Number(e.target.value),
              })
            }
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
            value={isMaxLength ? (rule.maxFee ?? '') : (rule.secondFee ?? '')}
            onChange={(e) =>
              onUpdate(rule.id, {
                [isMaxLength ? 'maxFee' : 'secondFee']: Number(e.target.value),
              })
            }
          />
          <span className="absolute right-2 top-2 text-gray-500">元</span>
        </div>
      </div>
    </div>
  );
});
