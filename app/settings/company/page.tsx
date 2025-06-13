'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Building2, 
  Upload, 
  X, 
  Save, 
  ArrowLeft,
  Image as ImageIcon,
  Globe,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CompanyProfile {
  id?: string;
  companyName: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxNumber?: string;
  description?: string;
}

export default function CompanySettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    taxNumber: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const response = await fetch('/api/settings/company/profile');
      const data = await response.json();
      if (data.success && data.data) {
        setProfile(data.data);
        if (data.data.logo) {
          setLogoPreview(data.data.logo);
        }
      }
    } catch (error) {
      console.error('获取公司资料失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CompanyProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('只支持 JPEG、PNG、GIF、WebP 格式的图片');
        return;
      }

      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('文件大小不能超过 5MB');
        return;
      }

      setLogoFile(file);
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setProfile(prev => ({ ...prev, logo: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile.companyName.trim()) {
      alert('公司名称不能为空');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      
      // 添加基本信息
      Object.entries(profile).forEach(([key, value]) => {
        if (value && key !== 'logo') {
          formData.append(key, value);
        }
      });

      // 添加logo文件
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await fetch('/api/settings/company/profile', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        alert('公司资料保存成功！');
        setProfile(data.data);
        setLogoFile(null);
        if (data.data.logo) {
          setLogoPreview(data.data.logo);
        }
      } else {
        alert('保存失败: ' + data.error);
      }
    } catch (error) {
      console.error('保存公司资料失败:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
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
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">公司资料</h1>
            <p className="text-gray-600 mt-1">管理公司基本信息和品牌标识</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo设置 */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">公司Logo</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="公司Logo"
                      className="w-24 h-24 object-contain border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <Button type="button" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      上传Logo
                    </Button>
                  </label>
                  {logoPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveLogo}
                    >
                      <X className="h-4 w-4 mr-2" />
                      移除
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  支持 JPEG、PNG、GIF、WebP 格式，文件大小不超过 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">基本信息</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  公司名称 *
                </label>
                <Input
                  value={profile.companyName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleInputChange('companyName', e.target.value)
                  }
                  placeholder="请输入公司名称"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  税号
                </label>
                <Input
                  value={profile.taxNumber || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleInputChange('taxNumber', e.target.value)
                  }
                  placeholder="请输入税号"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                公司地址
              </label>
              <Input
                value={profile.address || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleInputChange('address', e.target.value)
                }
                placeholder="请输入公司地址"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  联系电话
                </label>
                <Input
                  value={profile.phone || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleInputChange('phone', e.target.value)
                  }
                  placeholder="请输入联系电话"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  邮箱地址
                </label>
                <Input
                  type="email"
                  value={profile.email || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleInputChange('email', e.target.value)
                  }
                  placeholder="请输入邮箱地址"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="h-4 w-4 inline mr-1" />
                公司网站
              </label>
              <Input
                type="url"
                value={profile.website || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleInputChange('website', e.target.value)
                }
                placeholder="https://www.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                公司简介
              </label>
              <textarea
                value={profile.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="请输入公司简介"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-4">
          <Link href="/settings">
            <Button variant="outline">取消</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </form>
    </div>
  );
} 