'use client';

import { useEffect } from 'react';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  // ✅ 全局点击监听
  useEffect(() => {
    const handler = () => {
      console.trace('📍 全局点击触发调用栈');
      console.time('🕒 点击执行耗时');
      setTimeout(() => {
        console.timeEnd('🕒 点击执行耗时');
      }, 0);
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <main className="flex-1 p-6 min-h-screen bg-[#f6f6f6] overflow-y-auto">
      {children}

      <footer className="text-xs text-gray-400 mt-12 text-center pt-6 border-t border-gray-200">
        <p className="mb-1">大货运单系统</p>
        <p>© 2025 版权所有</p>
        <p className="mt-2 text-gray-500">Supported by PARCEL(OSV93)</p>
      </footer>
    </main>
  );
}
