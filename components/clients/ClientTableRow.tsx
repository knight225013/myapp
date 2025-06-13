import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Phone } from 'lucide-react';
import ClientStatusBadge from './ClientStatusBadge';
import { Client } from '@/app/clients/page';

interface ClientTableRowProps {
  client: Client;
  onRefresh: () => void;
}

export default function ClientTableRow({ client, onRefresh }: ClientTableRowProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit client:', client.id);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (confirm('确定要删除此客户吗？')) {
      try {
        const response = await fetch(`/api/clients/${client.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          onRefresh();
        }
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
    setShowMenu(false);
  };

  const handleCall = () => {
    window.location.href = `tel:${client.phoneNumber}`;
    setShowMenu(false);
  };

  // Get company logo based on company name
  const getCompanyLogo = (companyName: string) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-green-500', 'bg-pink-500'];
    const colorIndex = companyName.charCodeAt(0) % colors.length;
    const initial = companyName.charAt(0).toUpperCase();
    
    return (
      <div className={`w-10 h-10 rounded-lg ${colors[colorIndex]} flex items-center justify-center text-white font-semibold`}>
        {initial}
      </div>
    );
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <input type="checkbox" className="rounded border-gray-300" />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {client.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {client.createdDate}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {getCompanyLogo(client.companyName)}
          <span className="text-sm font-medium text-gray-900">{client.companyName}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        FULLTIME
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {client.position}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{client.phoneNumber}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <ClientStatusBadge status={client.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  编辑
                </button>
                <button
                  onClick={handleCall}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  拨打电话
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
} 