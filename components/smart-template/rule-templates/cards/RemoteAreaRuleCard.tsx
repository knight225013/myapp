'use client';
import React, { useState, useEffect, useRef } from 'react';

interface RemoteAreaRuleCardProps {
  rule: {
    id: string;
    type: string;
    field: string;
    value: string;
    fee?: number;
    countries?: string[];
    regions?: string[];
    label: string;
    condition: string;
    formula: string;
  };
  onUpdate: (id: string, payload: Partial<any>) => void;
  onRemove: (id: string) => void;
}

export const RemoteAreaRuleCard = React.memo(function RemoteAreaRuleCard({
  rule,
  onUpdate,
  onRemove,
}: RemoteAreaRuleCardProps) {
  const initialCountries = rule.countries || [];
  const initialRegions = rule.regions || [];

  const [selectedCountries, setSelectedCountries] = useState<string[]>(initialCountries);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(initialRegions);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const regionDropdownRef = useRef<HTMLDivElement>(null);

  const countries = [
    { code: 'JP', name: '日本' },
    { code: 'US', name: '美国' },
    { code: 'GB', name: '英国' },
    { code: 'DE', name: '德国' },
    { code: 'FR', name: '法国' },
  ];

  const regionData: Record<string, string[]> = {
    JP: ['北海道', '东京', '大阪', '福冈', '冲绳'],
    US: ['加利福尼亚', '德克萨斯', '纽约', '佛罗里达', '华盛顿'],
    GB: ['英格兰', '苏格兰', '威尔士', '北爱尔兰'],
    DE: ['巴伐利亚', '北莱茵-威斯特法伦', '柏林', '汉堡'],
    FR: ['法兰西岛', '普罗旺斯-阿尔卑斯-蓝岸', '奥克西塔尼', '布列塔尼', '诺曼底'],
  };

  useEffect(() => {
    const allRegions = selectedCountries
      .flatMap((code) => regionData[code] || [])
      .filter((v, i, self) => self.indexOf(v) === i);

    setAvailableRegions(allRegions);
    setSelectedRegions((prev) => prev.filter((r) => allRegions.includes(r)));
  }, [selectedCountries]);

  // ✅ 2. 更新父组件 rule 数据
  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdate(rule.id, {
        countries: selectedCountries,
        regions: selectedRegions,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedCountries, selectedRegions, rule.id, onUpdate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(target)) {
        setIsCountryDropdownOpen(false);
      }
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(target)) {
        setIsRegionDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCountrySelect = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region],
    );
  };

  const handleReset = () => {
    setSelectedCountries(initialCountries);
    setSelectedRegions(initialRegions);
  };

  return (
    <div className="flex flex-col gap-4 text-sm relative bg-white rounded-md border p-4 shadow-sm">
      {/* 国家选择 */}
      <div className="flex items-center gap-3">
        <label className="text-gray-700 min-w-[5rem]">选择国家：</label>
        <div className="relative w-64" ref={countryDropdownRef}>
          <button
            type="button"
            className="w-full border p-2 rounded bg-white text-left text-gray-700 flex justify-between items-center hover:ring-2 focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
          >
            <span>
              {selectedCountries.length > 0
                ? selectedCountries
                    .map((code) => countries.find((c) => c.code === code)?.name)
                    .join(', ')
                : '请选择国家'}
            </span>
            <svg
              className={`w-4 h-4 ${isCountryDropdownOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.19l3.71-3.96a.75.75 0 111.08 1.04l-4.25 4.53a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {isCountryDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
              {countries.map((c) => (
                <label
                  key={c.code}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(c.code)}
                    onChange={() => handleCountrySelect(c.code)}
                    className="h-4 w-4 text-blue-600 rounded mr-2"
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleReset}
          className="text-sm px-3 py-1 border rounded text-gray-700 hover:bg-gray-100"
        >
          ⟳ 恢复
        </button>
      </div>

      {/* 区域选择 */}
      <div className="flex items-center gap-3">
        <label className="text-gray-700 min-w-[5rem]">选择区域：</label>
        <div className="relative w-64" ref={regionDropdownRef}>
          <button
            type="button"
            className={`w-full border p-2 rounded bg-white text-left text-gray-700 flex justify-between items-center hover:ring-2 focus:ring-2 focus:ring-blue-500 ${availableRegions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() =>
              availableRegions.length > 0 && setIsRegionDropdownOpen(!isRegionDropdownOpen)
            }
            disabled={availableRegions.length === 0}
          >
            <span>{selectedRegions.length > 0 ? selectedRegions.join(', ') : '请选择区域'}</span>
            <svg
              className={`w-4 h-4 ${isRegionDropdownOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.19l3.71-3.96a.75.75 0 111.08 1.04l-4.25 4.53a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {isRegionDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
              {availableRegions.map((region) => (
                <label
                  key={region}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRegions.includes(region)}
                    onChange={() => handleRegionSelect(region)}
                    className="h-4 w-4 text-blue-600 rounded mr-2"
                  />
                  <span>{region}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 费用输入 */}
      <div className="flex items-center gap-3">
        <label className="text-gray-700 min-w-[5rem]">附加费：</label>
        <div className="relative">
          <input
            type="number"
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
            placeholder="费用金额"
            value={rule.fee ?? ''}
            onChange={(e) => onUpdate(rule.id, { fee: Number(e.target.value) })}
          />
          <span className="absolute right-2 top-2 text-gray-500">元</span>
        </div>
      </div>
    </div>
  );
});
