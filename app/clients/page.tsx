'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import ClientTable from '@/components/clients/ClientTable';
import ClientFilterTabs from '@/components/clients/ClientFilterTabs';
import ClientForm from '@/components/clients/ClientForm';
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
  address?: string;
  settlementMethod?: string;
  financeContact?: any;
  positions?: any[];
  shipmentCount?: number;
  loginCount?: number;
  notes?: string;
  attachments?: any;
  updatedAt?: Date;
}

interface ApiResponse {
  success: boolean;
  data: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'frozen' | 'blacklisted'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(activeFilter !== 'all' && { status: activeFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/clients?${params}`);
      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setClients(result.data);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [currentPage, activeFilter, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filter: 'all' | 'active' | 'frozen' | 'blacklisted') => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleNewClient = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
      const method = editingClient ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchClients(); // Refresh the list
        setIsFormOpen(false);
        setEditingClient(null);
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('确定要删除此客户吗？')) {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchClients(); // Refresh the list
        }
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  // Calculate counts for filter tabs
  const counts = {
    all: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    frozen: clients.filter(c => c.status === 'frozen').length,
    blacklisted: clients.filter(c => c.status === 'blacklisted').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">客户管理</h1>
              <p className="text-gray-600 mt-1">管理您的客户信息和关系</p>
            </div>
            <button
              onClick={handleNewClient}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              新建客户
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between">
            <ClientFilterTabs
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              counts={counts}
            />

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索客户名称或公司..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ClientTable 
              clients={clients} 
              onRefresh={fetchClients}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
            />
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Client Form Modal */}
        <ClientForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingClient(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingClient || undefined}
          isEditing={!!editingClient}
        />
      </div>
    </div>
  );
}
