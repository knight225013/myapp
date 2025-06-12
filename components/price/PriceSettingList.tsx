'use client';
import { useState } from 'react';
import { PriceSettingForm } from './PriceSettingForm';

export function PriceSettingList({ settings }: { settings: any[] }) {
  const [list, setList] = useState(settings);

  const handleAdd = async (data: any) => {
    const res = await fetch('/api/finance/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const newSetting = await res.json();
      setList((prev) => [...prev, newSetting]);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">附加设置</h2>
      <div className="space-y-2">
        {list.map((s) => (
          <div key={s.id} className="border p-2 rounded">
            {s.name}：{s.value} {s.unit || ''}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <PriceSettingForm onSubmit={handleAdd} />
      </div>
    </div>
  );
} 