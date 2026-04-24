// frontend/src/pages/LandBoardDirectoryPage.jsx

import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import api from '../services/api';

const LandBoardDirectoryPage = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      // Make sure this path is correct
      const response = await api.get('/landboards');
      console.log('API Response:', response.data); // Debug: check what returns
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
      console.error('Error details:', error.response); // Debug: see error details
    } finally {
      setLoading(false);
    }
  };

  const mainBoards = boards.filter(b => b.type === 'MAIN');
  const subBoards = boards.filter(b => b.type === 'SUBORDINATE');

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-white py-16 flex justify-center">
          <div className="animate-pulse text-[#2C1810]">Loading Land Boards...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-[#2C1810] mb-2">Land Board Directory</h1>
          <p className="text-gray-600 mb-8">Find your nearest Land Board office</p>

          {/* Filter Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`pb-2 px-4 font-medium transition-colors ${
                filter === 'all' 
                  ? 'text-[#B45F3A] border-b-2 border-[#B45F3A]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Boards ({boards.length})
            </button>
            <button
              onClick={() => setFilter('main')}
              className={`pb-2 px-4 font-medium transition-colors ${
                filter === 'main' 
                  ? 'text-[#B45F3A] border-b-2 border-[#B45F3A]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Main Boards ({mainBoards.length})
            </button>
            <button
              onClick={() => setFilter('sub')}
              className={`pb-2 px-4 font-medium transition-colors ${
                filter === 'sub' 
                  ? 'text-[#B45F3A] border-b-2 border-[#B45F3A]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Subordinate Boards ({subBoards.length})
            </button>
          </div>

          {/* Main Boards Section */}
          {(filter === 'all' || filter === 'main') && mainBoards.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#2C1810] mb-4 flex items-center gap-2">
                <span className="text-2xl">🏛️</span> Main Land Boards
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mainBoards.map(board => (
                  <div key={board.landBoardId} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-[#2C1810] text-lg">{board.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">Region: {board.region}</p>
                    {board.officeAddress && (
                      <p className="text-gray-600 text-sm mt-2">{board.officeAddress}</p>
                    )}
                    {board.contactInfo && (
                      <p className="text-gray-600 text-sm mt-1">{board.contactInfo}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subordinate Boards Section */}
          {(filter === 'all' || filter === 'sub') && subBoards.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-[#2C1810] mb-4 flex items-center gap-2">
                <span className="text-2xl">🏘️</span> Subordinate Land Boards
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subBoards.map(board => {
                  const parent = boards.find(b => b.landBoardId === board.parentBoardId);
                  return (
                    <div key={board.landBoardId} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
                      <h3 className="font-bold text-[#2C1810] text-lg">{board.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Under: {parent?.name || 'Unknown Main Board'}
                      </p>
                      <p className="text-gray-500 text-sm">Region: {board.region}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Show message if no boards */}
          {boards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No land boards found.</p>
              <p className="text-gray-400 text-sm mt-2">Make sure the backend server is running.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LandBoardDirectoryPage;