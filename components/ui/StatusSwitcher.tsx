'use client';

import { useRef } from 'react';

interface StatusButton {
  label: string;
  status: string;
}
interface StatusSwitcherProps {
  statusButtons: StatusButton[];
  selectedStatus: string;
  onChange: (status: string) => void;
  buttonClassName?: string;
  activeClassName?: string;
}

export default function StatusSwitcher({
  statusButtons,
  selectedStatus,
  onChange,
  buttonClassName = 'text-sm font-medium text-[#7d7d7d] hover:text-[#212121] transition-all',
  activeClassName = 'text-[#212121] font-bold',
}: StatusSwitcherProps) {
  const selectedIndex = statusButtons.findIndex((btn) => btn.status === selectedStatus);
  const widthPercent = 100 / statusButtons.length;

  return (
    <div className="relative flex w-full max-w-5xl mx-auto border-2 border-[#ffc000] rounded-full h-[50px] items-center overflow-hidden mb-6">
      {/* 黄色背景块（选中态） */}
      <div
        className="absolute top-1/2 -translate-y-1/2 h-[38px] rounded-full bg-[#ffc000] transition-all duration-[500ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
        style={{
          width: `${widthPercent}%`,
          left: `${selectedIndex * widthPercent}%`,
        }}
      />

      {/* 选项按钮组 */}
      {statusButtons.map((btn) => (
        <button
          key={btn.status}
          onClick={() => onChange(btn.status)}
          className={`relative z-10 flex-1 h-full text-center px-2 py-1 focus:outline-none ${
            selectedStatus === btn.status ? activeClassName : buttonClassName
          }`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
