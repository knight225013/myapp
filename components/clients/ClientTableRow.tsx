import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Phone } from 'lucide-react';
import ClientStatusBadge from './ClientStatusBadge';
import { Client } from '@/app/clients/page';

interface ClientTableRowProps {
  client: Client;
  onRefresh: () => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

export default function ClientTableRow({ client, onRefresh, onEdit, onDelete }: ClientTableRowProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleEdit = () => {
    onEdit(client);
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete(client.id);
    setShowMenu(false);
  };

  const handleCall = () => {
    if (client.phoneNumber && client.phoneNumber !== 'N/A') {
      window.open(`tel:${client.phoneNumber}`);
    }
    setShowMenu(false);
  };

  // Generate avatar from company name
  const getAvatarText = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-gray-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <input type="checkbox" className="rounded border-gray-300" />
      </td>
      
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-gray-900">
          #{client.id.slice(0, 8)}
        </span>
      </td>
      
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600">
          {client.createdDate}
        </span>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(client.companyName)}`}>
            {getAvatarText(client.companyName)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {client.companyName}
            </div>
            <div className="text-sm text-gray-500">
              {client.contactName}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          FULLTIME
        </span>
      </td>
      
      <td className="px-6 py-4">
        <span className="text-sm text-gray-900">
          {client.position}
        </span>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-900">
            {client.phoneNumber}
          </span>
          {client.phoneNumber && client.phoneNumber !== 'N/A' && (
            <button
              onClick={handleCall}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <ClientStatusBadge status={client.status} />
      </td>
      
      <td className="px-6 py-4">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
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
                  disabled={!client.phoneNumber || client.phoneNumber === 'N/A'}
                >
                  <Phone className="w-4 h-4" />
                  拨打电话
                </button>
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