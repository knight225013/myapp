import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, Plus, Minus } from 'lucide-react';

interface Position {
  title: string;
  members: PositionMember[];
}

interface PositionMember {
  name: string;
  phone: string;
  email: string;
}

interface ClientFormData {
  companyName: string;
  contactName: string;
  phoneNumber: string;
  email: string;
  address: string;
  positions: Position[];
  settlementMethod: string;
  financeContactId: string;
  businessLicense: File | null;
  idCard: File | null;
  status: string;
  notes: string;
}

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => void;
  initialData?: Partial<ClientFormData>;
  isEditing?: boolean;
}

export default function ClientForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    companyName: initialData?.companyName || '',
    contactName: initialData?.contactName || '',
    phoneNumber: initialData?.phoneNumber || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    positions: initialData?.positions || [{ title: '', members: [{ name: '', phone: '', email: '' }] }],
    settlementMethod: initialData?.settlementMethod || 'PREPAID',
    financeContactId: initialData?.financeContactId || '',
    businessLicense: null,
    idCard: null,
    status: initialData?.status || 'ACTIVE',
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const businessLicenseRef = useRef<HTMLInputElement>(null);
  const idCardRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePositionChange = (index: number, field: keyof Position, value: any) => {
    const newPositions = [...formData.positions];
    newPositions[index] = { ...newPositions[index], [field]: value };
    setFormData(prev => ({ ...prev, positions: newPositions }));
  };

  const handleMemberChange = (positionIndex: number, memberIndex: number, field: keyof PositionMember, value: string) => {
    const newPositions = [...formData.positions];
    newPositions[positionIndex].members[memberIndex] = {
      ...newPositions[positionIndex].members[memberIndex],
      [field]: value
    };
    setFormData(prev => ({ ...prev, positions: newPositions }));
  };

  const addPosition = () => {
    setFormData(prev => ({
      ...prev,
      positions: [...prev.positions, { title: '', members: [{ name: '', phone: '', email: '' }] }]
    }));
  };

  const removePosition = (index: number) => {
    if (formData.positions.length > 1) {
      setFormData(prev => ({
        ...prev,
        positions: prev.positions.filter((_, i) => i !== index)
      }));
    }
  };

  const addMember = (positionIndex: number) => {
    const newPositions = [...formData.positions];
    newPositions[positionIndex].members.push({ name: '', phone: '', email: '' });
    setFormData(prev => ({ ...prev, positions: newPositions }));
  };

  const removeMember = (positionIndex: number, memberIndex: number) => {
    const newPositions = [...formData.positions];
    if (newPositions[positionIndex].members.length > 1) {
      newPositions[positionIndex].members.splice(memberIndex, 1);
      setFormData(prev => ({ ...prev, positions: newPositions }));
    }
  };

  const handleFileChange = (field: 'businessLicense' | 'idCard', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = '公司名称不能为空';
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = '联系人姓名不能为空';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = '电话号码不能为空';
    }
    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? '编辑客户' : '新建客户'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    公司名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.companyName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入公司名称"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系人姓名 *
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.contactName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入联系人姓名"
                  />
                  {errors.contactName && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    电话号码 *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入电话号码"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱地址 *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入邮箱地址"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  地址
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入详细地址"
                />
              </div>
            </div>

            {/* Position Structure */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">职位结构</h3>
                <button
                  type="button"
                  onClick={addPosition}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加职位
                </button>
              </div>

              {formData.positions.map((position, positionIndex) => (
                <div key={positionIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={position.title}
                      onChange={(e) => handlePositionChange(positionIndex, 'title', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="职位名称"
                    />
                    {formData.positions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePosition(positionIndex)}
                        className="ml-2 p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {position.members.map((member, memberIndex) => (
                    <div key={memberIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleMemberChange(positionIndex, memberIndex, 'name', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="姓名"
                      />
                      <input
                        type="tel"
                        value={member.phone}
                        onChange={(e) => handleMemberChange(positionIndex, memberIndex, 'phone', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="电话"
                      />
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => handleMemberChange(positionIndex, memberIndex, 'email', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="邮箱"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => addMember(positionIndex)}
                          className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        {position.members.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMember(positionIndex, memberIndex)}
                            className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Finance Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">财务信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    结算方式
                  </label>
                  <select
                    value={formData.settlementMethod}
                    onChange={(e) => handleInputChange('settlementMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PREPAID">预付</option>
                    <option value="MONTHLY">月结</option>
                    <option value="T_PLUS_7">T+7</option>
                    <option value="T_PLUS_15">T+15</option>
                    <option value="T_PLUS_30">T+30</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    财务联系人
                  </label>
                  <select
                    value={formData.financeContactId}
                    onChange={(e) => handleInputChange('financeContactId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择财务联系人</option>
                    <option value="user1">张三 - 财务经理</option>
                    <option value="user2">李四 - 会计</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">附件上传</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    营业执照
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      ref={businessLicenseRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('businessLicense', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => businessLicenseRef.current?.click()}
                      className="w-full flex flex-col items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Upload className="w-8 h-8" />
                      <span className="text-sm">点击上传营业执照</span>
                    </button>
                    {formData.businessLicense && (
                      <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{formData.businessLicense.name}</span>
                        <button
                          type="button"
                          onClick={() => handleFileChange('businessLicense', null)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    身份证
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      ref={idCardRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('idCard', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => idCardRef.current?.click()}
                      className="w-full flex flex-col items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Upload className="w-8 h-8" />
                      <span className="text-sm">点击上传身份证</span>
                    </button>
                    {formData.idCard && (
                      <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{formData.idCard.name}</span>
                        <button
                          type="button"
                          onClick={() => handleFileChange('idCard', null)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Client Status */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">客户状态</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    状态
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">正常</option>
                    <option value="INACTIVE">未激活</option>
                    <option value="FROZEN">冻结</option>
                    <option value="BLACKLISTED">黑名单</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入备注信息"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '提交中...' : (isEditing ? '更新' : '创建')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 