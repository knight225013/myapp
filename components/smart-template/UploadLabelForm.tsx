'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Channel {
  id: string;
  name: string;
}

interface UploadLabelFormProps {
  channelId: string;
  channels: Channel[];
  onChangeChannelId: (id: string) => void;
  onUpload: (data: Record<string, any>) => Promise<void>;
}

export default function UploadLabelForm({ channelId, channels, onChangeChannelId, onUpload }: UploadLabelFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ 提交 PDF 并携带 channelId
  const handleUpload = async () => {
    if (!file || !channelId) {
      alert('请选择渠道和 PDF 文件');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('channelId', channelId);

    setLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/upload-label', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        const payload = result.parsedData;
        if (payload) {
          // ✅ 携带初始数据跳转到多步骤表单
          router.push(`/waybill/create?initialData=${encodeURIComponent(JSON.stringify(payload))}`);
        } else {
          alert('✅ 上传成功，未返回初始数据');
        }
      } else {
        alert('❌ 上传失败：' + result.error);
      }
    } catch (err: any) {
      alert('❌ 请求失败：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow space-y-3 w-full max-w-md bg-white">
      <h2 className="text-lg font-semibold">📤 上传标签 PDF</h2>

      <select
        value={channelId}
        onChange={(e) => onChangeChannelId(e.target.value)}
        className="border rounded-md px-3 py-2 w-full"
      >
        <option value="">请选择渠道</option>
        {channels.map((ch) => (
          <option key={ch.id} value={ch.id}>
            {ch.name}
          </option>
        ))}
      </select>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border rounded-md px-3 py-2 w-full"
      />

      <button
        onClick={handleUpload}
        disabled={!file || !channelId || loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded w-full"
      >
        {loading ? '创建中...' : '上传标签'}
      </button>
    </div>
  );
}
