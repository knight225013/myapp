import { ExtraFeeRule, ExpressionNode } from './types';
import ExpressionBuilder from './ExpressionBuilder';
import { toChineseDescription } from './expressionUtils';
import { Trash2 } from 'lucide-react';

interface ExtraFeeRuleCardProps {
  rule: ExtraFeeRule;
  onUpdate: (updated: Partial<ExtraFeeRule>) => void;
  onDelete: () => void;
}

export default function ExtraFeeRuleCard({ rule, onUpdate, onDelete }: ExtraFeeRuleCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={rule.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="text-lg font-semibold border rounded px-2 py-1 w-full mr-2"
          placeholder="规则名称"
        />
        <button onClick={onDelete} className="text-red-600 hover:text-red-800">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">计费方式</label>
          <select
            value={rule.feeType}
            onChange={(e) => onUpdate({ feeType: e.target.value as 'fixed' | 'perKg' | 'percent' })}
            className="w-full p-2 border rounded-md"
          >
            <option value="fixed">固定费用</option>
            <option value="perKg">每公斤费用</option>
            <option value="percent">百分比</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">金额</label>
          <input
            type="number"
            value={rule.value}
            onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || 0 })}
            step="0.01"
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">币种</label>
          <select
            value={rule.currency}
            onChange={(e) => onUpdate({ currency: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="CNY">CNY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
          <input
            type="text"
            value={rule.note || ''}
            onChange={(e) => onUpdate({ note: e.target.value })}
            className="w-full p-2 border rounded-md"
            placeholder="可选备注"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">生效起始日期</label>
          <input
            type="date"
            value={rule.activeFrom || ''}
            onChange={(e) => onUpdate({ activeFrom: e.target.value })}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">生效结束日期</label>
          <input
            type="date"
            value={rule.activeTo || ''}
            onChange={(e) => onUpdate({ activeTo: e.target.value })}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">条件表达式</label>
        <ExpressionBuilder
          expression={rule.expression}
          onChange={(expression: ExpressionNode[]) => onUpdate({ expression })}
        />
        <p className="text-sm text-gray-500 mt-2">
          表达式含义：{toChineseDescription(rule.expression)}
        </p>
      </div>
    </div>
  );
}
