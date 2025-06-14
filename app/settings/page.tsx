'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Settings, 
  Building2, 
  Palette, 
  Users, 
  Shield, 
  Warehouse, 
  FileText, 
  Lock,
  Database,
  Activity,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface SystemOverview {
  company: {
    companyName: string;
    logo?: string;
  } | null;
  userCount: number;
  warehouseCount: number;
  customFieldCount: number;
  lastAuditLog: {
    createdAt: string;
    user: {
      username: string;
    };
  } | null;
}

interface SettingModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  status: 'configured' | 'partial' | 'not-configured';
  category: 'basic' | 'advanced' | 'security';
}

export default function SettingsPage() {
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await fetch('/api/settings/overview');
      const data = await response.json();
      if (data.success) {
        setOverview(data.data);
      }
    } catch (error) {
      console.error('获取系统概览失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const settingModules: SettingModule[] = [
    // 基础设置
    {
      id: 'company',
      title: '公司资料',
      description: '管理公司基本信息、logo和联系方式',
      icon: Building2,
      href: '/settings/company',
      status: overview?.company?.companyName ? 'configured' : 'not-configured',
      category: 'basic'
    },
    {
      id: 'branding',
      title: '品牌设置',
      description: '自定义系统外观、主题色彩和白标设置',
      icon: Palette,
      href: '/settings/branding',
      status: 'partial',
      category: 'basic'
    },
    {
      id: 'users',
      title: '用户管理',
      description: '管理用户账户、角色权限和审批流程',
      icon: Users,
      href: '/settings/users',
      status: overview?.userCount ? 'configured' : 'not-configured',
      category: 'basic'
    },
    {
      id: 'warehouses',
      title: '仓库管理',
      description: '配置仓库信息、库位和出入库策略',
      icon: Warehouse,
      href: '/settings/warehouses',
      status: overview?.warehouseCount ? 'configured' : 'not-configured',
      category: 'basic'
    },
    
    // 高级设置
    {
      id: 'numbering',
      title: '编号规则',
      description: '设置运单、发票等单据的编号规则',
      icon: FileText,
      href: '/settings/numbering',
      status: 'partial',
      category: 'advanced'
    },
    {
      id: 'custom-fields',
      title: '自定义字段',
      description: '为核心实体添加自定义属性和元数据',
      icon: Database,
      href: '/settings/custom-fields',
      status: overview?.customFieldCount ? 'configured' : 'not-configured',
      category: 'advanced'
    },
    
    // 安全设置
    {
      id: 'security',
      title: '安全设置',
      description: '密码策略、双因子认证和IP访问控制',
      icon: Shield,
      href: '/settings/security',
      status: 'partial',
      category: 'security'
    },
    {
      id: 'audit',
      title: '审计日志',
      description: '查看系统操作记录和安全审计',
      icon: Activity,
      href: '/settings/audit',
      status: 'configured',
      category: 'security'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'configured':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'not-configured':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'configured':
        return '已配置';
      case 'partial':
        return '部分配置';
      case 'not-configured':
        return '未配置';
      default:
        return '';
    }
  };

  const groupedModules = {
    basic: settingModules.filter(m => m.category === 'basic'),
    advanced: settingModules.filter(m => m.category === 'advanced'),
    security: settingModules.filter(m => m.category === 'security')
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">系统设置</h1>
          <p className="text-gray-600 mt-1">配置和管理系统各项功能</p>
        </div>
      </div>

      {/* 系统概览 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">系统概览</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {overview?.company?.companyName || '未设置'}
              </div>
              <div className="text-sm text-gray-600">公司名称</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {overview?.userCount || 0}
              </div>
              <div className="text-sm text-gray-600">活跃用户</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {overview?.warehouseCount || 0}
              </div>
              <div className="text-sm text-gray-600">仓库数量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {overview?.customFieldCount || 0}
              </div>
              <div className="text-sm text-gray-600">自定义字段</div>
            </div>
          </div>
          
          {overview?.lastAuditLog && (
            <div className="mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                最近操作：{overview.lastAuditLog.user.username} 于 {' '}
                {new Date(overview.lastAuditLog.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 基础设置 */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">基础设置</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedModules.basic.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.id} href={module.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {module.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {module.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(module.status)}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {getStatusText(module.status)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 高级设置 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">高级设置</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedModules.advanced.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.id} href={module.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Icon className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {module.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {module.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(module.status)}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {getStatusText(module.status)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 安全设置 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">安全设置</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedModules.security.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.id} href={module.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <Icon className="h-6 w-6 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {module.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {module.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(module.status)}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {getStatusText(module.status)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">快速操作</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/settings/users/new">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                创建新用户
              </Button>
            </Link>
            <Link href="/settings/warehouses">
              <Button variant="outline" className="w-full justify-start">
                <Warehouse className="h-4 w-4 mr-2" />
                添加仓库
              </Button>
            </Link>
            <Link href="/settings/audit">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                查看审计日志
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
