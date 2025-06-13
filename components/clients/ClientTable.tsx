import React from 'react';
import ClientTableRow from './ClientTableRow';
import { Client } from '@/app/clients/page';

interface ClientTableProps {
  clients: Client[];
  onRefresh: () => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

export default function ClientTable({ clients, onRefresh, onEdit, onDelete }: ClientTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-6 py-4 text-left">
              <input type="checkbox" className="rounded border-gray-300" />
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              客户编号
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              申请日期
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              公司名称
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              类型
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              职位
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              联系方式
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              状态
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <ClientTableRow 
              key={client.id} 
              client={client} 
              onRefresh={onRefresh}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
      
      {clients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无客户数据</p>
        </div>
      )}
    </div>
  );
} 