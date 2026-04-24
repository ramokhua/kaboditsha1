import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNotifications } from '../context/NotificationContext';

const StaffReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');
  const [selectedDocs, setSelectedDocs] = useState({});

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/staff/applications/${id}`);
      setApplication(response.data);
    } catch (error) {
      console.error('Error fetching application:', error);
      addNotification('error', 'Failed to load application');
      navigate('/staff');
    } finally {
      setLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await api.put(`/staff/applications/${id}/status`, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`
      });
      addNotification('success', `Application ${newStatus.toLowerCase()}`);
      fetchApplication(); // Refresh the data
    } catch (error) {
      console.error('Error updating status:', error);
      addNotification('error', error.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // Handle document verification - UPDATED with better error handling and response
  const handleDocumentVerify = async (docId, status, rejectionReason = '') => {
    try {
      setUpdating(true);
      const response = await api.put(`/staff/documents/${docId}/verify`, { 
        status, 
        rejectionReason 
      });
      
      addNotification('success', `Document ${status.toLowerCase()}`);
      
      // Show message if application status changed
      if (response.data.applicationStatus) {
        addNotification('info', `Application status updated to ${response.data.applicationStatus}`);
      }
      
      fetchApplication(); // Refresh the data
    } catch (error) {
      console.error('Error verifying document:', error);
      addNotification('error', error.response?.data?.error || 'Failed to verify document');
    } finally {
      setUpdating(false);
    }
  };

  // Handle adding note
  const handleAddNote = async () => {
    if (!note.trim()) return;
    try {
      await api.post(`/staff/applications/${id}/notes`, { note });
      addNotification('success', 'Note added');
      setNote('');
      fetchApplication(); // Refresh the data
    } catch (error) {
      console.error('Error adding note:', error);
      addNotification('error', 'Failed to add note');
    }
  };

  // Helper function for document icons
  const getDocumentIcon = (type) => {
    const icons = {
      omang: '🆔',
      marriage: '💍',
      affidavit: '📜',
      proof: '🏠'
    };
    return icons[type] || '📄';
  };

  const getStatusBadge = (status) => {
    const colors = {
      SUBMITTED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      DOCUMENTS_VERIFIED: 'bg-green-100 text-green-800',
      APPROVED: 'bg-green-600 text-white',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <LoadingSpinner text="Loading application details..." />;
  }

  if (!application) {
    return <div className="text-center py-12">Application not found</div>;
  }

  // Calculate document statistics
  const documentStats = {
    pending: application.documents?.filter(d => d.verificationStatus === 'PENDING').length || 0,
    approved: application.documents?.filter(d => d.verificationStatus === 'APPROVED').length || 0,
    rejected: application.documents?.filter(d => d.verificationStatus === 'REJECTED').length || 0,
    total: application.documents?.length || 0
  };

  return (
    <div className="min-h-screen bg-[#F5E6D3] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2C1810]">Review Application</h1>
            <p className="text-[#1A1A1A]">Reference: {application.applicationNumber}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-outline"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-[#4A4A4A]">Current Status</span>
              <div className="flex items-center mt-1">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(application.status)}`}>
                  {application.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleStatusUpdate('UNDER_REVIEW')}
                disabled={updating || application.status === 'UNDER_REVIEW'}
                className="btn-outline"
              >
                Start Review
              </button>
              <button
                onClick={() => handleStatusUpdate('APPROVED')}
                disabled={updating || application.status === 'APPROVED'}
                className="btn-primary"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusUpdate('REJECTED')}
                disabled={updating || application.status === 'REJECTED'}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Applicant Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Applicant Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#2C1810] mb-4">Applicant Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#4A4A4A]">Full Name</p>
                  <p className="font-medium">{application.user.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-[#4A4A4A]">Omang Number</p>
                  <p className="font-medium">{application.user.omangNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-[#4A4A4A]">Email</p>
                  <p className="font-medium">{application.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-[#4A4A4A]">Phone</p>
                  <p className="font-medium">{application.user.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-[#4A4A4A]">Registered Since</p>
                  <p className="font-medium">{new Date(application.user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Land Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#2C1810] mb-4">Land Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#4A4A4A]">Land Board</p>
                  <p className="font-medium">{application.landBoard.name}</p>
                </div>
                <div>
                  <p className="text-sm text-[#4A4A4A]">Region</p>
                  <p className="font-medium">{application.landBoard.region}</p>
                </div>
                <div>
                  <p className="text-sm text-[#4A4A4A]">Settlement Type</p>
                  <p className="font-medium">{application.settlementType}</p>
                </div>
                <div>
                  <p className="text-sm text-[#4A4A4A]">Purpose</p>
                  <p className="font-medium">{application.purpose}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-[#4A4A4A]">Queue Position</p>
                  <p className="font-medium">#{application.queuePosition || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Documents Section - FULLY ENHANCED */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#2C1810] mb-4">Uploaded Documents</h2>
              
              {/* Document Statistics Summary */}
              {application.documents.length > 0 && (
                <div className="mb-6 p-4 bg-[#F5E6D3] rounded-lg">
                  <h3 className="font-semibold text-[#2C1810] mb-3">Document Verification Status</h3>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white p-2 rounded">
                      <p className="text-xl font-bold text-gray-600">{documentStats.total}</p>
                      <p className="text-xs text-[#4A4A4A]">Total</p>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <p className="text-xl font-bold text-yellow-600">{documentStats.pending}</p>
                      <p className="text-xs text-[#4A4A4A]">Pending</p>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <p className="text-xl font-bold text-green-600">{documentStats.approved}</p>
                      <p className="text-xs text-[#4A4A4A]">Approved</p>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <p className="text-xl font-bold text-red-600">{documentStats.rejected}</p>
                      <p className="text-xs text-[#4A4A4A]">Rejected</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {application.documents.length === 0 ? (
                  <p className="text-[#4A4A4A] text-center py-4">No documents uploaded yet</p>
                ) : (
                  application.documents.map((doc) => (
                    <div key={doc.documentId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{getDocumentIcon(doc.documentType)}</span>
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium text-[#2C1810]">
                                  {doc.documentType.charAt(0).toUpperCase() + doc.documentType.slice(1)}
                                </p>
                                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                                  doc.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                  doc.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {doc.verificationStatus}
                                </span>
                              </div>
                              <p className="text-sm text-[#4A4A4A] mt-1">{doc.filename}</p>
                              <p className="text-xs text-[#4A4A4A]">
                                Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                              </p>
                              {doc.rejectionReason && (
                                <p className="text-sm text-red-600 mt-2">
                                  <span className="font-medium">Reason:</span> {doc.rejectionReason}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <a
                            href={`http://localhost:5000${doc.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#B45F3A] hover:text-[#2C1810] text-sm font-medium"
                          >
                            View
                          </a>
                        </div>
                      </div>
                      
                      {/* Verification Actions */}
                      {doc.verificationStatus === 'PENDING' && (
                        <div className="mt-4 flex space-x-3 border-t pt-4">
                          <button
                            onClick={() => handleDocumentVerify(doc.documentId, 'APPROVED')}
                            disabled={updating}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 flex-1"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Enter rejection reason:');
                              if (reason) handleDocumentVerify(doc.documentId, 'REJECTED', reason);
                            }}
                            disabled={updating}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 flex-1"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Option to reset rejected documents */}
                      {doc.verificationStatus === 'REJECTED' && (
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => handleDocumentVerify(doc.documentId, 'PENDING')}
                            disabled={updating}
                            className="text-sm text-[#B45F3A] hover:text-[#2C1810]"
                          >
                            Reset to Pending
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Notes & History */}
          <div className="space-y-8">
            {/* Status History */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#2C1810] mb-4">Status History</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {application.statusHistory?.length === 0 ? (
                  <p className="text-[#4A4A4A] text-center">No history available</p>
                ) : (
                  application.statusHistory?.map((history, index) => (
                    <div key={index} className="border-l-4 border-[#B45F3A] pl-4">
                      <p className="font-medium text-[#2C1810]">
                        {history.status.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-[#4A4A4A]">
                        {new Date(history.changedAt).toLocaleString()}
                      </p>
                      {history.notes && (
                        <p className="text-sm mt-1 text-gray-600">{history.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Note */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#2C1810] mb-4">Add Note</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter your note here..."
                className="input-field w-full h-32 resize-none"
              />
              <button
                onClick={handleAddNote}
                disabled={!note.trim()}
                className="btn-primary w-full mt-4"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffReviewPage;