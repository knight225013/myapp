'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface SalesRep {
  id: string;
  name: string;
  email: string;
}

interface SalesRepSelectorProps {
  currentRepId?: string;
  onSelect: (repId: string) => void;
  onCancel: () => void;
}

export default function SalesRepSelector({ currentRepId, onSelect, onCancel }: SalesRepSelectorProps) {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [selectedRepId, setSelectedRepId] = useState(currentRepId || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesReps();
  }, []);

  const fetchSalesReps = async () => {
    try {
      const response = await fetch('/api/sales-reps');
      const result = await response.json();
      if (result.success) {
        setSalesReps(result.data);
      } else {
        // 如果API失败，使用模拟数据
        const mockReps: SalesRep[] = [
          { id: '1', name: '张三', email: 'zhangsan@example.com' },
          { id: '2', name: '李四', email: 'lisi@example.com' },
          { id: '3', name: '王五', email: 'wangwu@example.com' },
          { id: '4', name: '赵六', email: 'zhaoliu@example.com' },
        ];
        setSalesReps(mockReps);
      }
    } catch (error) {
      console.error('Failed to fetch sales reps:', error);
      // 如果请求失败，使用模拟数据
      const mockReps: SalesRep[] = [
        { id: '1', name: '张三', email: 'zhangsan@example.com' },
        { id: '2', name: '李四', email: 'lisi@example.com' },
        { id: '3', name: '王五', email: 'wangwu@example.com' },
        { id: '4', name: '赵六', email: 'zhaoliu@example.com' },
      ];
      setSalesReps(mockReps);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedRepId);
  };

  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 min-w-64">
      <h4 className="text-sm font-medium text-gray-900 mb-3">选择销售代表</h4>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
          <input
            type="radio"
            name="salesRep"
            value=""
            checked={selectedRepId === ''}
            onChange={(e) => setSelectedRepId(e.target.value)}
            className="text-blue-600"
          />
          <span className="text-sm text-gray-600">未分配</span>
        </label>
        
        {salesReps.map((rep) => (
          <label key={rep.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="radio"
              name="salesRep"
              value={rep.id}
              checked={selectedRepId === rep.id}
              onChange={(e) => setSelectedRepId(e.target.value)}
              className="text-blue-600"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{rep.name}</div>
              <div className="text-xs text-gray-500">{rep.email}</div>
            </div>
          </label>
        ))}
      </div>
      
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={handleConfirm}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          <Check className="w-4 h-4" />
          确认
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
          取消
        </button>
      </div>
    </div>
  );
} 