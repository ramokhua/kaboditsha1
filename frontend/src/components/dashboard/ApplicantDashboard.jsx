// src/components/dashboard/ApplicantDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ApplicantDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [queueData, setQueueData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(fetchQueueUpdates, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch applications
      const appsResponse = await api.get('/applications/my');
      const applicationsData = appsResponse.data;
      setApplications(applicationsData);
      
      // Fetch notifications
      const notifResponse = await api.get('/notifications?limit=5');
      const notificationsData = notifResponse.data?.notifications || [];
      setNotifications(notificationsData.slice(0, 5));
      
      // Fetch queue details for ALL applications (including completed ones for reference)
      // But especially for active ones
      const queuePromises = applicationsData.map(async (app) => {
        try {
          // Only fetch queue position for active applications
          if (['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'].includes(app.status)) {
            const response = await api.get(`/waiting-list/queue/position/${app.applicationId}`);
            return { applicationId: app.applicationId, data: response.data };
          }
          return { applicationId: app.applicationId, data: null };
        } catch (err) {
          console.error(`Error fetching queue for ${app.applicationId}:`, err);
          return { applicationId: app.applicationId, data: null };
        }
      });
      
      const queueResults = await Promise.all(queuePromises);
      const queueDataMap = {};
      queueResults.forEach(result => {
        if (result.data) {
          queueDataMap[result.applicationId] = result.data;
        }
      });
      setQueueData(queueDataMap);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueUpdates = async () => {
    try {
      const response = await api.get('/queue/updates');
      if (response.data.updates && response.data.updates.length > 0) {
        const updatedApps = response.data.updates;
        for (const update of updatedApps) {
          try {
            const queueInfo = await api.get(`/waiting-list/queue/position/${update.applicationId}`);
            setQueueData(prev => ({
              ...prev,
              [update.applicationId]: queueInfo.data
            }));
          } catch (err) {
            console.error('Error fetching queue update:', err);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching queue updates:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawReason.trim()) {
      alert('Please provide a reason for withdrawal');
      return;
    }

    setWithdrawing(true);
    try {
      await api.put(`/applications/${selectedApplication.applicationId}/status`, {
        status: 'WITHDRAWN',
        notes: `Withdrawn by applicant. Reason: ${withdrawReason}`
      });
      
      // Refresh dashboard data
      await fetchDashboardData();
      setShowWithdrawModal(false);
      setWithdrawReason('');
      setSelectedApplication(null);
      
      alert('Application withdrawn successfully');
      
    } catch (error) {
      console.error('Error withdrawing application:', error);
      alert(error.response?.data?.error || 'Failed to withdraw application');
    } finally {
      setWithdrawing(false);
    }
  };

  const openWithdrawModal = (application) => {
    setSelectedApplication(application);
    setShowWithdrawModal(true);
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

  const getStatusText = (status) => {
    const texts = {
      SUBMITTED: 'Submitted',
      UNDER_REVIEW: 'Under Review',
      DOCUMENTS_VERIFIED: 'Verified',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      WITHDRAWN: 'Withdrawn'
    };
    return texts[status] || status.replace('_', ' ');
  };

  const canWithdraw = (status) => {
    return ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'].includes(status);
  };

  const getQueueDisplay = (app) => {
    const data = queueData[app.applicationId];
    
    // If application is completed, show status
    if (app.status === 'APPROVED') return 'Approved ✓';
    if (app.status === 'REJECTED') return 'Rejected ✗';
    if (app.status === 'WITHDRAWN') return 'Withdrawn';
    
    // If we have queue data, show position with total
    if (data && data.totalWaiting !== undefined) {
      return `${data.queuePosition} of ${data.totalWaiting.toLocaleString()}`;
    }
    
    // If we're still loading, show loading
    if (!data && loading) return 'Loading...';
    
    // Fallback
    return `${app.queuePosition || '?'} of ?`;
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  const activeApplications = applications.filter(app => 
    ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'].includes(app.status)
  );
  const completedApplications = applications.filter(app => 
    ['APPROVED', 'REJECTED', 'WITHDRAWN'].includes(app.status)
  );

  return (
    <div className="min-h-screen bg-[#F5E6D3] py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-[#2C1810] mb-2">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-[#1A1A1A]">
            Here's an overview of your land applications.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Applications Table */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-[#2C1810]">{applications.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Active Queue</p>
                <p className="text-3xl font-bold text-[#B45F3A]">
                  {activeApplications.length}
                </p>
                <p className="text-xs text-gray-500">applications waiting</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Approved</p>
                <p className="text-3xl font-bold text-[#1F4A2B]">
                  {applications.filter(a => a.status === 'APPROVED').length}
                </p>
              </div>
            </div>

            {/* Active Applications Table */}
            {activeApplications.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-[#2C1810]">Active Applications</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Your position in the queue updates in real-time
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Land Board
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Queue Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeApplications.map((app) => {
                        const queueDisplay = getQueueDisplay(app);
                        return (
                          <tr key={app.applicationId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {app.landBoard?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                app.settlementType === 'CITY' ? 'bg-blue-100 text-blue-800' :
                                app.settlementType === 'TOWN' ? 'bg-green-100 text-green-800' :
                                app.settlementType === 'VILLAGE' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {app.settlementType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(app.status)}`}>
                                {getStatusText(app.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                              {queueDisplay}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(app.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex space-x-3">
                                <Link
                                  to={`/applications/${app.applicationId}`}
                                  className="text-[#B45F3A] hover:text-[#2C1810]"
                                >
                                  View
                                </Link>
                                {canWithdraw(app.status) && (
                                  <button
                                    onClick={() => openWithdrawModal(app)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Withdraw
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Completed Applications Table */}
            {completedApplications.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-[#2C1810]">Completed Applications</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Land Board
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {completedApplications.map((app) => (
                        <tr key={app.applicationId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {app.landBoard?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              app.settlementType === 'CITY' ? 'bg-blue-100 text-blue-800' :
                              app.settlementType === 'TOWN' ? 'bg-green-100 text-green-800' :
                              app.settlementType === 'VILLAGE' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {app.settlementType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(app.status)}`}>
                              {getStatusText(app.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(app.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link
                              to={`/applications/${app.applicationId}`}
                              className="text-[#B45F3A] hover:text-[#2C1810]"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No Applications Message */}
            {applications.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-600 mb-4">You haven't submitted any applications yet.</p>
                <Link to="/apply" className="btn-primary inline-block">
                  Apply Now
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar - Notifications & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#2C1810] mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/apply"
                  className="btn-primary w-full text-center block"
                >
                  ➕ New Application
                </Link>
                <Link
                  to="/profile"
                  className="btn-outline w-full text-center block"
                >
                  👤 Update Profile
                </Link>
              </div>
            </div>

            {/* Queue Summary */}
            {activeApplications.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#2C1810] mb-3">Queue Summary</h2>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    📊 You have {activeApplications.length} active application(s)
                  </p>
                  <p className="text-sm text-gray-600">
                    ⏱️ Positions update automatically every 30 seconds
                  </p>
                  <p className="text-sm text-gray-600">
                    📧 You'll receive notifications when your status changes
                  </p>
                </div>
              </div>
            )}

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#2C1810] mb-4">Recent Notifications</h2>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No new notifications</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.notificationId}
                      className="p-3 bg-[#F5E6D3] rounded-lg border-l-4 border-[#B45F3A]"
                    >
                      <p className="font-medium text-[#2C1810] text-sm">{notif.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <h3 className="text-lg font-semibold text-red-800">Withdraw Application</h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to withdraw your application for <strong>{selectedApplication.landBoard?.name}</strong> ({selectedApplication.settlementType})?
              </p>
              <p className="text-gray-600 mb-4 text-sm">
                This action cannot be undone. Your queue position will be lost.
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for withdrawal <span className="text-red-500">*</span>
              </label>
              <textarea
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B45F3A] focus:border-transparent"
                placeholder="Please explain why you're withdrawing this application..."
              />
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawReason('');
                  setSelectedApplication(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  withdrawing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {withdrawing ? 'Withdrawing...' : 'Yes, Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantDashboard;