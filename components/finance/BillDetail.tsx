'use client';
import { useRouter } from 'next/navigation';

export function BillDetail({ bill }: { bill: any }) {
  const router = useRouter();

  return (
    <div className="p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-semibold">账单详情</h2>
      <div>账单编号：{bill.code}</div>
      <div>收件国家：{bill.country}</div>
      <div>总运费：{bill.freightCost} CNY</div>
      <div>附加费：{bill.extraFee} CNY</div>
      <div>总费用：{bill.totalCost} CNY</div>

      <div>
        <button
          className="text-blue-600 underline mt-4"
          onClick={() => router.push(`/channels/price-maintenance/${bill.channelId}`)}
        >
          查看/修改计算规则
        </button>
      </div>
    </div>
  );
}