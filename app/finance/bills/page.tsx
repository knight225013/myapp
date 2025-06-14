'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BillListPage() {
  const [bills, setBills] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    const res = await fetch('/api/finance/bills');
    if (res.ok) {
      const data = await res.json();
      setBills(data.data);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">账单列表</h1>
      <table className="min-w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">账单号</th>
            <th className="px-4 py-2">渠道</th>
            <th className="px-4 py-2">运费</th>
            <th className="px-4 py-2">附加费</th>
            <th className="px-4 py-2">状态</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill: any) => (
            <tr
              key={bill.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/finance/bills/${bill.id}`)}
            >
              <td className="px-4 py-2">{bill.code}</td>
              <td className="px-4 py-2">{bill.channelName}</td>
              <td className="px-4 py-2">{bill.freightCost}</td>
              <td className="px-4 py-2">{bill.extraFee}</td>
              <td className="px-4 py-2">{bill.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}