'use client';
import { useState, useEffect } from 'react';
import { Channel } from '@/types/shipment';

export function PriceForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({ name: '', channelId: '', currency: 'CNY' });
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/channels', { cache: 'no-store' });
      if (!res.ok) throw new Error('获取渠道失败');
      const data = await res.json();
      if (!data.success) throw new Error('获取渠道数据失败');
      setChannels(data.data);
    } catch (error) {
      console.error('获取渠道列表失败:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // 当选择渠道时，更新选中的渠道信息
    if (name === 'channelId') {
      const channel = channels.find((c) => c.id === value);
      setSelectedChannel(channel || null);
      // 如果渠道有默认币种，则更新表单的币种
      if (channel?.currency) {
        setForm((prev) => ({ ...prev, currency: channel.currency }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">价格名称</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1">渠道</label>
          <select
            name="channelId"
            value={form.channelId}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">请选择渠道</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">币种</label>
          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="CNY">CNY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          提交
        </button>
      </form>

      {selectedChannel && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">渠道信息</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">渠道类型：</span>
              {selectedChannel.type}
            </p>
            {selectedChannel.country && (
              <p>
                <span className="font-medium">国家：</span>
                {selectedChannel.country}
              </p>
            )}
            {selectedChannel.warehouse && (
              <p>
                <span className="font-medium">仓库：</span>
                {selectedChannel.warehouse}
              </p>
            )}
            {selectedChannel.origin && (
              <p>
                <span className="font-medium">起始地：</span>
                {selectedChannel.origin}
              </p>
            )}
            <p>
              <span className="font-medium">币种：</span>
              {selectedChannel.currency}
            </p>
            {selectedChannel.chargeMethod && (
              <p>
                <span className="font-medium">计费方式：</span>
                {selectedChannel.chargeMethod}
              </p>
            )}
            {selectedChannel.minCharge && (
              <p>
                <span className="font-medium">最低收费：</span>
                {selectedChannel.minCharge} {selectedChannel.currency}
              </p>
            )}
            {selectedChannel.volRatio && (
              <p>
                <span className="font-medium">体积比率：</span>
                {selectedChannel.volRatio}
              </p>
            )}
            {selectedChannel.cubeRatio && (
              <p>
                <span className="font-medium">立方比率：</span>
                {selectedChannel.cubeRatio}
              </p>
            )}
            {selectedChannel.splitRatio && (
              <p>
                <span className="font-medium">分割比率：</span>
                {selectedChannel.splitRatio}
              </p>
            )}
            {selectedChannel.minBoxRealWeight && selectedChannel.maxBoxRealWeight && (
              <p>
                <span className="font-medium">重量范围：</span>
                {selectedChannel.minBoxRealWeight} - {selectedChannel.maxBoxRealWeight} kg
              </p>
            )}
            {selectedChannel.extraFeeRules && selectedChannel.extraFeeRules.length > 0 && (
              <div>
                <p className="font-medium mb-1">附加费用：</p>
                <ul className="list-disc list-inside">
                  {selectedChannel.extraFeeRules.map((rule, index) => (
                    <li key={index}>
                      {rule.name}：{rule.value} {selectedChannel.currency}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
