'use client';
import { useState, useEffect, useRef } from 'react';
import { Filters } from '@/types/filters';
import { ChevronDown } from 'lucide-react';

type FilterPanelProps = {
  onFilterChange: (filters: Filters) => void;
};

// 假设 Channels 的类型基于 API 返回的数据
interface Channel {
  id: string;
  name: string;
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<Filters>({
    status: '',
    country: '',
    channel: '',
    waybillNumber: '',
    client: '',
    date: '',
    trackingNumber: '',
    recipient: '',
  });
  const [channels, setChannels] = useState<Channel[]>([]); // 动态渠道列表
  const [loading, setLoading] = useState(false); // 加载状态
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<HTMLDivElement>(null);
  const [searchType, setSearchType] = useState('waybillNumber'); // 当前搜索类型

  const countries = ['中国', '日本', '韩国', '美国', '德国', '越南', '马来西亚'];

  // 获取渠道列表
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch('/api/channels');
        const { success, data, error } = await response.json();
        if (!success) throw new Error(error);
        setChannels(data);
      } catch (error) {
        console.error('获取渠道失败:', error);
      }
    };

    fetchChannels();
  }, []);

  const handleSearch = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const newFilters: Filters = {
      status: '',
      country: '',
      channel: '',
      waybillNumber: '',
      client: '',
      date: '',
      trackingNumber: '',
      recipient: '',
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryRef.current?.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (channelRef.current?.contains(e.target as Node)) {
        setShowChannelDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearchTypeChange = (type: string) => {
    setSearchType(type);
    // 清空其他搜索字段
    const newFilters = { ...filters };
    Object.keys(newFilters).forEach(key => {
      if (key !== 'status' && key !== 'date') {
        newFilters[key as keyof Filters] = '';
      }
    });
    setFilters(newFilters);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newFilters = { ...filters };
    
    // 根据当前搜索类型更新对应的字段
    switch (searchType) {
      case 'waybillNumber':
        newFilters.waybillNumber = value;
        break;
      case 'country':
        newFilters.country = value;
        break;
      case 'recipient':
        newFilters.recipient = value;
        break;
      case 'client':
        newFilters.client = value;
        break;
      case 'trackingNumber':
        newFilters.trackingNumber = value;
        break;
    }
    
    setFilters(newFilters);
  };

  return (
    <section className="glass rounded-3xl shadow-xl p-10 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">筛选条件</h2>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-4">
          <div className="wave-group">
            <input
              required
              type="text"
              className="input"
              value={filters[searchType as keyof Filters] || ''}
              onChange={handleSearchInputChange}
            />
            <span className="bar"></span>
            <label className="label">
              {searchType === 'waybillNumber' && (
                <>
                  <span className="label-char" style={{ '--index': 0 } as any}>运</span>
                  <span className="label-char" style={{ '--index': 1 } as any}>单</span>
                  <span className="label-char" style={{ '--index': 2 } as any}>号</span>
                </>
              )}
              {searchType === 'country' && (
                <>
                  <span className="label-char" style={{ '--index': 0 } as any}>国</span>
                  <span className="label-char" style={{ '--index': 1 } as any}>家</span>
                </>
              )}
              {searchType === 'recipient' && (
                <>
                  <span className="label-char" style={{ '--index': 0 } as any}>收</span>
                  <span className="label-char" style={{ '--index': 1 } as any}>件</span>
                  <span className="label-char" style={{ '--index': 2 } as any}>人</span>
                </>
              )}
              {searchType === 'client' && (
                <>
                  <span className="label-char" style={{ '--index': 0 } as any}>客</span>
                  <span className="label-char" style={{ '--index': 1 } as any}>户</span>
                  <span className="label-char" style={{ '--index': 2 } as any}>单</span>
                  <span className="label-char" style={{ '--index': 3 } as any}>号</span>
                </>
              )}
              {searchType === 'trackingNumber' && (
                <>
                  <span className="label-char" style={{ '--index': 0 } as any}>转</span>
                  <span className="label-char" style={{ '--index': 1 } as any}>单</span>
                  <span className="label-char" style={{ '--index': 2 } as any}>号</span>
                </>
              )}
            </label>
          </div>
          <select
            value={searchType}
            onChange={(e) => handleSearchTypeChange(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="waybillNumber">运单号</option>
            <option value="country">国家</option>
            <option value="recipient">收件人</option>
            <option value="client">客户单号</option>
            <option value="trackingNumber">转单号</option>
          </select>
        </div>
        <div className="flex space-x-4">
          <button
            className="gradient-btn text-white px-8 py-4 h-12 rounded-2xl transition transform hover-glow shadow-md whitespace-nowrap"
            onClick={handleSearch}
          >
            搜索
          </button>
          <button
            className="border border-gray-300 text-gray-500 px-8 py-4 h-12 rounded-2xl hover:bg-gray-100 transition transform hover-glow whitespace-nowrap"
            onClick={handleReset}
          >
            重置
          </button>
        </div>
      </div>
    </section>
  );
}
