'use client';

import { CheckCircle, Truck, XCircle, RotateCcw, Package, Box } from 'lucide-react';
import { Shipment } from '@/types/shipment';

export default function ShipmentTable({
  data,
  currentPage,
  total,
  onPageChange,
  onSelectShipment,
  onEdit,
  statusCounts,
  selectedRows,
  setSelectedRows,
}: {
  data: Shipment[];
  currentPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onSelectShipment: (shipment: Shipment) => void;
  onEdit: (shipment: Shipment) => void;
  statusCounts: Record<string, number>;
  selectedRows: string[];
  setSelectedRows: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const limit = 30; // 与 WaybillPage 保持一致

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(data.map((s) => s.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const handleDownloadLabels = async () => {
    if (selectedRows.length === 0) {
      alert('请至少选择一个运单');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/templates/download-labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRows }),
      });

      if (!res.ok) throw new Error('下载失败');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'labels.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('下载失败：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  return (
    <section className="glass rounded-3xl shadow-xl p-8 mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
        <div className="flex flex-wrap gap-4">
          <button
            className="status-btn flex items-center px-6 py-2 rounded-xl shadow-md border border-gray-200 transform hover:scale-105 active:scale-95 transition-all duration-150"
            onClick={handleDownloadLabels}
          >
            下载标签
          </button>
          <button className="status-btn flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl shadow-md border border-gray-200 transition hover-glow whitespace-nowrap">
            打印报表
          </button>
          <button className="status-btn flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl shadow-md border border-gray-200 transition hover-gray-300 whitespace-nowrap">
            导出
          </button>
          <button className="status-btn flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-xl shadow-md border-yellow-200 transition hover-glow whitespace-nowrap">
            拦截/问题件
          </button>
          <button className="status-btn flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl shadow-md border-blue-200 transition hover-glow whitespace-nowrap">
            预约取件
          </button>
          <button className="status-btn flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl shadow-md border-blue-200 transition hover-glow whitespace-nowrap">
            刷新路由
          </button>
          <button className="status-btn flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl shadow-md border border-gray-200 transition hover-glow whitespace-nowrap">
            查看统计
          </button>
          <button className="status-btn flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl shadow-md border-red-200 transition hover-glow whitespace-nowrap">
            取消
          </button>
        </div>
      </div>
      <table className="w-full text-sm text-center">
        <thead className="bg-gray-100 text-gray-700">
          <tr className="h-20">
            <th className="p-6 text-center">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedRows.length === data.length && data.length > 0}
              />
            </th>
            <th className="p-6 text-center font-medium cursor-pointer">运单号</th>
            <th className="p-6 text-center font-medium cursor-pointer">渠道</th>
            <th className="p-6 text-center font-medium cursor-pointer">收件人</th>
            <th className="p-6 text-center font-medium cursor-pointer">国家</th>
            <th className="p-6 text-center font-medium cursor-pointer">件数</th>
            <th className="p-6 text-center font-medium cursor-pointer">重量</th>
            <th className="p-6 text-center font-medium cursor-pointer">材积重</th>
            <th className="p-6 text-center font-medium cursor-pointer">计费重</th>
            <th className="p-6 text-center font-medium cursor-pointer">状态</th>
            <th className="p-6 text-center font-medium">操作</th>
            <th className="p-6 text-center font-medium cursor-pointer">下单日期</th>
          </tr>
        </thead>
        <tbody>
          {data.map((shipment) => (
            <tr
              key={shipment.id}
              className="h-20 hover:bg-indigo-50 transition-all duration-200 cursor-pointer"
            >
              <td className="p-6 text-center">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(shipment.id)}
                  onChange={() => handleRowSelect(shipment.id)}
                />
              </td>
              <td className="p-6 text-center">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectShipment(shipment);
                  }}
                  className="text-indigo-700 hover:underline font-medium"
                >
                  {shipment.id}
                </a>
              </td>
              <td className="p-6 text-center">{shipment.channel?.name || '未知渠道'}</td>
              <td className="p-6 text-center">{shipment.recipient}</td>
              <td className="p-6 text-center">{shipment.country}</td>
              <td className="p-6 text-center">{shipment.quantity}</td>
              <td className="p-6 text-center">{shipment.weight?.toFixed(2)}</td>
              <td className="p-6 text-center">{shipment.volumetricWeight?.toFixed(2) || '--'}</td>
              <td className="p-6 text-center">{shipment.chargeWeight?.toFixed(2) || '--'}</td>
              <td className="p-6 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                    shipment.status === '已签收'
                      ? 'bg-gradient-to-r from-green-200 to-green-400 text-green-700'
                      : shipment.status === '转运中'
                        ? 'bg-gradient-to-r from-blue-200 to-blue-400 text-blue-700'
                        : shipment.status === '已取消'
                          ? 'bg-gradient-to-r from-red-200 to-red-400 text-red-700'
                          : shipment.status === '退件'
                            ? 'bg-gradient-to-r from-gray-200 to-gray-400 text-gray-700'
                            : shipment.status === '已下单'
                              ? 'bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-700'
                              : shipment.status === '已收货'
                                ? 'bg-gradient-to-r from-purple-200 to-purple-400 text-purple-700'
                                : 'text-gray-700'
                  }`}
                >
                  {shipment.status || '无轨迹'}
                </span>
                {shipment.logs?.[0]?.timestamp && (
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(shipment.logs[0].timestamp).toLocaleString()}
                  </div>
                )}
              </td>
              <td className="p-6 text-center">
                <button
                  className="text-indigo-700 hover:text-indigo-600 transition font-medium"
                  onClick={() => onEdit(shipment)}
                >
                  编辑
                </button>
              </td>
              <td className="p-6 text-center">{shipment.createdAt || '--'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
