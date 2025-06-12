'use client';
import { useEffect, useState } from 'react';
import { PriceCard } from '@/components/price/PriceCard';
import { PriceForm } from '@/components/price/Form';
import { useRouter } from 'next/navigation';

export default function PriceMaintenancePage() {
  const [prices, setPrices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    const res = await fetch('/api/finance/prices');
    if (res.ok) {
      const data = await res.json();
      setPrices(data.data);
    }
  };

  const handleSubmit = async (data: any) => {
    const res = await fetch('/api/finance/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setShowForm(false);
      fetchPrices();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">价格维护</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm ? '取消' : '新建价格方案'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <PriceForm onSubmit={handleSubmit} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prices.map((price: any) => (
          <div key={price.id} onClick={() => router.push(`/channels/price-maintenance/${price.id}`)}>
            <PriceCard price={price} />
          </div>
        ))}
      </div>
    </div>
  );
}
