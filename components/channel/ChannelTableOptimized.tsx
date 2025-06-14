import React, { memo, useMemo, useCallback, useState } from 'react';
import { Channel } from '@/types/shipment';

interface ChannelTableOptimizedProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onCreateTemplate: (channelId: string) => void;
  onDeleteChannel: (channel: Channel) => void;
}

// 单行组件 - 使用memo优化
const ChannelRow = memo(({ 
  channel,
  onSelectChannel,
  onCreateTemplate,
  onDeleteChannel,
}: {
  channel: Channel;
  onSelectChannel: (channel: Channel) => void;
  onCreateTemplate: (channelId: string) => void;
  onDeleteChannel: (channel: Channel) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRowClick = useCallback(() => {
    onSelectChannel(channel);
  }, [channel, onSelectChannel]);

  const handleCreateTemplate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateTemplate(channel.id);
  }, [channel.id, onCreateTemplate]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteChannel(channel);
  }, [channel, onDeleteChannel]);

  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <>
      <tr 
        className="hover:bg-gray-50 cursor-pointer border-b border-gray-200"
        onClick={handleRowClick}
      >
        <td className="px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={handleToggleExpand}
              className="mr-2 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
            <div>
              <div className="font-medium text-gray-900">{channel.name}</div>
              <div className="text-sm text-gray-500">{channel.code}</div>
            </div>
          </div>
        </td>
        
        <td className="px-4 py-3 text-sm text-gray-600">
          <span className={`px-2 py-1 rounded-full text-xs ${
            channel.type === 'FBA' ? 'bg-blue-100 text-blue-800' :
            channel.type === '传统' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {channel.type}
          </span>
        </td>
        
        <td className="px-4 py-3 text-sm text-gray-600">
          {channel.country || '-'}
        </td>
        
        <td className="px-4 py-3 text-sm text-gray-600">
          {channel.warehouse || '-'}
        </td>
        
        <td className="px-4 py-3 text-sm text-gray-600">
          {channel.currency || 'USD'}
        </td>
        
        <td className="px-4 py-3 text-sm text-gray-600">
          {channel.aging || '-'}
        </td>
        
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCreateTemplate}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              模板
            </button>
            <button
              onClick={handleRowClick}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              编辑
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              删除
            </button>
          </div>
        </td>
      </tr>
      
      {/* 展开的详细信息 */}
      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan={7} className="px-4 py-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">起运地:</span>
                <span className="ml-2 text-gray-600">{channel.origin || '-'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">体积比:</span>
                <span className="ml-2 text-gray-600">{channel.volRatio || '-'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">最小费用:</span>
                <span className="ml-2 text-gray-600">{channel.minCharge || '-'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">计费方式:</span>
                <span className="ml-2 text-gray-600">{channel.chargeMethod || '-'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">分配用户:</span>
                <span className="ml-2 text-gray-600">{channel.assignedUser || '-'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">用户等级:</span>
                <span className="ml-2 text-gray-600">{channel.userLevel || '-'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">运单规则:</span>
                <span className="ml-2 text-gray-600">{channel.waybillRule || '-'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">标签代码:</span>
                <span className="ml-2 text-gray-600">{channel.labelCode || '-'}</span>
              </div>
            </div>
            
            {/* 费率信息 */}
            {channel.rates && channel.rates.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">费率信息:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {channel.rates.slice(0, 6).map((rate, index) => (
                    <div key={index} className="text-xs bg-white p-2 rounded border">
                      <span className="font-medium">{rate.weightRange}:</span>
                      <span className="ml-1">{rate.price} {channel.currency}</span>
                    </div>
                  ))}
                  {channel.rates.length > 6 && (
                    <div className="text-xs text-gray-500 p-2">
                      还有 {channel.rates.length - 6} 个费率...
                    </div>
                  )}
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
});

ChannelRow.displayName = 'ChannelRow';

// 表头组件 - 使用memo优化
const TableHeader = memo(() => (
  <thead className="bg-gray-50">
    <tr>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        渠道名称
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        类型
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        目的国
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        仓库
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        币种
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        时效
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        操作
      </th>
    </tr>
  </thead>
));

TableHeader.displayName = 'TableHeader';

// 统计信息组件 - 使用memo优化
const ChannelStats = memo(({ channels }: { channels: Channel[] }) => {
  const stats = useMemo(() => {
    const typeCount = channels.reduce((acc, channel) => {
      acc[channel.type] = (acc[channel.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const countryCount = channels.reduce((acc, channel) => {
      if (channel.country) {
        acc[channel.country] = (acc[channel.country] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      total: channels.length,
      typeCount,
      countryCount: Object.keys(countryCount).length,
    };
  }, [channels]);

  return (
    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
      <div className="flex flex-wrap gap-4 text-sm">
        <div>
          <span className="font-medium text-blue-700">总渠道数:</span>
          <span className="ml-1 text-blue-600">{stats.total}</span>
        </div>
        <div>
          <span className="font-medium text-blue-700">覆盖国家:</span>
          <span className="ml-1 text-blue-600">{stats.countryCount}</span>
        </div>
        {Object.entries(stats.typeCount).map(([type, count]) => (
          <div key={type}>
            <span className="font-medium text-blue-700">{type}渠道:</span>
            <span className="ml-1 text-blue-600">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

ChannelStats.displayName = 'ChannelStats';

// 主表格组件
export default function ChannelTableOptimized({
  channels,
  onSelectChannel,
  onCreateTemplate,
  onDeleteChannel,
}: ChannelTableOptimizedProps) {
  const [sortField, setSortField] = useState<keyof Channel>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 排序处理
  const handleSort = useCallback((field: keyof Channel) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  // 排序后的渠道列表
  const sortedChannels = useMemo(() => {
    return [...channels].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [channels, sortField, sortDirection]);

  if (channels.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">暂无渠道数据</div>
        <div className="text-gray-400 text-sm mt-2">请创建新的渠道或检查筛选条件</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChannelStats channels={channels} />
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader />
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedChannels.map((channel) => (
                <ChannelRow
                  key={channel.id}
                  channel={channel}
                  onSelectChannel={onSelectChannel}
                  onCreateTemplate={onCreateTemplate}
                  onDeleteChannel={onDeleteChannel}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 