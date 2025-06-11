'use client';
import Link from 'next/link';

interface PriceListTableProps {
  prices: any[];
}

export function PriceListTable({ prices }: PriceListTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>名称</th>
          <th>区域</th>
          <th>服务</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {prices.map((price) => (
          <tr key={price.id}>
            <td>{price.name}</td>
            <td>{price.region}</td>
            <td>{price.service}</td>
            <td>
              <Link href={`/channels/price-maintenance/${price.id}`}>详情</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
