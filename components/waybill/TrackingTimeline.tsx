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
  const [shipmentDetails, setShipmentDetails] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newRemark, setNewRemark] = useState('');
  const [isAddingLog, setIsAddingLog] = useState(false);

  const statusOptions = [
    '已下单',
    '已收货',
    '转运中',
    '已到达',
    '派送中',
    '已签收',
    '异常',
    '退件'
  ];

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/waybills/${shipmentId}/logs`, {
          cache: 'no-store'
        });
        const { success, data, error } = await res.json();
        if (!success) throw new Error(error);
        setLogs(data);
      } catch (error) {
        console.error('获取物流轨迹失败:', error);
      }
    };

    const fetchShipmentDetails = async () => {
      try {
        const orderRes = await fetch(`/api/waybills/${shipmentId}?type=FBA`);
        const { success, data, error } = await orderRes.json();
        if (!success) throw new Error(error);
        setShipmentDetails(data);
      } catch (error) {
        console.error('获取运单详情失败:', error);
      }
    };

    fetchLogs();
    fetchShipmentDetails();
  }, [shipmentId]);

  const handleUpdateTracking = async () => {
    if (!newStatus.trim()) {
      alert('请选择状态');
      return;
    }

    try {
      const res = await fetch(`/api/waybills/${shipmentId}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          remark: newRemark || `${newStatus}${newLocation ? ` - ${newLocation}` : ''}`,
        }),
      });

      const { success, data, error } = await res.json();
      if (!success) throw new Error(error);

      // 刷新轨迹数据
      const logsRes = await fetch(`/api/waybills/${shipmentId}/logs`, {
        cache: 'no-store'
      });
      const logsData = await logsRes.json();
      if (logsData.success) {
        setLogs(logsData.data);
      }

      // 重置表单
      setNewStatus('');
      setNewLocation('');
      setNewRemark('');
      setIsAddingLog(false);
      
      alert('轨迹更新成功');
    } catch (error) {
      console.error('更新轨迹失败:', error);
      alert('更新轨迹失败: ' + error.message);
    }
  };

  const refreshLogs = async () => {
    try {
      const res = await fetch(`/api/waybills/${shipmentId}/logs`, {
        cache: 'no-store'
      });
      const { success, data, error } = await res.json();
      if (!success) throw new Error(error);
      setLogs(data);
      alert('轨迹刷新成功');
    } catch (error) {
      console.error('刷新轨迹失败:', error);
      alert('刷新轨迹失败');
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">📦 物流轨迹</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAddingLog(!isAddingLog)} 
            className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isAddingLog ? '取消' : '添加轨迹'}
          </button>
          <button 
            onClick={refreshLogs} 
            className="text-sm px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ⟳ 刷新
          </button>
        </div>
      </div>

      {isAddingLog && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择状态</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">地点（可选）</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="如：北京分拣中心"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">备注（可选）</label>
              <input
                type="text"
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="备注信息"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={handleUpdateTracking}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
            >
              添加轨迹
            </button>
          </div>
        </div>
      )}

      <ol className="relative border-l border-gray-300 ml-4">
        {logs.length === 0 ? (
          <li className="mb-5 ml-3">
            <span className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5 top-1" />
            <div className="text-sm text-gray-500">暂无轨迹记录</div>
          </li>
        ) : (
          logs.map((log, index) => (
            <li key={log.id} className="mb-5 ml-3">
              <span className={`absolute w-3 h-3 rounded-full -left-1.5 top-1 ${
                index === 0 ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              <div className="text-sm font-medium text-gray-800">{log.status}</div>
              <div className="text-xs text-gray-500">
                {new Date(log.timestamp).toLocaleString('zh-CN')}
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
