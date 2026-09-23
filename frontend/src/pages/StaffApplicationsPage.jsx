import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SearchBar from '../components/common/SearchBar';
import { ArrowLeft } from 'lucide-react';

const SETTLEMENT_LABELS = {
  TOWN: '🏙️ Town',
  VILLAGE: '🏘️ Village',
  FARM: '🌾 Farm'
};

const StaffApplicationsPage = () => {
  const [searchParams] = useSearchParams();
  const settlementFilter = searchParams.get('settlement') || 'ALL';
  
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, activeStatus, searchTerm, settlementFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/staff/applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Filter by settlement
    if (settlementFilter !== 'ALL') {
      filtered = filtered.filter(app => app.settlementType === settlementFilter);
    }

    // Filter by status
    if (activeStatus !== 'ALL') {
      filtered = filtered.filter(app => app.status === activeStatus);
    }

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.user?.fullName?.toLowerCase().includes(lower) ||
        app.applicationNumber?.toLowerCase().includes(lower) ||
        String(app.user?.omangNumber || '').includes(lower)
      );
    }

    // Sort: FIFO for active statuses, newest first for completed
    filtered.sort((a, b) => {
      const aActive = ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'].includes(a.status);
      const bActive = ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'].includes(b.status);

      if (aActive && bActive) {
        return new Date(a.submittedAt) - new Date(b.submittedAt);
      }
      if (!aActive && !bActive) {
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      }
      return aActive ? -1 : 1;
    });

    setFilteredApps(filtered);
  };

  const statusTabs = [
    { key: 'ALL', label: 'All' },
    { key: 'SUBMITTED', label: 'Pending' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'DOCUMENTS_VERIFIED', label: 'Verified' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'WITHDRAWN', label: 'Withdrawn' }
  ];

  const getStatusCount = (status) => {
    let base = applications;
    if (settlementFilter !== 'ALL') {
      base = base.filter(app => app.settlementType === settlementFilter);
    }
    if (status === 'ALL') return base.length;
    return base.filter(app => app.status === status).length;
  };

  const getStatusBadge = (status) => {
    const colors = {
      DRAFT: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      SUBMITTED: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
      UNDER_REVIEW: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
      DOCUMENTS_VERIFIED: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
      APPROVED: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300',
      REJECTED: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
      WITHDRAWN: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const showQueuePosition = activeStatus !== 'ALL';

  if (loading) return <LoadingSpinner text="Loading applications..." />;

  const pageTitle = settlementFilter === 'ALL' 
    ? 'All Applications' 
    : `${SETTLEMENT_LABELS[settlementFilter] || settlementFilter} Queue`;

  return (
    <Layout>
      <div className="min-h-screen bg-[#F5E6D3] dark:bg-gray-900 py-8 transition-colors duration-200">
        <div className="container mx-auto px-4">
          {/* Back link */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-[#B45F3A] hover:text-[#2C1810] dark:hover:text-[#D4A574] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Staff Dashboard
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#2C1810] dark:text-white">
              {pageTitle}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredApps.length} {filteredApps.length === 1 ? 'application' : 'applications'}
            </p>
          </div>

          {/* Status Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-lg pt-4 px-6">
            <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              {statusTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveStatus(tab.key)}
                  className={`py-2 px-3 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                    activeStatus === tab.key
                      ? 'bg-[#2C1810] dark:bg-[#B45F3A] text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.label} ({getStatusCount(tab.key)})
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="py-4">
              <SearchBar
                onSearch={setSearchTerm}
                placeholder="Search by name, reference, or Omang..."
                initialValue={searchTerm}
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-lg p-6 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {showQueuePosition && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Queue Pos
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applicant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredApps.slice(0, 100).map(app => (
                  <tr key={app.applicationId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {showQueuePosition && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'].includes(app.status) && app.queuePosition ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            app.queuePosition <= 10 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 font-bold' :
                            app.queuePosition <= 50 ? 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                            app.queuePosition <= 200 ? 'bg-yellow-50 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                            'bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                          }`}>
                            #{app.queuePosition}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {app.applicationNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {app.user?.fullName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(app.status)}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Link
                        to={`/staff/review/${app.applicationId}`}
                        className="text-[#B45F3A] hover:text-[#2C1810] dark:hover:text-[#D4A574] font-medium"
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
                <p className="text-gray-500 dark:text-gray-400">No applications found</p>
              </div>
            )}

            {filteredApps.length > 100 && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Showing first 100 of {filteredApps.length} applications
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StaffApplicationsPage;