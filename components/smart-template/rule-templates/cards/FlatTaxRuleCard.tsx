'use client';
import React from 'react';

interface FlatTaxRuleCardProps {
  rule: {
    id: string;
    type: string;
    field: string;
    value: number;
    fixedAmount?: number;
    fixedPerPiece?: number;
    label: string;
    condition: string;
    formula: string;
  };
  onUpdate: (id: string, payload: Partial<any>) => void;
  onRemove: (id: string) => void;
}

export const FlatTaxRuleCard = React.memo(function FlatTaxRuleCard({
  rule,
  onUpdate,
  onRemove,
}: FlatTaxRuleCardProps) {
  const isPerTicket = rule.field === 'true';

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2">
        <label className="text-gray-600">{isPerTicket ? '整票税费' : '每件税费'}：</label>
        <span>{isPerTicket ? '税费 =' : '税费 = 件数 ×'}</span>
        <div className="relative">
          <input
            type="number"
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
            placeholder={isPerTicket ? '固定金额' : '每件金额'}
            value={isPerTicket ? (rule.fixedAmount ?? '') : (rule.fixedPerPiece ?? '')}
            onChange={(e) =>
              onUpdate(rule.id, {
                [isPerTicket ? 'fixedAmount' : 'fixedPerPiece']: Number(e.target.value),
              })
            }
          />
          <span className="absolute right-2 top-2 text-gray-500">
            {isPerTicket ? '元/票' : '元/件'}
          </span>
        </div>
      </div>
    </div>
  );
});
