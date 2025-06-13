import React from 'react';
import ClientTableRow from './ClientTableRow';
import { Client } from '@/app/clients/page';

interface ClientTableProps {
  clients: Client[];
  onRefresh: () => void;
}

export default function ClientTable({ clients, onRefresh }: ClientTableProps) {
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
              联系人
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
          {clients.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                暂无客户数据
              </td>
            </tr>
          ) : (
            clients.map((client) => (
              <ClientTableRow
                key={client.id}
                client={client}
                onRefresh={onRefresh}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 