'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock,
  MoreHorizontal,
  ArrowLeft,
  UserPlus,
  Shield,
  Mail,
  Phone
} from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  status: 'ACTIVE' | 'DISABLED' | 'DELETED';
  lastLoginAt?: string;
  createdAt: string;
  roles: {
    role: {
      id: string;
      name: string;
    };
  }[];
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [pagination.page, searchTerm, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(roleFilter && { roleId: roleFilter })
      });

      const response = await fetch(`/api/settings/users?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/settings/roles');
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/settings/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        alert(`用户状态已更新为${newStatus === 'ACTIVE' ? '启用' : '禁用'}`);
      } else {
        alert('操作失败: ' + data.error);
      }
    } catch (error) {
      console.error('更新用户状态失败:', error);
      alert('操作失败');
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('确定要重置该用户的密码吗？')) return;

    try {
      const response = await fetch(`/api/settings/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('密码重置成功，新密码已发送到用户邮箱');
      } else {
        alert('重置失败: ' + data.error);
      }
    } catch (error) {
      console.error('重置密码失败:', error);
      alert('重置失败');
    }
  };

  const handleBatchOperation = async (operation: string) => {
    if (selectedUsers.length === 0) {
      alert('请选择要操作的用户');
      return;
    }

    const operationText = {
      'disable': '禁用',
      'enable': '启用',
      'delete': '删除'
    }[operation];

    if (!confirm(`确定要${operationText}选中的 ${selectedUsers.length} 个用户吗？`)) return;

    try {
      const response = await fetch('/api/settings/users/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation,
          userIds: selectedUsers
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        setSelectedUsers([]);
        alert(`成功${operationText} ${data.data.affectedCount} 个用户`);
      } else {
        alert('操作失败: ' + data.error);
      }
    } catch (error) {
      console.error('批量操作失败:', error);
      alert('操作失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'success' as const, text: '正常' },
      DISABLED: { variant: 'warning' as const, text: '禁用' },
      DELETED: { variant: 'destructive' as const, text: '已删除' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    setSelectedUsers(prev => 
      prev.length === users.length ? [] : users.map(u => u.id)
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
            <p className="text-gray-600 mt-1">管理系统用户账户和权限</p>
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/settings/users/new">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              创建用户
            </Button>
          </Link>
          
          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                已选择 {selectedUsers.length} 个用户
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchOperation('enable')}
              >
                <Unlock className="h-4 w-4 mr-1" />
                启用
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchOperation('disable')}
              >
                <Lock className="h-4 w-4 mr-1" />
                禁用
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchOperation('delete')}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                删除
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索用户名、邮箱或姓名..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部状态</option>
            <option value="ACTIVE">正常</option>
            <option value="DISABLED">禁用</option>
            <option value="DELETED">已删除</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部角色</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 用户列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={toggleAllUsers}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    联系方式
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最后登录
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar}
                              alt={user.firstName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center mt-1">
                            <Phone className="h-4 w-4 mr-1 text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((userRole) => (
                          <Badge key={userRole.role.id} variant="secondary">
                            <Shield className="h-3 w-3 mr-1" />
                            {userRole.role.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt 
                        ? new Date(user.lastLoginAt).toLocaleString('zh-CN')
                        : '从未登录'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link href={`/settings/users/${user.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(user.id)}
                        >
                          <Lock className="h-4 w-4" />
                        </Button>

                        {user.status === 'ACTIVE' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(user.id, 'DISABLED')}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                          >
                            <Unlock className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">暂无用户</h3>
              <p className="mt-1 text-sm text-gray-500">
                开始创建第一个用户账户
              </p>
              <div className="mt-6">
                <Link href="/settings/users/new">
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    创建用户
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            显示第 {((pagination.page - 1) * pagination.limit) + 1} 到{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} 条，
            共 {pagination.total} 条记录
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              上一页
            </Button>
            <span className="text-sm text-gray-700">
              第 {pagination.page} 页，共 {pagination.pages} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 