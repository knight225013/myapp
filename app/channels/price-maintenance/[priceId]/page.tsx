import { PriceDetailHeader } from '@/components/finance/PriceDetailHeader';
import { PriceSettingList } from '@/components/finance/PriceSettingList';
import Link from 'next/link';

export default async function PriceDetail({ params }: { params: { priceId: string } }) {
  const [priceRes, settingsRes] = await Promise.all([
    fetch(`/api/finance/prices/${params.priceId}`, { cache: 'no-store' }),
    fetch(`/api/finance/prices/${params.priceId}/settings`, { cache: 'no-store' }),
  ]);
  if (!priceRes.ok || !settingsRes.ok) throw new Error('Failed to fetch price or settings');
  const price = await priceRes.json();
  const settings = await settingsRes.json();
  return (
    <div>
      <PriceDetailHeader price={price} />
      <PriceSettingList settings={settings} />
      <Link href={`/channels/price-maintenance/${params.priceId}/import`}>批量导入</Link>
    </div>
  );
}
