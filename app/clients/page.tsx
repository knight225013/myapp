'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import ClientTable from '@/components/clients/ClientTable';
import ClientFilterTabs from '@/components/clients/ClientFilterTabs';
import Pagination from '@/components/clients/Pagination';

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  phoneNumber: string;
  position: string;
  status: 'active' | 'frozen' | 'blacklisted';
  createdDate: string;
  email?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'frozen' | 'blacklisted'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch clients data
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      if (data.success) {
        setClients(data.data);
        setFilteredClients(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      // Use sample data for now
      const sampleData: Client[] = [
        {
          id: '#00012456',
          companyName: 'Bubbles Studios',
          contactName: 'Franklin Jr',
          phoneNumber: '012 312345 441',
          position: 'UI Designer',
          status: 'active',
          createdDate: 'Nov 28th 2020 09:21 AM'
        },
        {
          id: '#00012455',
          companyName: 'Kelon Team',
          contactName: 'John Smith',
          phoneNumber: '012 312345 441',
          position: 'UI Researcher',
          status: 'frozen',
          createdDate: 'Nov 28th 2020 09:21 AM'
        },
        {
          id: '#00012454',
          companyName: 'Kripton Inc.',
          contactName: 'Sarah Johnson',
          phoneNumber: '012 312345 441',
          position: 'UI Researcher',
          status: 'blacklisted',
          createdDate: 'Nov 28th 2020 09:21 AM'
        },
        {
          id: '#00012453',
          companyName: 'Bubbles Studios',
          contactName: 'Mike Davis',
          phoneNumber: '012 312345 441',
          position: 'UI Designer',
          status: 'active',
          createdDate: 'Nov 28th 2020 09:21 AM'
        },
        {
          id: '#00012452',
          companyName: 'Kelon Team',
          contactName: 'Emma Wilson',
          phoneNumber: '012 312345 441',
          position: 'UI Researcher',
          status: 'frozen',
          createdDate: 'Nov 28th 2020 09:21 AM'
        },
        {
          id: '#00012451',
          companyName: 'Tech Solutions Ltd',
          contactName: 'David Chen',
          phoneNumber: '012 312345 442',
          position: 'Manager',
          status: 'active',
          createdDate: 'Nov 27th 2020 03:15 PM'
        },
        {
          id: '#00012450',
          companyName: 'Global Logistics Co',
          contactName: 'Lisa Wang',
          phoneNumber: '012 312345 443',
          position: 'Director',
          status: 'active',
          createdDate: 'Nov 27th 2020 02:30 PM'
        },
        {
          id: '#00012449',
          companyName: 'Express Shipping Inc',
          contactName: 'Tom Brown',
          phoneNumber: '012 312345 444',
          position: 'Coordinator',
          status: 'frozen',
          createdDate: 'Nov 27th 2020 11:45 AM'
        },
        {
          id: '#00012448',
          companyName: 'Smart Trade Corp',
          contactName: 'Amy Zhang',
          phoneNumber: '012 312345 445',
          position: 'Supervisor',
          status: 'active',
          createdDate: 'Nov 26th 2020 04:20 PM'
        },
        {
          id: '#00012447',
          companyName: 'Fast Forward Ltd',
          contactName: 'Jack Liu',
          phoneNumber: '012 312345 446',
          position: 'Agent',
          status: 'blacklisted',
          createdDate: 'Nov 26th 2020 10:30 AM'
        },
        {
          id: '#00012446',
          companyName: 'Ocean Freight Co',
          contactName: 'Mary Lee',
          phoneNumber: '012 312345 447',
          position: 'Manager',
          status: 'active',
          createdDate: 'Nov 25th 2020 03:45 PM'
        },
        {
          id: '#00012445',
          companyName: 'Air Cargo Express',
          contactName: 'Peter Wong',
          phoneNumber: '012 312345 448',
          position: 'Executive',
          status: 'active',
          createdDate: 'Nov 25th 2020 09:15 AM'
        }
      ];
      setClients(sampleData);
      setFilteredClients(sampleData);
    } finally {
      setLoading(false);
    }
  };

  // Filter clients based on search and status
  useEffect(() => {
    let filtered = clients;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(client => client.status === activeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contactName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClients(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, activeFilter, clients]);

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">客户管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理您的所有客户信息</p>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left side - Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <ClientFilterTabs
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                counts={{
                  all: clients.length,
                  active: clients.filter(c => c.status === 'active').length,
                  frozen: clients.filter(c => c.status === 'frozen').length,
                  blacklisted: clients.filter(c => c.status === 'blacklisted').length
                }}
              />
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索客户名称或公司..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
            </div>

            {/* Right side - New Client Button */}
            <button
              onClick={() => {/* TODO: Open new client modal */}}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              新建客户
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : (
            <>
              <ClientTable clients={currentClients} onRefresh={fetchClients} />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          显示 {startIndex + 1} - {Math.min(endIndex, filteredClients.length)} 条，共 {filteredClients.length} 条数据
        </div>
      </div>
    </div>
  );
}
