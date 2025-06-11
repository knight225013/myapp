import { useEffect, useState } from 'react';

export interface LogEntry {
  id: string;
  status: string;
  remark?: string;
  timestamp: string;
  location?: string;
}

export default function TrackingTimeline({ shipmentId }: { shipmentId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const fetchLogs = async () => {
    if (!shipmentId) return;
    try {
      const res = await fetch(`http://localhost:4000/api/waybills/${shipmentId}/logs`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      } else {
        console.error('获取物流轨迹失败:', data.error);
      }
    } catch (error) {
      console.error('获取物流轨迹失败:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [shipmentId]);

  const handleRefresh = async () => {
    try {
      const orderRes = await fetch(`http://localhost:4000/api/waybills/${shipmentId}?type=FBA`);
      const orderData = await orderRes.json();
      if (!orderData.success || !orderData.data.trackingNumber) {
        alert('❌ 无有效运单号');
        return;
      }

      const res = await fetch(`http://localhost:4000/api/track/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: orderData.data.trackingNumber }),
      });
      const result = await res.json();
      if (result.success) {
        alert('✅ 更新成功');
        await fetchLogs(); // 刷新轨迹
      } else {
        alert('❌ 更新失败: ' + result.error);
      }
    } catch (error) {
      alert('❌ 更新失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold mb-2">📦 物流轨迹</h3>
        <button onClick={handleRefresh} className="text-sm text-blue-600 underline">
          ⟳ 刷新物流轨迹
        </button>
      </div>
      <ol className="relative border-l border-gray-300 ml-4">
        {logs.length === 0 ? (
          <li className="mb-5 ml-3">
            <span className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5 top-1" />
            <div className="text-sm text-gray-500">暂无轨迹记录</div>
          </li>
        ) : (
          logs.map((log) => (
            <li key={log.id} className="mb-5 ml-3">
              <span className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5 top-1" />
              <div className="text-sm font-medium text-gray-800">{log.status}</div>
              <div className="text-xs text-gray-500">
                {new Date(log.timestamp).toLocaleString()}
              </div>
              {log.location && (
                <div className="text-sm text-gray-600 mt-1">地点: {log.location}</div>
              )}
              {log.remark && <div className="text-sm text-gray-600 mt-1">{log.remark}</div>}
            </li>
          ))
        )}
      </ol>
    </div>
  );
}
