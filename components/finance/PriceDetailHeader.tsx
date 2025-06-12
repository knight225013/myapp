export function PriceDetailHeader({ price }: { price: any }) {
  return (
    <div className="mb-4 border-b pb-2">
      <h1 className="text-2xl font-bold">{price.name}</h1>
      <p className="text-sm text-gray-600">币种：{price.currency} ｜ 渠道：{price.channelId}</p>
    </div>
  );
}
