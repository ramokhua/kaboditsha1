// frontend/src/components/queue/QueuePosition.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';

const QueuePosition = ({ applicationId, initialPosition }) => {
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQueueDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/queue/position/${applicationId}`);
        setQueueData(response.data);
      } catch (err) {
        console.error('Error fetching queue details:', err);
        setError('Failed to load queue position');
      } finally {
        setLoading(false);
      }
    };

    fetchQueueDetails();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchQueueDetails, 30000);
    return () => clearInterval(interval);
  }, [applicationId]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        {error}
      </div>
    );
  }

  const getProgressPercentage = () => {
    if (!queueData.totalWaiting) return 0;
    const ahead = queueData.applicationsAhead;
    const total = queueData.totalWaiting;
    return Math.round((ahead / total) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Queue Position: #{queueData.queuePosition}
      </h3>
      
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>You are here</span>
          <span>{queueData.applicationsAhead} ahead</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Front</span>
          <span>End</span>
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600">Total Waiting</p>
          <p className="text-2xl font-bold text-gray-900">{queueData.totalWaiting}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600">Ahead of You</p>
          <p className="text-2xl font-bold text-orange-600">{queueData.applicationsAhead}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600">Monthly Rate</p>
          <p className="text-xl font-bold text-green-600">{queueData.monthlyAllocationRate || 'N/A'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600">Est. Wait</p>
          <p className="text-xl font-bold text-purple-600">
            {queueData.estimatedMonths ? `${queueData.estimatedMonths} months` : 'N/A'}
          </p>
        </div>
      </div>
      
      {/* Application info */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Application:</span> {queueData.applicationNumber}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Land Board:</span> {queueData.landBoard}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Submitted:</span>{' '}
          {new Date(queueData.submittedAt).toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Updates refresh every 30 seconds
        </p>
      </div>
    </div>
  );
};

export default QueuePosition;