// frontend/src/components/queue/QueuePositionCard.jsx
import React from 'react';

const QueuePositionCard = ({ queueData }) => {
  if (!queueData) return null;

  const getProgressWidth = () => {
    if (queueData.totalWaiting === 0) return 0;
    return (queueData.applicationsAhead / queueData.totalWaiting) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-600">{queueData.settlementType}</p>
          <p className="text-xs text-gray-400">{queueData.landBoard}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">#{queueData.queuePosition}</p>
          <p className="text-xs text-gray-500">of {queueData.totalWaiting.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${getProgressWidth()}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">{queueData.applicationsAhead} ahead</span>
        <span className="text-purple-600 font-medium">
          {queueData.estimatedMonths ? `~${queueData.estimatedMonths} months` : 'Est. wait N/A'}
        </span>
      </div>
    </div>
  );
};

export default QueuePositionCard;