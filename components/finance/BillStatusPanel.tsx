'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const statuses = [
  { id: 'draft', label: '草稿', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
  { id: 'audited', label: '已审核', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  { id: 'issued', label: '已开票', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  { id: 'settled', label: '已结算', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
  { id: 'void', label: '已作废', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
];

export default function BillStatusPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'draft';

  const handleStatusClick = (status: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('status', status);
    router.push(`/finance?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-wrap gap-3">
        {statuses.map((status) => (
          <button
            key={status.id}
            onClick={() => handleStatusClick(status.id)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${status.color}
              ${currentStatus === status.id 
                ? 'ring-2 ring-blue-500 ring-offset-2 shadow-md transform scale-105' 
                : 'hover:shadow-sm'
              }
            `}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
} 