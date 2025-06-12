'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PriceDetailHeader } from '@/components/finance/PriceDetailHeader';

export default function ImportPage() {
  const { priceId } = useParams();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [price, setPrice] = useState<any>(null);

  useEffect(() => {
    fetchPrice();
  }, [priceId]);

  const fetchPrice = async () => {
    const res = await fetch(`/api/finance/prices/${priceId}`);
    if (res.ok) {
      const data = await res.json();
      setPrice(data.data);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`/api/finance/prices/${priceId}/import`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      router.push(`/channels/price-maintenance/${priceId}`);
    }
  };

  if (!price) return <div>加载中...</div>;

  return (
    <div className="container mx-auto p-4">
      <PriceDetailHeader price={price} />
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">批量导入设置</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">选择 Excel 文件</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!file}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              上传
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="border px-4 py-2 rounded"
            >
              返回
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
