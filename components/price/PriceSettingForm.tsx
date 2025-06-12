'use client';
import { useState } from 'react';

export function PriceSettingForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({ name: '', unit: '', value: 0, priceId: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, value: parseFloat(form.value as any) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        name="name"
        placeholder="设置名称"
        onChange={handleChange}
        value={form.name}
        className="border px-3 py-2 rounded w-full"
      />
      <input
        name="unit"
        placeholder="单位（可选）"
        onChange={handleChange}
        value={form.unit}
        className="border px-3 py-2 rounded w-full"
      />
      <input
        name="value"
        placeholder="数值"
        type="number"
        onChange={handleChange}
        value={form.value}
        className="border px-3 py-2 rounded w-full"
      />
      <input
        name="priceId"
        placeholder="所属价格 ID"
        onChange={handleChange}
        value={form.priceId}
        className="border px-3 py-2 rounded w-full"
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">添加</button>
    </form>
  );
} 