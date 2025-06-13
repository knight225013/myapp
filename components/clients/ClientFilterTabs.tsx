import React from 'react';

interface ClientFilterTabsProps {
  activeFilter: 'all' | 'active' | 'frozen' | 'blacklisted';
  onFilterChange: (filter: 'all' | 'active' | 'frozen' | 'blacklisted') => void;
  counts: {
    all: number;
    active: number;
    frozen: number;
    blacklisted: number;
  };
}

export default function ClientFilterTabs({
  activeFilter,
  onFilterChange,
  counts
}: ClientFilterTabsProps) {
  const tabs = [
    { id: 'all' as const, label: '全部状态', count: counts.all },
    { id: 'active' as const, label: '正常', count: counts.active },
    { id: 'frozen' as const, label: '冻结', count: counts.frozen },
    { id: 'blacklisted' as const, label: '黑名单', count: counts.blacklisted }
  ];

  return (
    <div className="flex items-center gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
            flex items-center gap-2
            ${activeFilter === tab.id
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }
          `}
        >
          <span>{tab.label}</span>
          <span
            className={`
              px-2 py-0.5 rounded-full text-xs font-semibold
              ${activeFilter === tab.id
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600'
              }
            `}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
} 