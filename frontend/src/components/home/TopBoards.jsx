// frontend/src/components/home/TopBoards.jsx

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';

const TopBoards = () => {
  const [boardPerformance, setBoardPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchBoardData();
  }, []);

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const statsResponse = await api.get('/waiting-list/stats');
      const waitingStats = statsResponse.data;
      
      const boardData = waitingStats.map(board => ({
        name: board.boardName,
        pending: board.totalWaiting,
        region: board.region
      })).sort((a, b) => b.pending - a.pending).slice(0, 10);
      
      setBoardPerformance(boardData);
    } catch (error) {
      console.error('Error fetching board data:', error);
      addNotification('error', 'Failed to load board statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center">
          <LoadingSpinner text="Loading board data..." />
        </div>
      </div>
    );
  }

  const maxPending = Math.max(...boardPerformance.map(b => b.pending));
  const totalPending = boardPerformance.reduce((sum, b) => sum + b.pending, 0);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2C1810] flex items-center gap-2">
          <span className="text-3xl">🏆</span>
          Top 10 Land Boards by Waiting List
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Boards with highest application volumes - Updated in real-time
        </p>
      </div>
      
      <div className="space-y-4">
        {boardPerformance.map((board, idx) => {
          const percentage = (board.pending / maxPending) * 100;
          // Color coding based on rank
          let rankColor = 'from-[#2C1810] to-[#B45F3A]';
          return (
            <div key={idx} className="relative group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                    ${idx === 0 ? 'bg-yellow-500 text-white' : 
                      idx === 1 ? 'bg-gray-400 text-white' : 
                      idx === 2 ? 'bg-amber-600 text-white' : 
                      'bg-gray-200 text-gray-600'}
                  `}>
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-gray-800">{board.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                    {board.region || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Total:</span>
                  <span className="font-bold text-[#B45F3A]">{board.pending.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className={`bg-gradient-to-r ${rankColor} h-3 rounded-full transition-all duration-700 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-[#2C1810] text-white text-xs rounded-lg px-3 py-1.5 shadow-lg whitespace-nowrap z-10">
                  {Math.round(percentage)}% of highest ({maxPending.toLocaleString()})
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#2C1810] to-[#B45F3A]"></div>
            <span className="text-gray-500">Highest volume indicator</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg text-[#2C1810]">{totalPending.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total pending across top 10 boards</div>
          </div>
        </div>
      </div>
      
      {/* Insight note */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-start gap-2">
          <span className="text-blue-500 text-sm">💡</span>
          <p className="text-xs text-blue-700">
            Applicants can use this information to make informed decisions about where to apply. 
            Boards with shorter waiting lists may offer faster processing times.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopBoards;