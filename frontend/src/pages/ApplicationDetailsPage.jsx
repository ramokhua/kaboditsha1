import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNotifications } from '../context/NotificationContext';
import ConfirmationModal from '../components/common/ConfirmationModal';

const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [queueInfo, setQueueInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const [appRes, docsRes, queueRes] = await Promise.all([
        api.get(`/applications/${id}`),
        api.get(`/applications/${id}/documents`),
        api.get(`/waiting-list/queue/position/${id}`).catch(() => ({ data: null }))
      ]);
      
      setApplication(appRes.data);
      setDocuments(docsRes.data || []);
      setQueueInfo(queueRes.data);
      
    } catch (error) {
      console.error('Error fetching application details:', error);
      addNotification('error', 'Failed to load application details');
      navigate('/applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawReason.trim()) {
      addNotification('error', 'Please provide a reason for withdrawal');
      return;
    }

    setWithdrawing(true);
    try {
      await api.put(`/applications/${id}/status`, {
        status: 'WITHDRAWN',
        notes: `Withdrawn by applicant. Reason: ${withdrawReason}`
      });
      
      addNotification('success', 'Application withdrawn successfully');
      setShowWithdrawModal(false);
      await fetchApplicationDetails();
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error withdrawing application:', error);
      addNotification('error', error.response?.data?.error || 'Failed to withdraw application');
    } finally {
      setWithdrawing(false);
    }
  };

  const getStatusColor = (status) => {
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
      SUBMITTED: 'Submitted - Awaiting Review',
      UNDER_REVIEW: 'Under Review',
      DOCUMENTS_VERIFIED: 'Documents Verified',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      WITHDRAWN: 'Withdrawn'
    };
    return texts[status] || status.replace('_', ' ');
  };

  const canWithdraw = () => {
    if (!application) return false;
    return ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'].includes(application.status);
  };

  const getQueueDisplay = () => {
    if (queueInfo) {
      return {
        position: queueInfo.queuePosition,
        total: queueInfo.totalWaiting,
        ahead: queueInfo.applicationsAhead,
        percent: queueInfo.percentThrough || 0,
        display: `${queueInfo.queuePosition} of ${queueInfo.totalWaiting?.toLocaleString() || '?'}`
      };
    }
    return {
      position: application?.queuePosition || 'N/A',
      total: '?',
      ahead: '?',
      percent: 0,
      display: `${application?.queuePosition || 'N/A'} of ?`
    };
  };

  // Status Timeline Component
  const StatusTimeline = ({ currentStatus, history }) => {
    const statusOrder = ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED', 'APPROVED'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    // Get status change dates from history
    const getStatusDate = (status) => {
      const entry = history?.find(h => h.status === status);
      return entry ? new Date(entry.changedAt).toLocaleDateString() : null;
    };

    if (currentStatus === 'REJECTED' || currentStatus === 'WITHDRAWN') {
      return (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-700 font-medium">
            {currentStatus === 'REJECTED' ? 'Application Rejected' : 'Application Withdrawn'}
          </p>
          <p className="text-red-600 text-sm mt-1">
            {currentStatus === 'REJECTED' 
              ? application?.rejectionReason || 'No reason provided'
              : `Withdrawn on ${new Date(application?.updatedAt).toLocaleDateString()}`}
          </p>
        </div>
      );
    }

    return (
      <div className="mb-8">
        <h3 className="font-semibold text-gray-800 mb-4">Application Timeline</h3>
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
          <div className="relative flex justify-between">
            {statusOrder.map((status, idx) => {
              const isCompleted = idx <= currentIndex;
              const statusDate = getStatusDate(status);
              return (
                <div key={status} className="text-center flex-1">
                  <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center z-10 relative ${
                    isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <p className="text-xs mt-2 font-medium">{status.replace('_', ' ')}</p>
                  {statusDate && (
                    <p className="text-xs text-gray-400 mt-1">{statusDate}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading application details..." />
      </Layout>
    );
  }

  if (!application) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#F5E6D3] py-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-[#2C1810] mb-4">Application Not Found</h1>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const queueData = getQueueDisplay();

  return (
    <Layout>
      <div className="min-h-screen bg-[#F5E6D3] py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 text-[#B45F3A] hover:text-[#2C1810] flex items-center"
          >
            ← Back to Dashboard
          </button>

          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2C1810] to-[#3d2418] text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-white text-3xl font-bold mb-2">
                    Application {application.applicationNumber}
                  </h1>
                  <p className="text-white/80">
                    Submitted on {new Date(application.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(application.status)}`}>
                  {getStatusText(application.status)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Timeline */}
              <StatusTimeline 
                currentStatus={application.status} 
                history={application.statusHistory}
              />

              {/* Queue Position */}
              <div className="bg-[#F5E6D3] p-6 rounded-lg">
                <h2 className="text-xl font-bold text-[#2C1810] mb-4">Queue Position</h2>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-4xl font-bold text-[#2C1810]">
                      #{queueData.position}
                    </p>
                    <p className="text-[#4A4A4A]">
                      out of {queueData.total?.toLocaleString() || '?'} applicants
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#4A4A4A]">Applicants Ahead</p>
                    <p className="text-2xl font-semibold text-[#B45F3A]">
                      {queueData.ahead?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
                {queueData.total > 0 && (
                  <>
                    <div className="mt-4 w-full bg-[#8B4513]/20 rounded-full h-3">
                      <div
                        className="bg-[#2C1810] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${queueData.percent}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-[#4A4A4A] mt-2">
                      {queueData.percent}% through the queue
                    </p>
                  </>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-bold text-[#2C1810] mb-4">Application Details</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-[#4A4A4A]">Land Board</p>
                      <p className="font-semibold text-[#2C1810]">{application.landBoard?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#4A4A4A]">Settlement Type</p>
                      <p className="font-semibold text-[#2C1810]">{application.settlementType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#4A4A4A]">Purpose</p>
                      <p className="font-semibold text-[#2C1810]">{application.purpose || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#2C1810] mb-4">Personal Information</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-[#4A4A4A]">Full Name</p>
                      <p className="font-semibold text-[#2C1810]">{application.user?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#4A4A4A]">Omang Number</p>
                      <p className="font-semibold text-[#2C1810]">{application.user?.omangNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#4A4A4A]">Contact</p>
                      <p className="font-semibold text-[#2C1810]">{application.user?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h2 className="text-xl font-bold text-[#2C1810] mb-4">Documents</h2>
                {documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc) => {
                      const docNames = {
                        omang: 'Certified Copy of Omang',
                        marriage: 'Marriage Certificate',
                        affidavit: 'Affidavit',
                        proof: 'Proof of Residence'
                      };
                      return (
                        <div
                          key={doc.documentId}
                          className="flex items-center justify-between p-3 border border-[#8B4513]/20 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">📄</span>
                            <div>
                              <p className="font-medium text-[#2C1810]">
                                {docNames[doc.documentType] || doc.filename}
                              </p>
                              <p className="text-sm text-[#4A4A4A]">
                                Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            doc.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            doc.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.verificationStatus === 'APPROVED' ? 'Verified' :
                             doc.verificationStatus === 'REJECTED' ? 'Rejected' : 'Pending'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[#4A4A4A] italic">No documents uploaded yet.</p>
                )}
              </div>

              {/* Notes */}
              {application.notes && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-semibold text-[#2C1810] mb-2">Staff Notes</h2>
                  <p className="text-sm text-gray-600">{application.notes}</p>
                </div>
              )}

              {/* Actions */}
              {canWithdraw() && (
                <div className="flex justify-end pt-4 border-t border-[#8B4513]/20">
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Withdraw Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showWithdrawModal}
        onClose={() => {
          setShowWithdrawModal(false);
          setWithdrawReason('');
        }}
        onConfirm={handleWithdraw}
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application? This action cannot be undone."
        confirmText={withdrawing ? 'Withdrawing...' : 'Yes, Withdraw'}
        cancelText="Cancel"
        isProcessing={withdrawing}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for withdrawal <span className="text-red-500">*</span>
          </label>
          <textarea
            value={withdrawReason}
            onChange={(e) => setWithdrawReason(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B45F3A] focus:border-transparent"
            placeholder="Please explain why you're withdrawing this application..."
            disabled={withdrawing}
          />
        </div>
      </ConfirmationModal>
    </Layout>
  );
};

export default ApplicationDetailsPage;