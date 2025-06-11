'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Input from '../ui/Input';
import SearchableSelect from '../SearchableSelect';
import MultiCheckbox from '../MultiCheckbox';
import Textarea from '../Textarea';
import Radio from '../Radio';
import { Shipment } from '../../types/shipment';

export default function ShipmentEditForm({
  shipment,
  onCancel,
  onSuccess,
}: {
  shipment: Shipment;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    client: shipment.recipient || '',
    senderId: shipment.senderId || '',
    senderName: shipment.senderName || '',
    vat: shipment.vat || '',
    clientCode: shipment.clientCode || '',
    company: shipment.company || '',
    phone: shipment.phone || '',
    email: shipment.email || '',
    store: shipment.store || '',
    ref1: shipment.ref1 || '',
    ioss: shipment.ioss || '',
    eori: shipment.eori || '',
    currency: shipment.currency || '',
    category: shipment.category || '',
    productName: shipment.productName || '',
    attrs: shipment.attrs || [],
    notes: shipment.notes || '',
    insurance: shipment.insurance || false,
    volume: shipment.volume?.toString() || '',
    volumetricWeight: shipment.volumetricWeight?.toString() || '',
    chargeWeight: shipment.chargeWeight?.toString() || '',
    status: shipment.status || '已下单',
    trackingNumber: shipment.trackingNumber || '',
  });
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/customers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCustomers(data.data.map((c: any) => ({ id: c.id, name: c.name })));
        }
      })
      .catch((error) => console.error('获取客户列表失败:', error));
  }, []);

  const statusOptions = ['已下单', '已收货', '转运中', '已签收', '退件', '已取消'];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleMultiCheckboxChange = (attrs: string[]) => {
    setFormData((prev) => ({ ...prev, attrs }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:4000/api/waybills/${shipment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          volume: parseFloat(formData.volume) || 0,
          volumetricWeight: parseFloat(formData.volumetricWeight) || 0,
          chargeWeight: parseFloat(formData.chargeWeight) || 0,
        }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        alert('更新失败');
      }
    } catch (error) {
      console.error('提交错误:', error);
      alert('更新失败');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">编辑运单 #{shipment.id}</h2>
        <button onClick={onCancel}>
          <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="收件人"
            name="client"
            value={formData.client}
            onChange={handleChange}
            required
            placeholder="请输入收件人"
          />
          <SearchableSelect
            label="发件人"
            name="senderId"
            value={formData.senderId}
            onChange={(e) => setFormData({ ...formData, senderId: e.target.value })}
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="选择发件人"
          />
          <Input
            label="自定义发件人"
            name="senderName"
            value={formData.senderName}
            onChange={handleChange}
            placeholder="输入自定义发件人名称（可选）"
          />
          <Input
            label="VAT信息"
            name="vat"
            value={formData.vat}
            onChange={handleChange}
            placeholder="请输入VAT信息"
          />
          <Input
            label="客户单号"
            name="clientCode"
            value={formData.clientCode}
            onChange={handleChange}
            placeholder="请输入客户单号"
          />
          <Input
            label="公司"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="请输入公司名称"
          />
          <Input
            label="电话"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="请输入电话"
          />
          <Input
            label="邮箱"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="请输入邮箱"
          />
          <Input
            label="店铺"
            name="store"
            value={formData.store}
            onChange={handleChange}
            placeholder="请输入店铺名称"
          />
          <Input
            label="参考号一"
            name="ref1"
            value={formData.ref1}
            onChange={handleChange}
            placeholder="请输入参考号一"
          />
          <Input
            label="IOSS号"
            name="ioss"
            value={formData.ioss}
            onChange={handleChange}
            placeholder="请输入IOSS号"
          />
          <Input
            label="EORI号"
            name="eori"
            value={formData.eori}
            onChange={handleChange}
            placeholder="请输入EORI号"
          />
          <Input
            label="国外运单号"
            name="trackingNumber"
            value={formData.trackingNumber}
            onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
            placeholder="请输入国外运单号"
          />
          <SearchableSelect
            label="申报币种"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            options={[
              { value: 'CNY', label: 'CNY' },
              { value: 'USD', label: 'USD' },
            ]}
            placeholder="选择币种"
          />
          <SearchableSelect
            label="品名分类"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={[
              { value: '电子产品', label: '电子产品' },
              { value: '服装', label: '服装' },
              { value: '食品', label: '食品' },
            ]}
            placeholder="选择品类"
          />
          <Input
            label="主品名"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            placeholder="请输入主品名"
          />
          <Input
            label="总体积 (m³)"
            name="volume"
            type="number"
            value={formData.volume}
            onChange={handleChange}
            step="0.0001"
            readOnly
            placeholder="总体积"
          />
          <Input
            label="材积重 (kg)"
            name="volumetricWeight"
            type="number"
            value={formData.volumetricWeight}
            onChange={handleChange}
            step="0.01"
            readOnly
            placeholder="材积重"
          />
          <Input
            label="计费重 (kg)"
            name="chargeWeight"
            type="number"
            value={formData.chargeWeight}
            onChange={handleChange}
            step="0.01"
            readOnly
            placeholder="计费重"
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">运单状态</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <MultiCheckbox
            label="物品属性"
            name="attrs"
            options={[
              '带电',
              '带磁',
              '危险品',
              '液体',
              '粉末',
              '膏体',
              '敏感货',
              '木制品',
              '纺织品',
            ]}
            value={formData.attrs}
            onChange={handleMultiCheckboxChange}
          />
          <Textarea label="备注" name="notes" value={formData.notes} onChange={handleChange} />
          <Radio
            label="是否保险"
            name="insurance"
            options={['是', '否']}
            value={formData.insurance ? '是' : '否'}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                insurance: e.target.value === '是',
              }))
            }
          />
        </div>
        <div className="flex justify-end mt-6 gap-4">
          <button type="submit" className="gradient-btn px-6 py-2 rounded-xl text-white">
            保存
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-600 px-6 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
