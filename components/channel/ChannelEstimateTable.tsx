'use client';
import { useState } from 'react';

interface Estimate {
  channelId: string;
  channelName: string;
  currency: string;
  chargeWeight: number;
  base: number;
  tax: number;
  extraFee: number;
  otherFee: number;
  total: number;
}

interface ChannelEstimateTableProps {
  results: Estimate[];
  onChange: (params: {
    length: number;
    width: number;
    height: number;
    weight: number;
    country?: string;
    warehouse?: string;
    origin?: string;
  }) => void;
}

export default function ChannelEstimateTable({ results, onChange }: ChannelEstimateTableProps) {
  const [params, setParams] = useState({
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    country: '',
    warehouse: '',
    origin: '',
  });

  const handleChange = () => {
    onChange({
      length: parseFloat(params.length.toString()),
      width: parseFloat(params.width.toString()),
      height: parseFloat(params.height.toString()),
      weight: parseFloat(params.weight.toString()),
      country: params.country || undefined,
      warehouse: params.warehouse || undefined,
      origin: params.origin || undefined,
    });
  };

  return (
    <div className="glass rounded-3xl shadow-xl p-8 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">费用模拟器</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input
          type="number"
          className="w-full p-2 border rounded"
          placeholder="长度 (cm)"
          value={params.length}
          onChange={(e) => setParams({ ...params, length: parseFloat(e.target.value) || 0 })}
          onBlur={handleChange}
        />
        <input
          type="number"
          className="w-full p-2 border rounded"
          placeholder="宽度 (cm)"
          value={params.width}
          onChange={(e) => setParams({ ...params, width: parseFloat(e.target.value) || 0 })}
          onBlur={handleChange}
        />
        <input
          type="number"
          className="w-full p-2 border rounded"
          placeholder="高度 (cm)"
          value={params.height}
          onChange={(e) => setParams({ ...params, height: parseFloat(e.target.value) || 0 })}
          onBlur={handleChange}
        />
        <input
          type="number"
          className="w-full p-2 border rounded"
          placeholder="重量 (kg)"
          value={params.weight}
          onChange={(e) => setParams({ ...params, weight: parseFloat(e.target.value) || 0 })}
          onBlur={handleChange}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="国家"
          value={params.country}
          onChange={(e) => setParams({ ...params, country: e.target.value })}
          onBlur={handleChange}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="仓库"
          value={params.warehouse}
          onChange={(e) => setParams({ ...params, warehouse: e.target.value })}
          onBlur={handleChange}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="发件地"
          value={params.origin}
          onChange={(e) => setParams({ ...params, origin: e.target.value })}
          onBlur={handleChange}
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">费用估算结果</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">渠道</th>
              <th className="px-6 py-3">总费用</th>
              <th className="px-6 py-3">运费</th>
              <th className="px-6 py-3">税费</th>
              <th className="px-6 py-3">附加费</th>
              <th className="px-6 py-3">其他费用</th>
              <th className="px-6 py-3">币种</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  请输入参数以估算费用
                </td>
              </tr>
            ) : (
              results.map((result) => (
                <tr key={result.channelId} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{result.channelName}</td>
                  <td className="px-6 py-4">{result.total.toFixed(2)}</td>
                  <td className="px-6 py-4">{result.base.toFixed(2)}</td>
                  <td className="px-6 py-4">{result.tax.toFixed(2)}</td>
                  <td className="px-6 py-4">{result.extraFee.toFixed(2)}</td>
                  <td className="px-6 py-4">{result.otherFee.toFixed(2)}</td>
                  <td className="px-6 py-4">{result.currency}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
