import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { useNotifications } from '../../context/NotificationContext';

const AuditLogs = () => {
  const { addNotification } = useNotifications();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    user: '',
    action: '',
    limit: 100
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.user) params.append('user', filters.user);
      if (filters.action) params.append('action', filters.action);
      params.append('limit', filters.limit);
      
      const response = await api.get(`/admin/audit-logs?${params}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      addNotification('error', 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    if (action.includes('Login')) return 'bg-blue-100 text-blue-800';
    if (action.includes('Create') || action.includes('Add')) return 'bg-green-100 text-green-800';
    if (action.includes('Update') || action.includes('Edit')) return 'bg-yellow-100 text-yellow-800';
    if (action.includes('Delete')) return 'bg-red-100 text-red-800';
    if (action.includes('Review') || action.includes('Verify')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (date) => new Date(date).toLocaleString()
    },
    {
      key: 'user',
      label: 'User',
      render: (_, row) => row.user?.fullName || row.user?.email || 'System'
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (action) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(action)}`}>
          {action}
        </span>
      )
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (ip) => ip || '-'
    }
  ];

  if (loading) {
    return <LoadingSpinner text="Loading audit logs..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#2C1810]">Audit Logs</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by user email..."
          value={filters.user}
          onChange={(e) => setFilters({ ...filters, user: e.target.value })}
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A]"
        />
        <input
          type="text"
          placeholder="Filter by action..."
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A]"
        />
        <select
          value={filters.limit}
          onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A]"
        >
          <option value={50}>Last 50</option>
          <option value={100}>Last 100</option>
          <option value={200}>Last 200</option>
          <option value={500}>Last 500</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        itemsPerPage={25}
      />

      {logs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No audit logs found</p>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;