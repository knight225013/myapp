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
  onDelete,
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
  onDelete?: (shipment: Shipment) => void;
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
      alert('请选择要下载的运单');
      return;
    }

    try {
      const res = await fetch('/api/templates/download-labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipmentIds: selectedRows,
        }),
      });

      const result: any = await res.json();
      if (!result.success) throw new Error(result.error);
      const { data } = result;

      // 处理下载
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('下载面单失败:', error);
      alert('下载面单失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRows.length === 0) {
      alert('请选择要删除的运单');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedRows.length} 个运单吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const deletePromises = selectedRows.map(id => 
        fetch(`/api/waybills/${id}`, { method: 'DELETE' })
      );
      
      const results = await Promise.all(deletePromises);
      const failedDeletes = [];
      
      for (let i = 0; i < results.length; i++) {
        const result = await results[i].json();
        if (!result.success) {
          failedDeletes.push(selectedRows[i]);
        }
      }

      if (failedDeletes.length === 0) {
        alert('批量删除成功');
        setSelectedRows([]);
        // 触发数据刷新
        window.location.reload();
      } else {
        alert(`删除完成，但有 ${failedDeletes.length} 个运单删除失败`);
      }
    } catch (error) {
      console.error('批量删除失败:', error);
      // 错误信息可选处理
      const msg = error instanceof Error ? error.message : String(error);
      alert('批量删除失败: ' + msg);
    }
  };

  const handleSingleDelete = async (shipment: Shipment) => {
    if (!confirm(`确定要删除运单 ${shipment.id} 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/waybills/${shipment.id}`, { method: 'DELETE' });
      const data: any = await res.json();
      if (!data.success) throw new Error(data.error);
      
      alert('运单删除成功');
      if (onDelete) {
        onDelete(shipment);
      }
    } catch (error) {
      console.error('删除运单失败:', error);
      const msg = error instanceof Error ? error.message : String(error);
      alert('删除运单失败: ' + msg);
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
          <button 
            className="status-btn flex items-center px-6 py-2 rounded-xl shadow-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transform hover:scale-105 active:scale-95 transition-all duration-150"
            onClick={handleBatchDelete}
          >
            批量删除
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
                {(() => {
                  const statusToShow = shipment.logs?.[0]?.status || shipment.status;
                  const statusClass = statusToShow === '已签收'
                    ? 'bg-gradient-to-r from-green-200 to-green-400 text-green-700'
                    : statusToShow === '转运中'
                      ? 'bg-gradient-to-r from-blue-200 to-blue-400 text-blue-700'
                      : statusToShow === '已取消'
                        ? 'bg-gradient-to-r from-red-200 to-red-400 text-red-700'
                        : statusToShow === '退件'
                          ? 'bg-gradient-to-r from-gray-200 to-gray-400 text-gray-700'
                          : statusToShow === '已下单'
                            ? 'bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-700'
                            : statusToShow === '已收货'
                              ? 'bg-gradient-to-r from-purple-200 to-purple-400 text-purple-700'
                              : 'text-gray-700';
                  return (
                    <>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${statusClass}`}>
                        {statusToShow || '无轨迹'}
                      </span>
                      {shipment.logs?.[0]?.timestamp && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(shipment.logs[0].timestamp).toLocaleString()}
                        </div>
                      )}
                    </>
                  );
                })()}
              </td>
              <td className="p-6 text-center">
                <div className="flex justify-center gap-2">
                  <button
                    className="text-indigo-700 hover:text-indigo-600 transition font-medium"
                    onClick={() => onEdit(shipment)}
                  >
                    编辑
                  </button>
                  <button
                    className="text-red-600 hover:text-red-500 transition font-medium"
                    onClick={() => handleSingleDelete(shipment)}
                  >
                    删除
                  </button>
                </div>
              </td>
              <td className="p-6 text-center">{shipment.createdAt || '--'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
