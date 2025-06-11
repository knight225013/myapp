'use client';
import { useState } from 'react';

interface Box {
  code: string; // 箱子编号
  weight: number; // 箱子重量
  length?: number; // 箱子长度
  width?: number; // 箱子宽度
  height?: number; // 箱子高度
  declaredValue: number; // 申报价值
}

interface FormData {
  channelId: string; // 渠道 ID
  recipient: string; // 收件人姓名
  country: string; // 目的国家
  quantity: number; // 货物数量
  weight: number; // 总重量
  cargo: string; // 货物描述
  warehouse: string; // 仓库代码
  length?: number; // 总长度
  width?: number; // 总宽度
  height?: number; // 总高度
  boxes: Box[]; // 箱子列表
}

interface FBAOrderFormProps {
  isOpen: boolean; // 表单是否打开
  onClose: () => void; // 关闭表单回调
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string; // 输入框标签
  value: string | number | undefined; // 输入框值
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // 值变更回调
}) {
  // 渲染文本输入框
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        className="w-full p-2 border rounded"
        value={value ?? ''}
        onChange={onChange}
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string; // 输入框标签
  value: number | undefined; // 输入框值
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // 值变更回调
}) {
  // 渲染数字输入框
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        className="w-full p-2 border rounded"
        value={value ?? 0}
        onChange={onChange}
      />
    </div>
  );
}

export default function FBAOrderForm({ isOpen, onClose }: FBAOrderFormProps) {
  // 初始化表单数据
  const [formData, setFormData] = useState<FormData>({
    channelId: '',
    recipient: '',
    country: '',
    quantity: 0,
    weight: 0,
    cargo: '',
    warehouse: '',
    length: undefined,
    width: undefined,
    height: undefined,
    boxes: [],
  });
  const [error, setError] = useState<string | null>(null); // 错误信息

  // 添加箱子
  const handleAddBox = () => {
    setFormData({
      ...formData,
      boxes: [
        ...formData.boxes,
        { code: `BOX${formData.boxes.length + 1}`, weight: 0, declaredValue: 0 },
      ],
    });
  };

  // 更新箱子字段
  const handleBoxChange = (index: number, field: keyof Box, value: any) => {
    const newBoxes = [...formData.boxes];
    newBoxes[index] = { ...newBoxes[index], [field]: value };
    setFormData({ ...formData, boxes: newBoxes });
  };

  // 提交订单
  const handleSubmit = async () => {
    try {
      // 验证必填字段
      if (
        !formData.channelId ||
        !formData.recipient ||
        !formData.country ||
        !formData.quantity ||
        !formData.weight ||
        !formData.cargo ||
        !formData.warehouse
      ) {
        setError('请填写必填字段：渠道、收件人、国家、数量、重量、货物描述、仓库');
        return;
      }

      // 发送创建请求到 Express 后端
      const response = await fetch('http://localhost:4000/api/fba/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        alert('订单创建成功！'); // 提示创建成功
        onClose(); // 关闭表单
      } else {
        setError('创建失败：' + result.error); // 显示错误
      }
    } catch (error) {
      setError('创建失败：' + (error instanceof Error ? error.message : '未知错误')); // 显示异常错误
    }
  };

  // 表单未打开时不渲染
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-[70vw] bg-white shadow-2xl z-[999] overflow-y-auto transition-transform duration-300 ease-in-out transform translate-x-0">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">创建 FBA 订单</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error} {/* 显示错误信息 */}
          </div>
        )}
        <div className="space-y-8">
          {/* 基础信息 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">基础信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="渠道 ID"
                value={formData.channelId}
                onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
              />
              <TextInput
                label="收件人"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              />
              <TextInput
                label="国家"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
              <NumberInput
                label="数量"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                }
              />
              <NumberInput
                label="总重量"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })
                }
              />
              <TextInput
                label="货物描述"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              />
              <TextInput
                label="仓库代码"
                value={formData.warehouse}
                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
              />
              <NumberInput
                label="总长度"
                value={formData.length}
                onChange={(e) =>
                  setFormData({ ...formData, length: parseFloat(e.target.value) || undefined })
                }
              />
              <NumberInput
                label="总宽度"
                value={formData.width}
                onChange={(e) =>
                  setFormData({ ...formData, width: parseFloat(e.target.value) || undefined })
                }
              />
              <NumberInput
                label="总高度"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: parseFloat(e.target.value) || undefined })
                }
              />
            </div>
          </div>

          {/* 箱子信息 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">箱子信息</h3>
            {formData.boxes.map((box, index) => (
              <div key={index} className="border p-4 rounded-xl mb-4 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <TextInput
                    label="箱子编号"
                    value={box.code}
                    onChange={(e) => handleBoxChange(index, 'code', e.target.value)}
                  />
                  <NumberInput
                    label="重量"
                    value={box.weight}
                    onChange={(e) =>
                      handleBoxChange(index, 'weight', parseFloat(e.target.value) || 0)
                    }
                  />
                  <NumberInput
                    label="长度"
                    value={box.length}
                    onChange={(e) =>
                      handleBoxChange(index, 'length', parseFloat(e.target.value) || undefined)
                    }
                  />
                  <NumberInput
                    label="宽度"
                    value={box.width}
                    onChange={(e) =>
                      handleBoxChange(index, 'width', parseFloat(e.target.value) || undefined)
                    }
                  />
                  <NumberInput
                    label="高度"
                    value={box.height}
                    onChange={(e) =>
                      handleBoxChange(index, 'height', parseFloat(e.target.value) || undefined)
                    }
                  />
                  <NumberInput
                    label="申报价值"
                    value={box.declaredValue}
                    onChange={(e) =>
                      handleBoxChange(index, 'declaredValue', parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            ))}
            <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleAddBox}>
              添加箱子
            </button>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button className="bg-indigo-600 text-white px-6 py-3 rounded" onClick={handleSubmit}>
            保存
          </button>
          <button className="bg-gray-300 text-gray-700 px-6 py-3 rounded" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
