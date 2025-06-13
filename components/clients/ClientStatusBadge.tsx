import React from 'react';

interface ClientStatusBadgeProps {
  status: 'active' | 'frozen' | 'blacklisted';
}

export default function ClientStatusBadge({ status }: ClientStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          label: '正常',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      case 'frozen':
        return {
          label: '冻结',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200'
        };
      case 'blacklisted':
        return {
          label: '黑名单',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200'
        };
      default:
        return {
          label: '未知',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
      {config.label}
    </span>
  );
} 