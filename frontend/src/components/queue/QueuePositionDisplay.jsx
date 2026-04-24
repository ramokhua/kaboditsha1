// frontend/src/components/queue/QueuePositionDisplay.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const QueuePositionDisplay = ({ applicationId, initialPosition }) => {
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQueueDetails();
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchQueueDetails, 30000);
    return () => clearInterval(interval);
  }, [applicationId]);

  const fetchQueueDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/waiting-list/queue/position/${applicationId}`);
      setQueueData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching queue details:', err);
      setError('Failed to load queue position');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-6">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-600">
        {error}
      </div>
    );
  }

  if (!queueData) {
    return null;
  }

  const getProgressWidth = () => {
    if (queueData.totalWaiting === 0) return 0;
    const percentAhead = (queueData.applicationsAhead / queueData.totalWaiting) * 100;
    return Math.min(100, percentAhead);
  };

  const getPositionColor = () => {
    if (queueData.queuePosition <= queueData.totalWaiting * 0.2) return 'text-green-600';
    if (queueData.queuePosition <= queueData.totalWaiting * 0.5) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Queue Position</h3>
        <p className="text-sm text-gray-600">{queueData.landBoard} - {queueData.settlementType}</p>
      </div>

      {/* Main Position Display */}
      <div className="p-6">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-2">Your Position</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className={`text-5xl font-bold ${getPositionColor()}`}>
              #{queueData.queuePosition}
            </span>
            <span className="text-xl text-gray-400">of</span>
            <span className="text-3xl font-semibold text-gray-700">
              {queueData.totalWaiting.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">applicants waiting</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Behind you: {queueData.applicationsAhead.toLocaleString()}</span>
            <span>Ahead of you: {queueData.applicationsAhead.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-500 relative"
              style={{ width: `${getProgressWidth()}%` }}
            >
              <div className="absolute inset-0 bg-blue-400 opacity-50 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Front of queue</span>
            <span>{queueData.percentThrough}% through</span>
            <span>End of queue</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Monthly Allocations</p>
            <p className="text-xl font-bold text-green-600">
              {queueData.monthlyAllocationRate || 'N/A'}
            </p>
            <p className="text-xs text-gray-400">applications/month</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Estimated Wait</p>
            <p className="text-xl font-bold text-purple-600">
              {queueData.estimatedMonths ? `${queueData.estimatedMonths} months` : 'N/A'}
            </p>
            {queueData.estimatedDate && (
              <p className="text-xs text-gray-400">
                ~ {new Date(queueData.estimatedDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Application Status</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
              queueData.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
              queueData.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
              queueData.status === 'DOCUMENTS_VERIFIED' ? 'bg-green-100 text-green-800' :
              queueData.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
              'bg-red-100 text-red-800'
            }`}>
              {queueData.status.replace('_', ' ')}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Submitted</p>
            <p className="text-sm font-medium text-gray-700">
              {new Date(queueData.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 Your queue position updates in real-time. As applications ahead are processed, 
            your position will automatically move forward. Check back regularly for updates.
          </p>
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">
            Auto-refreshes every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QueuePositionDisplay;