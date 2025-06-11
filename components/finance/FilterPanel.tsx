'use client';
import { useState, useEffect, useRef } from 'react';
import { Filters } from '../types/filters';
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
  });
  const [channels, setChannels] = useState<Channel[]>([]); // 动态渠道列表
  const [loading, setLoading] = useState(false); // 加载状态
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<HTMLDivElement>(null);

  const countries = ['中国', '日本', '韩国', '美国', '德国', '越南', '马来西亚'];

  // 获取渠道列表
  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:4000/api/channels');
        const result = await response.json();
        if (result.success) {
          setChannels(result.data); // 设置渠道列表
        } else {
          console.error('获取渠道失败:', result.error);
        }
      } catch (error) {
        console.error('获取渠道失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

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

  return (
    <section className="glass rounded-3xl shadow-xl p-10 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">筛选条件</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="relative">
          <input
            type="text"
            name="waybillNumber"
            placeholder="运单号"
            value={filters.waybillNumber}
            onChange={handleChange}
            className="form-input-style"
          />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="转单号"
            className="form-input-style"
            onChange={(e) => setFilters((prev) => ({ ...prev, trackingNumber: e.target.value }))}
          />
        </div>
        <div className="relative w-full" ref={countryRef}>
          <div
            className="form-input-style flex items-center"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
          >
            <input
              type="text"
              name="country"
              placeholder="搜索国家"
              value={filters.country}
              onChange={handleChange}
              className="w-full focus:outline-none text-sm"
              autoComplete="off"
            />
            <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
          </div>
          <div className={`dropdown ${showCountryDropdown ? '' : 'hidden'}`}>
            <ul className="dropdown-list text-sm">
              {countries.map((country) => (
                <li
                  key={country}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, country }));
                    setShowCountryDropdown(false);
                  }}
                >
                  {country}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative w-full" ref={channelRef}>
          <div
            className="form-input-style flex items-center"
            onClick={() => setShowChannelDropdown(!showChannelDropdown)}
          >
            <input
              type="text"
              name="channel"
              placeholder="搜索渠道"
              value={filters.channel}
              onChange={handleChange}
              className="w-full focus:outline-none text-sm"
              autoComplete="off"
            />
            <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
          </div>
          <div className={`dropdown ${showChannelDropdown ? '' : 'hidden'}`}>
            {loading ? (
              <div className="px-4 py-2 text-sm text-gray-500">加载中...</div>
            ) : channels.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">无可用渠道</div>
            ) : (
              <ul className="dropdown-list text-sm">
                {channels.map((channel) => (
                  <li
                    key={channel.id}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, channel: channel.name }));
                      setShowChannelDropdown(false);
                    }}
                  >
                    {channel.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="relative w-full">
          <input
            type="text"
            name="date"
            placeholder="下单日期"
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => {
              if (!e.target.value) e.target.type = 'text';
            }}
            value={filters.date}
            onChange={handleChange}
            className="form-input-style"
          />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="收件人"
            className="form-input-style"
            onChange={(e) => setFilters((prev) => ({ ...prev, recipient: e.target.value }))}
          />
        </div>
        <div className="relative">
          <input
            type="text"
            name="client"
            placeholder="客户单号"
            value={filters.client}
            onChange={handleChange}
            className="form-input-style"
          />
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
