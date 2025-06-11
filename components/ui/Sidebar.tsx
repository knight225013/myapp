'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  const navItems = [
    { id: 'shipment', label: '运单管理', icon: 'fas fa-box', href: '/waybill' },
    { id: 'finance', label: '财务系统', icon: 'fas fa-credit-card', href: '/finance' },
    { id: 'report', label: '数据报表', icon: 'fas fa-chart-bar', href: '/reports' },
    { id: 'channel', label: '渠道管理', icon: 'fas fa-globe', href: '/channels' },
    { id: 'client', label: '客户管理', icon: 'fas fa-users', href: '/clients' },
    {
      id: 'extra-fee',
      label: '附加费模板',
      icon: 'fas fa-layer-group',
      href: '/extra-fee-template',
    },
    { id: 'smart-template', label: '智能模板', icon: 'fas fa-th', href: '/smart-template' },
    { id: 'settings', label: '系统设置', icon: 'fas fa-cog', href: '/settings' },
  ];

  useEffect(() => {
    const buttons = document.querySelectorAll('#menu .value');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ 移动端布局：继续使用 fixed + 触摸优化
  if (isMobile) {
    return (
      <aside className="fixed top-0 left-0 h-screen w-16 bg-white text-[#2A3547] flex flex-col justify-between p-3 shadow-md z-50 rounded-tr-3xl rounded-br-3xl">
        <div>
          <div className="flex justify-center mb-6">
            <div className="w-10 h-10 bg-[#FF5C58] rounded-full flex items-center justify-center">
              <i className="fas fa-truck text-white text-lg"></i>
            </div>
          </div>
          <div className="input" id="menu">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`value ${pathname === item.href ? 'active' : ''} justify-center`}
              >
                <i className={`${item.icon} w-4 text-center`}></i>
              </a>
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-400 text-center absolute bottom-0 w-full pb-3">
          <p className="mb-1">大货运单系统</p>
          <p>© 2025 版权所有</p>
          <p className="mt-2 text-gray-500">Supported by PARCEL(OSV93)</p>
        </div>
      </aside>
    );
  }

  // ✅ 桌面端布局：不要用 fixed，参与 flex 布局即可
  return (
    <aside className="w-72 h-screen bg-white text-[#2A3547] flex flex-col justify-between p-5 shadow-md rounded-tr-3xl rounded-br-3xl">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#FF5C58] rounded-full flex items-center justify-center">
            <i className="fas fa-truck text-white text-lg"></i>
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-bold">大板运单</h1>
            <p className="text-xs text-gray-400">物流运单管理系统</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="https://i.pravatar.cc/50"
            alt="头像"
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold">张伟</p>
            <p className="text-xs text-gray-400">超级管理员</p>
          </div>
        </div>
        <div className="input" id="menu">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`value ${pathname === item.href ? 'active' : ''}`}
            >
              <i className={`${item.icon} w-4 text-center`}></i>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
        <div className="mt-6 bg-[#004d40] text-white rounded-xl p-4 leading-snug text-sm">
          <p className="font-semibold">
            让大板运单帮您轻松
            <br />
            管理运单
          </p>
          <p className="text-xs mt-1 text-green-200">随时随地高效操作</p>
        </div>
      </div>
      <div className="text-xs text-gray-400 text-center pb-3">
        <p className="mb-1">大货运单系统</p>
        <p>© 2025 版权所有</p>
        <p className="mt-2 text-gray-500">Supported by PARCEL(OSV93)</p>
      </div>
    </aside>
  );
}
