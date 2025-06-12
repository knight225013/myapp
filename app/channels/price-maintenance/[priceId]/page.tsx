'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PriceDetailHeader } from '@/components/finance/PriceDetailHeader';
import { PriceSettingList } from '@/components/price/PriceSettingList';
import Link from 'next/link';

export default function PriceDetailPage() {
  const { priceId } = useParams();
  const [price, setPrice] = useState<any>(null);
  const [settings, setSettings] = useState([]);

  useEffect(() => {
    fetchPrice();
    fetchSettings();
  }, [priceId]);

  const fetchPrice = async () => {
    const res = await fetch(`/api/finance/prices/${priceId}`);
    if (res.ok) {
      const data = await res.json();
      setPrice(data.data);
    }
  };

  const fetchSettings = async () => {
    const res = await fetch(`/api/finance/prices/${priceId}/settings`);
    if (res.ok) {
      const data = await res.json();
      setSettings(data.data);
    }
  };

  if (!price) return <div>加载中...</div>;

  return (
    <div className="container mx-auto p-4">
      <PriceDetailHeader price={price} />
      <PriceSettingList settings={settings} />
      <Link href={`/channels/price-maintenance/${priceId}/import`}>批量导入</Link>
    </div>
  );
}
