'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useMemo, memo } from 'react';
import Link from 'next/link';

// 导航项配置 - 移到组件外部避免重复创建
const NAV_ITEMS = [
  { id: 'dashboard', label: '首页', icon: 'fas fa-home', href: '/' },
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

type NavItem = typeof NAV_ITEMS[number] & { isActive: boolean };

// 导航项组件 - 使用memo优化
const NavItem = memo(({ 
  item, 
  isMobile 
}: { 
  item: NavItem; 
  isMobile: boolean; 
}) => (
  <Link
    href={item.href}
    className={`value ${item.isActive ? 'active' : ''} ${isMobile ? 'justify-center' : ''}`}
    prefetch={true} // 预加载链接
  >
    <i className={`${item.icon} w-4 text-center`}></i>
    {!isMobile && <span>{item.label}</span>}
  </Link>
));

NavItem.displayName = 'NavItem';

// Logo组件 - 使用memo优化
const Logo = memo(({ isMobile }: { isMobile: boolean }) => (
  <div className={`flex ${isMobile ? 'justify-center' : 'items-center gap-3'} mb-6`}>
    <div className="w-10 h-10 bg-[#FF5C58] rounded-full flex items-center justify-center">
      <i className="fas fa-truck text-white text-lg"></i>
    </div>
    {!isMobile && (
      <div className="leading-tight">
        <h1 className="text-lg font-bold">大板运单</h1>
        <p className="text-xs text-gray-400">物流运单管理系统</p>
      </div>
    )}
  </div>
));

Logo.displayName = 'Logo';

// 用户信息组件 - 使用memo优化，移除外部图片
const UserInfo = memo(() => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
      <span className="text-white font-semibold text-lg">张</span>
    </div>
    <div className="leading-tight">
      <p className="text-sm font-semibold">张伟</p>
      <p className="text-xs text-gray-400">超级管理员</p>
    </div>
  </div>
));

UserInfo.displayName = 'UserInfo';

// 推广卡片组件 - 使用memo优化
const PromoCard = memo(() => (
  <div className="mt-6 bg-[#004d40] text-white rounded-xl p-4 leading-snug text-sm">
    <p className="font-semibold">
      让大板运单帮您轻松
      <br />
      管理运单
    </p>
    <p className="text-xs mt-1 text-green-200">随时随地高效操作</p>
  </div>
));

PromoCard.displayName = 'PromoCard';

// 页脚组件 - 使用memo优化
const Footer = memo(({ isMobile }: { isMobile: boolean }) => (
  <div className={`text-xs text-gray-400 text-center ${isMobile ? 'absolute bottom-0 w-full pb-3' : 'pb-3'}`}>
    <p className="mb-1">大货运单系统</p>
    <p>© 2025 版权所有</p>
    <p className="mt-2 text-gray-500">Supported by PARCEL(OSV93)</p>
  </div>
));

Footer.displayName = 'Footer';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // 使用useMemo优化导航项渲染
  const navItems = useMemo(() => 
    NAV_ITEMS.map((item) => ({
      ...item,
      isActive: pathname === item.href,
    })), 
    [pathname]
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 初始化
    handleResize();
    
    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 移动端布局
  if (isMobile) {
    return (
      <aside className="fixed top-0 left-0 h-screen w-16 bg-white text-[#2A3547] flex flex-col justify-between p-3 shadow-md z-50 rounded-tr-3xl rounded-br-3xl">
        <div>
          <Logo isMobile={true} />
          <nav className="input" id="menu">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isMobile={true}
              />
            ))}
          </nav>
        </div>
        <Footer isMobile={true} />
      </aside>
    );
  }

  // 桌面端布局
  return (
    <aside className="w-72 h-screen bg-white text-[#2A3547] flex flex-col justify-between p-5 shadow-md rounded-tr-3xl rounded-br-3xl">
      <div>
        <Logo isMobile={false} />
        <UserInfo />
        <nav className="input" id="menu">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isMobile={false}
            />
          ))}
        </nav>
        <PromoCard />
      </div>
      <Footer isMobile={false} />
    </aside>
  );
}
