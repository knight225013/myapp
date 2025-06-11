import { BulkPriceImportTable } from '@/components/finance/BulkPriceImportTable';

export default function BulkImport({ params }: { params: { priceId: string } }) {
  return (
    <div>
      <h1>批量导入运价</h1>
      <BulkPriceImportTable priceId={params.priceId} />
    </div>
  );
}
