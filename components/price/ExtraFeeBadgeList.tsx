'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';

interface Rule {
  id: string;
  name: string;
  type: string;
  params?: {
    label?: string;
  };
}

interface Props {
  rules: Rule[];
}

const getVariantByRuleType = (type: string): 'info' | 'success' | 'warning' | 'error' | 'default' => {
  switch (type) {
    case 'longest_side_fee':
      return 'info';
    case 'weight_fee':
      return 'success';
    case 'remote_area_fee':
      return 'warning';
    case 'customs_fee':
      return 'error';
    default:
      return 'default';
  }
};

export const ExtraFeeBadgeList: React.FC<Props> = ({ rules }) => {
  if (!rules?.length) return <div className="text-gray-500 text-sm">暂无附加费规则</div>;

  return (
    <div className="flex flex-wrap gap-2">
      {rules.map((rule) => (
        <Badge
          key={rule.id}
          variant={getVariantByRuleType(rule.type)}
          size="sm"
        >
          {rule.params?.label || rule.name || '未命名规则'}
        </Badge>
      ))}
    </div>
  );
};
