import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import SearchBar from '../common/SearchBar';
import { useNotifications } from '../../context/NotificationContext';
import * as XLSX from 'xlsx';

const StaffDashboard = () => {
  const { addNotification } = useNotifications();
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [settlementFilter, setSettlementFilter] = useState('');
  
  // Bulk update states
  const [selectedApps, setSelectedApps] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [activeTab, searchTerm, settlementFilter, applications]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, statsRes] = await Promise.all([
        api.get('/staff/applications'),
        api.get('/staff/stats')
      ]);
      setApplications(appsRes.data);
      setFilteredApps(appsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching staff data:', error);
      addNotification('error', 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    if (activeTab !== 'all') {
      const statusMap = {
        'pending': 'SUBMITTED',
        'underReview': 'UNDER_REVIEW',
        'verified': 'DOCUMENTS_VERIFIED',
        'approved': 'APPROVED',
        'rejected': 'REJECTED',
        'withdrawn': 'WITHDRAWN'
      };
      filtered = filtered.filter(app => app.status === statusMap[activeTab]);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.user?.fullName?.toLowerCase().includes(lowerTerm) ||
        app.applicationNumber?.toLowerCase().includes(lowerTerm) ||
        app.landBoard?.name?.toLowerCase().includes(lowerTerm)
      );
    }

    if (settlementFilter) {
      filtered = filtered.filter(app => app.settlementType === settlementFilter);
    }

    setFilteredApps(filtered);
  };

  // Export to excel
  const exportToExcel = () => {
    const headers = ['Reference', 'Applicant', 'Land Board', 'Type', 'Queue Position', 'Status', 'Submitted Date'];
    const rows = filteredApps.map(app => [
      app.applicationNumber,
      app.user?.fullName || '',
      app.landBoard?.name || '',
      app.settlementType,
      app.queuePosition || 'N/A',
      app.status.replace('_', ' '),
      new Date(app.submittedAt).toLocaleDateString()
    ]);

    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');
    XLSX.writeFile(wb, `applications_${new Date().toISOString().split('T')[0]}.xlsx`);
    addNotification('success', `Exported ${filteredApps.length} applications to Excel`);
  };

  // Bulk update handlers
  const toggleSelectApp = (appId) => {
    setSelectedApps(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedApps.length === filteredApps.length && filteredApps.length > 0) {
      setSelectedApps([]);
    } else {
      setSelectedApps(filteredApps.map(app => app.applicationId));
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selectedApps.length === 0) return;
    
    setBulkUpdating(true);
    try {
      const selectedApplications = filteredApps.filter(app => selectedApps.includes(app.applicationId));
      
      await Promise.all(selectedApplications.map(app =>
        api.put(`/staff/applications/${app.applicationId}/status`, { 
          status: bulkStatus, 
          notes: `Bulk update from staff dashboard. Status changed to ${bulkStatus}` 
        })
      ));
      
      // Rebalance queue positions after bulk update
      await api.post('/staff/rebalance-queue');
      
      addNotification('success', `Updated ${selectedApps.length} applications to ${bulkStatus.replace('_', ' ')}`);
      setSelectedApps([]);
      setShowBulkModal(false);
      setBulkStatus('');
      fetchData();
    } catch (error) {
      console.error('Bulk update error:', error);
      addNotification('error', 'Bulk update failed. Please try again.');
    } finally {
      setBulkUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      SUBMITTED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      DOCUMENTS_VERIFIED: 'bg-green-100 text-green-800',
      APPROVED: 'bg-emerald-100 text-emerald-800',
      REJECTED: 'bg-red-100 text-red-800',
      WITHDRAWN: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getQueuePositionStyle = (position, status) => {
    const completedStatuses = ['APPROVED', 'REJECTED', 'WITHDRAWN'];
    if (completedStatuses.includes(status)) {
      return { display: false, text: 'Completed', className: 'bg-gray-100 text-gray-500' };
    }
    
    if (!position || position === 0) {
      return { display: true, text: '—', className: 'bg-gray-100 text-gray-400' };
    }
    
    if (position <= 10) {
      return { display: true, text: `#${position}`, className: 'bg-green-100 text-green-800 font-bold' };
    } else if (position <= 50) {
      return { display: true, text: `#${position}`, className: 'bg-green-50 text-green-700' };
    } else if (position <= 200) {
      return { display: true, text: `#${position}`, className: 'bg-yellow-50 text-yellow-700' };
    } else {
      return { display: true, text: `#${position}`, className: 'bg-red-50 text-red-700' };
    }
  };

  const settlementTypes = ['TOWN', 'VILLAGE', 'FARM'];

  if (loading) {
    return <LoadingSpinner text="Loading staff dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-[#F5E6D3] py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C1810]">Staff Dashboard</h1>
          
          {/* Export Button */}
          {filteredApps.length > 0 && (
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              📊 Export Excel ({filteredApps.length})
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setActiveTab('all')}>
            <p className="text-sm text-gray-500 mb-1">Total</p>
            <p className="text-2xl font-bold text-[#2C1810]">{stats.total || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setActiveTab('pending')}>
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-blue-600">{stats.pending || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setActiveTab('underReview')}>
            <p className="text-sm text-gray-500 mb-1">Under Review</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.underReview || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setActiveTab('verified')}>
            <p className="text-sm text-gray-500 mb-1">Verified</p>
            <p className="text-2xl font-bold text-green-600">{stats.verified || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setActiveTab('approved')}>
            <p className="text-sm text-gray-500 mb-1">Approved</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.approved || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setActiveTab('rejected')}>
            <p className="text-sm text-gray-500 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setActiveTab('withdrawn')}>
            <p className="text-sm text-gray-500 mb-1">Withdrawn</p>
            <p className="text-2xl font-bold text-red-600">{stats.withdrawn || 0}</p>
          </div>
        </div>

        {/* Filters and Bulk Actions */}
        <div className="bg-white rounded-t-xl shadow-lg pt-4 px-6">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-200 pb-4">
            <div className="flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'border-[#B45F3A] text-[#B45F3A]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All ({stats.total || 0})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'pending'
                    ? 'border-[#B45F3A] text-[#B45F3A]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending ({stats.pending || 0})
              </button>
              <button
                onClick={() => setActiveTab('underReview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'underReview'
                    ? 'border-[#B45F3A] text-[#B45F3A]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Under Review ({stats.underReview || 0})
              </button>
              <button
                onClick={() => setActiveTab('verified')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'verified'
                    ? 'border-[#B45F3A] text-[#B45F3A]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Verified ({stats.verified || 0})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'approved'
                    ? 'border-[#B45F3A] text-[#B45F3A]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Approved ({stats.approved || 0})
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'rejected'
                    ? 'border-[#B45F3A] text-[#B45F3A]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Rejected ({stats.rejected || 0})
              </button>
            </div>
            <button
              onClick={() => setActiveTab('withdrawn')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'withdrawn'
                  ? 'border-[#B45F3A] text-[#B45F3A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Withdrawn ({stats.withdrawn || 0})
            </button>

            {/* Bulk Update Button */}
            {selectedApps.length > 0 && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-4 py-2 bg-[#2C1810] text-white rounded-lg hover:bg-[#3d2418] transition-colors flex items-center gap-2"
              >
                📋 Bulk Update ({selectedApps.length})
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 py-4">
            <div className="flex-1 min-w-[200px]">
              <SearchBar
                onSearch={setSearchTerm}
                placeholder="Search by name, ref, or board..."
                initialValue={searchTerm}
              />
            </div>
            <select
              value={settlementFilter}
              onChange={(e) => setSettlementFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A]"
            >
              <option value="">All Types</option>
              {settlementTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-b-xl shadow-lg p-6 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedApps.length === filteredApps.length && filteredApps.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#B45F3A] focus:ring-[#B45F3A]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Land Board</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Queue Pos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApps.map((app) => {
                const queueStyle = getQueuePositionStyle(app.queuePosition, app.status);
                return (
                  <tr key={app.applicationId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {app.status !== 'APPROVED' && app.status !== 'REJECTED' && app.status !== 'WITHDRAWN' && (
                        <input
                          type="checkbox"
                          checked={selectedApps.includes(app.applicationId)}
                          onChange={() => toggleSelectApp(app.applicationId)}
                          className="w-4 h-4 rounded border-gray-300 text-[#B45F3A] focus:ring-[#B45F3A]"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {app.applicationNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {app.user?.fullName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {app.landBoard?.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {app.settlementType}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {queueStyle.display ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${queueStyle.className}`}>
                          {queueStyle.text}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">{queueStyle.text}</span>
                      )}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(app.status)}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Link
                        to={`/staff/review/${app.applicationId}`}
                        className="text-[#B45F3A] hover:text-[#2C1810] font-medium"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredApps.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No applications found</p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#2C1810] mb-4">Bulk Update Status</h3>
            <p className="text-gray-600 mb-4">
              Update {selectedApps.length} application{selectedApps.length !== 1 ? 's' : ''} to:
            </p>
            
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#B45F3A]"
            >
              <option value="">Select status...</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="DOCUMENTS_VERIFIED">Documents Verified</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            
            <div className="flex gap-3">
              <button
                onClick={handleBulkUpdate}
                disabled={!bulkStatus || bulkUpdating}
                className="flex-1 bg-[#2C1810] text-white py-2 rounded-lg hover:bg-[#3d2418] disabled:opacity-50"
              >
                {bulkUpdating ? 'Updating...' : 'Update All'}
              </button>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkStatus('');
                }}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;