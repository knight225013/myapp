'use client';

import { useState, useEffect } from 'react';
type MultiCheckboxProps = {
  label: string;
  name: string;
  options: string[];
  value?: string[];
  onChange?: (selected: string[]) => void;
};

export default function MultiCheckbox({
  label,
  name,
  options,
  value = [],
  onChange,
}: MultiCheckboxProps) {
  const [selected, setSelected] = useState<string[]>(value);

  useEffect(() => {
    setSelected(value); // 确保外部变了，内部也更新
  }, [value]);

  const handleChange = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="flex items-center">
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={selected.includes(option)}
              onChange={() => handleChange(option)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
