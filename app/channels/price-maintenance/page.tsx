import { PriceListTable } from '@/components/finance/PriceListTable';

export default async function PriceMaintenance() {
  const res = await fetch('/api/finance/prices', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch prices');
  const prices = await res.json();
  return (
    <div>
      <h1>运价维护</h1>
      <PriceListTable prices={prices} />
    </div>
  );
}
