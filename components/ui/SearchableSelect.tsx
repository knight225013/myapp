'use client';

import { ChangeEvent, useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

type SearchableSelectProps = {
  label: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string; // 新增：支持 placeholder
};

export default function SearchableSelect({
  label,
  name,
  value = '',
  onChange,
  options = [],
  required,
  disabled,
  placeholder, // 新增
}: SearchableSelectProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const selectRef = useRef<HTMLDivElement>(null);

  // 同步 options 更新 filteredOptions
  useEffect(() => {
    setFilteredOptions(options);
    setSearch('');
  }, [options]);

  // 同步 value 到搜索框（显示对应 label）
  useEffect(() => {
    const selectedOption = options.find((opt) => opt.value === value);
    setSearch(selectedOption ? selectedOption.label : '');
  }, [value, options]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value.toLowerCase();
    setSearch(e.target.value);
    setFilteredOptions(options.filter((opt) => opt.label.toLowerCase().includes(keyword)));
  };

  const handleOptionClick = (option: { value: string; label: string }) => {
    const syntheticEvent = {
      target: { name, value: option.value },
    } as React.ChangeEvent<HTMLSelectElement>;
    if (onChange) onChange(syntheticEvent);
    setShowDropdown(false);
    setSearch(option.label);
  };

  return (
    <div className="mb-4 relative" ref={selectRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`form-input-style flex items-center ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
      >
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          className="w-full focus:outline-none text-sm"
          autoComplete="off"
          placeholder={placeholder || `选择${label}`} // 修改：使用 placeholder
          disabled={disabled}
        />
        <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
      </div>
      <div className={`dropdown ${showDropdown && !disabled ? '' : 'hidden'}`}>
        <ul className="dropdown-list text-sm">
          {filteredOptions.length === 0 ? (
            <li className="px-4 py-2 text-gray-500">无可用选项</li>
          ) : (
            filteredOptions.map((option) => (
              <li
                key={option.value}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
