// components/smart-template/fee-rules/ExtraFeeRuleCard.tsx

import type { FeeRule as ExtraFeeRule } from './types';

interface ExtraFeeRuleCardProps {
  rule: ExtraFeeRule;
  disableLink?: boolean; // 如果以后需要加链接逻辑可以用到
}

export function ExtraFeeRuleCard({
  rule,
}: ExtraFeeRuleCardProps) {
  const { params } = rule;

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition bg-white">
      <h3 className="text-lg font-semibold mb-1">{params.label}</h3>
      <p className="text-sm text-gray-600">
        详情：{params.field}：{params.min ?? 0} ～ {params.max ?? 0} → {params.price}{' '}
        {params.chargeUnit}
      </p>
    </div>
  );
}
