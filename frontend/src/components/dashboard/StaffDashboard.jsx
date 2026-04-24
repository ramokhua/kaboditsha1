// frontend/src/components/dashboard/StaffDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import SearchBar from '../common/SearchBar';

const StaffDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [settlementFilter, setSettlementFilter] = useState('');

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
        'rejected': 'REJECTED'
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

  const settlementTypes = ['CITY', 'TOWN', 'VILLAGE', 'FARM'];

  if (loading) {
    return <LoadingSpinner text="Loading staff dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-[#F5E6D3] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#2C1810] mb-8">Staff Dashboard</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Total</p>
            <p className="text-2xl font-bold text-[#2C1810]">{stats.total || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-blue-600">{stats.pending || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Under Review</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.underReview || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Verified</p>
            <p className="text-2xl font-bold text-green-600">{stats.verified || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Approved</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.approved || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-lg pt-4 px-6">
          <div className="flex space-x-8 border-b border-gray-200 overflow-x-auto">
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

          {/* Filters */}
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
        <div className="bg-white rounded-b-xl shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Land Board</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApps.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {app.applicationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.user?.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.landBoard?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.settlementType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(app.status)}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/staff/review/${app.applicationId}`}
                        className="text-[#B45F3A] hover:text-[#2C1810]"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApps.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No applications found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;