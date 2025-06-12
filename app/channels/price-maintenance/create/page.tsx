'use client';
import { useRouter } from 'next/navigation';
import { PriceForm } from '@/components/price/Form';

export default function CreatePricePage() {
  const router = useRouter();

  const handleSubmit = async (formData: any) => {
    const res = await fetch('/api/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const result = await res.json();
      router.push(`/channels/price-maintenance/${result.id}`);
    } else {
      alert('提交失败');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">创建运价方案</h1>
      <PriceForm onSubmit={handleSubmit} />
    </div>
  );
}
