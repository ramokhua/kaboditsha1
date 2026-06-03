import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ApplicantDashboard = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [applications, setApplications] = useState([]);
  const [draftApplications, setDraftApplications] = useState([]);
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
      const appsResponse = await api.get('/applications/my');
      const allApplications = appsResponse.data;
      const drafts = allApplications.filter(app => app.status === 'DRAFT');
      const submitted = allApplications.filter(app => app.status !== 'DRAFT');
      setDraftApplications(drafts);
      setApplications(submitted);
      
      const notifResponse = await api.get('/notifications?limit=5');
      const notificationsData = notifResponse.data?.notifications || [];
      setNotifications(notificationsData.slice(0, 5));
      
      const activeApps = submitted.filter(app => 
        ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'].includes(app.status)
      );
      
      const queuePromises = activeApps.map(async (app) => {
        try {
          const response = await api.get(`/waiting-list/queue/position/${app.applicationId}`);
          return { applicationId: app.applicationId, data: response.data };
        } catch (err) {
          return { applicationId: app.applicationId, data: null };
        }
      });
      
      const queueResults = await Promise.all(queuePromises);
      const queueDataMap = {};
      queueResults.forEach(result => {
        if (result.data) queueDataMap[result.applicationId] = result.data;
      });
      setQueueData(queueDataMap);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      addNotification('error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueUpdates = async () => {
    try {
      const response = await api.get('/queue/updates');
      if (response.data.updates && response.data.updates.length > 0) {
        for (const update of response.data.updates) {
          try {
            const queueInfo = await api.get(`/waiting-list/queue/position/${update.applicationId}`);
            setQueueData(prev => ({ ...prev, [update.applicationId]: queueInfo.data }));
          } catch (err) {
            console.error('Error fetching queue update:', err);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching queue updates:', error);
    }
  };

  const deleteDraft = async (draftId) => {
    if (window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      try {
        await api.delete(`/applications/draft/${draftId}`);
        addNotification('success', 'Draft deleted successfully');
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting draft:', error);
        addNotification('error', 'Failed to delete draft');
      }
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawReason.trim()) {
      addNotification('error', 'Please provide a reason for withdrawal');
      return;
    }
    setWithdrawing(true);
    try {
      await api.put(`/applications/${selectedApplication.applicationId}/status`, {
        status: 'WITHDRAWN',
        notes: `Withdrawn by applicant. Reason: ${withdrawReason}`
      });
      addNotification('success', 'Application withdrawn successfully');
      setShowWithdrawModal(false);
      setWithdrawReason('');
      setSelectedApplication(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error withdrawing application:', error);
      addNotification('error', error.response?.data?.error || 'Failed to withdraw application');
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
      DRAFT: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      SUBMITTED: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
      UNDER_REVIEW: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
      DOCUMENTS_VERIFIED: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
      APPROVED: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300',
      REJECTED: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
      WITHDRAWN: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  };

  const getStatusText = (status) => {
    const texts = {
      DRAFT: 'Draft',
      SUBMITTED: 'Submitted',
      UNDER_REVIEW: 'Under Review',
      DOCUMENTS_VERIFIED: 'Verified',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      WITHDRAWN: 'Withdrawn'
    };
    return texts[status] || status.replace('_', ' ');
  };

  const canWithdraw = (status) => ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'].includes(status);

  const getQueueDisplay = (app) => {
    const data = queueData[app.applicationId];
    if (app.status === 'APPROVED') return 'Approved ✓';
    if (app.status === 'REJECTED') return 'Rejected ✗';
    if (app.status === 'WITHDRAWN') return 'Withdrawn';
    if (app.status === 'DRAFT') return 'Not submitted';
    if (data && data.totalWaiting !== undefined) return `${data.queuePosition} of ${data.totalWaiting.toLocaleString()}`;
    return `${app.queuePosition || '?'} of ?`;
  };

  const resumeDraft = (draftId) => window.location.href = `/apply?resume=${draftId}`;

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  const activeApplications = applications.filter(app => ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'].includes(app.status));
  const completedApplications = applications.filter(app => ['APPROVED', 'REJECTED', 'WITHDRAWN'].includes(app.status));

  return (
    <div className="min-h-screen bg-[#F5E6D3] dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-[#2C1810] dark:text-white mb-2">Welcome back, {user?.fullName}!</h1>
          <p className="text-[#1A1A1A] dark:text-gray-400">Here's an overview of your land applications.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Apps</p>
                <p className="text-2xl font-bold text-[#2C1810] dark:text-white">{applications.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Queue</p>
                <p className="text-2xl font-bold text-[#B45F3A]">{activeApplications.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Approved</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{applications.filter(a => a.status === 'APPROVED').length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Drafts</p>
                <p className="text-2xl font-bold text-gray-500 dark:text-gray-400">{draftApplications.length}</p>
              </div>
            </div>

            {/* Draft Applications Section */}
            {draftApplications.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#2C1810] dark:text-white flex items-center gap-2">📝 Saved Drafts</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Resume your incomplete applications</p>
                    </div>
                    <Link to="/apply" className="px-4 py-2 bg-[#2C1810] dark:bg-[#B45F3A] text-white rounded-lg hover:bg-[#3d2418] dark:hover:bg-[#8B4513] transition-colors text-sm">+ New Application</Link>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Land Board</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Saved</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {draftApplications.map((draft) => (
                        <tr key={draft.applicationId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{draft.landBoard?.name || 'Not selected'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{draft.settlementType || 'Not selected'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(draft.updatedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button onClick={() => resumeDraft(draft.applicationId)} className="text-[#B45F3A] hover:text-[#2C1810] dark:hover:text-[#D4A574] mr-3 font-medium">Resume</button>
                            <button onClick={() => deleteDraft(draft.applicationId)} className="text-red-600 dark:text-red-400 hover:text-red-800">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Active Applications Table */}
            {activeApplications.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-[#2C1810] dark:text-white">Active Applications</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your position in the queue updates in real-time</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Land Board</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Queue Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {activeApplications.map((app) => (
                        <tr key={app.applicationId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{app.landBoard?.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              app.settlementType === 'TOWN' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
                              app.settlementType === 'VILLAGE' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                              'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
                            }`}>{app.settlementType}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(app.status)}`}>{getStatusText(app.status)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">{getQueueDisplay(app)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(app.submittedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-3">
                              <Link to={`/applications/${app.applicationId}`} className="text-[#B45F3A] hover:text-[#2C1810] dark:hover:text-[#D4A574]">View</Link>
                              {canWithdraw(app.status) && <button onClick={() => openWithdrawModal(app)} className="text-red-600 dark:text-red-400 hover:text-red-800">Withdraw</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Completed Applications Table */}
            {completedApplications.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-[#2C1810] dark:text-white">Completed Applications</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Land Board</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {completedApplications.map((app) => (
                        <tr key={app.applicationId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{app.landBoard?.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              app.settlementType === 'TOWN' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
                              app.settlementType === 'VILLAGE' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                              'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
                            }`}>{app.settlementType}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(app.status)}`}>{getStatusText(app.status)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(app.submittedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link to={`/applications/${app.applicationId}`} className="text-[#B45F3A] hover:text-[#2C1810] dark:hover:text-[#D4A574]">View</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {applications.length === 0 && draftApplications.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't submitted any applications yet.</p>
                <Link to="/apply" className="btn-primary inline-block">Apply Now</Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#2C1810] dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/apply" className="btn-primary w-full text-center block">➕ New Application</Link>
                <Link to="/profile" className="btn-outline w-full text-center block">👤 Update Profile</Link>
              </div>
            </div>

            {activeApplications.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#2C1810] dark:text-white mb-3">Queue Summary</h2>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">📊 You have {activeApplications.length} active application(s)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">⏱️ Positions update automatically every 30 seconds</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">📧 You'll receive notifications when your status changes</p>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#2C1810] dark:text-white mb-4">Recent Notifications</h2>
              {notifications.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No new notifications</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div key={notif.notificationId} className="p-3 bg-[#F5E6D3] dark:bg-gray-700 rounded-lg border-l-4 border-[#B45F3A]">
                      <p className="font-medium text-[#2C1810] dark:text-white text-sm">{notif.subject}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(notif.sentAt).toLocaleDateString()}</p>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-red-50 dark:bg-red-900/30 px-6 py-4 border-b border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">Withdraw Application</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Are you sure you want to withdraw your application for <strong className="dark:text-white">{selectedApplication.landBoard?.name}</strong> ({selectedApplication.settlementType})?</p>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">This action cannot be undone. Your queue position will be lost.</p>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for withdrawal <span className="text-red-500">*</span></label>
              <textarea value={withdrawReason} onChange={(e) => setWithdrawReason(e.target.value)} rows={3} className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B45F3A]" placeholder="Please explain why you're withdrawing this application..." />
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
              <button onClick={() => { setShowWithdrawModal(false); setWithdrawReason(''); setSelectedApplication(null); }} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 font-medium">Cancel</button>
              <button onClick={handleWithdraw} disabled={withdrawing} className={`px-4 py-2 rounded-lg font-medium transition-colors ${withdrawing ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}>{withdrawing ? 'Withdrawing...' : 'Yes, Withdraw'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantDashboard;