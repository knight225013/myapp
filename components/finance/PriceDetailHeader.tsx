interface PriceDetailHeaderProps {
  price: any;
}

export function PriceDetailHeader({ price }: PriceDetailHeaderProps) {
  return (
    <div>
      <h2>{price.name}</h2>
      <p>区域: {price.region}</p>
      <p>服务: {price.service}</p>
      <p>币种: {price.currency}</p>
    </div>
  );
}
