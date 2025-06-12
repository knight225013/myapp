export function PriceCard({ price }: { price: any }) {
  return (
    <div className="border p-4 rounded shadow">
      <h2 className="text-lg font-bold">{price.name}</h2>
      <p>币种：{price.currency}</p>
      <p>渠道 ID：{price.channelId}</p>
      <p>创建时间：{new Date(price.createdAt).toLocaleString()}</p>
    </div>
  );
} 