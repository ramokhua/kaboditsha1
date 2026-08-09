// frontend/src/components/dashboard/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import SearchBar from '../common/SearchBar';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [landBoards, setLandBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [usersRes, boardsRes, logsRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/landboards'),
        api.get('/admin/audit-logs'),
        api.get('/admin/stats')
      ]);
      setUsers(usersRes.data);
      setFilteredUsers(usersRes.data);
      setLandBoards(boardsRes.data);
      setFilteredBoards(boardsRes.data);
      setAuditLogs(logsRes.data);
      setFilteredLogs(logsRes.data);
      setSystemStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredUsers(users);
      return;
    }
    const lowerTerm = term.toLowerCase();
    const filtered = users.filter(user => 
      user.fullName?.toLowerCase().includes(lowerTerm) ||
      user.email?.toLowerCase().includes(lowerTerm) ||
      user.userNumber?.toLowerCase().includes(lowerTerm) ||
      user.role?.toLowerCase().includes(lowerTerm)
    );
    setFilteredUsers(filtered);
  };

  const handleBoardSearch = (term) => {
    if (!term.trim()) {
      setFilteredBoards(landBoards);
      return;
    }
    const lowerTerm = term.toLowerCase();
    const filtered = landBoards.filter(board => 
      board.name?.toLowerCase().includes(lowerTerm) ||
      board.region?.toLowerCase().includes(lowerTerm)
    );
    setFilteredBoards(filtered);
  };

  const handleLogSearch = (term) => {
    if (!term.trim()) {
      setFilteredLogs(auditLogs);
      return;
    }
    const lowerTerm = term.toLowerCase();
    const filtered = auditLogs.filter(log => 
      log.action?.toLowerCase().includes(lowerTerm) ||
      log.user?.email?.toLowerCase().includes(lowerTerm)
    );
    setFilteredLogs(filtered);
  };

  if (loading) {
    return <LoadingSpinner text="Loading admin dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-[#F5E6D3] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#2C1810] mb-8">Admin Dashboard</h1>

        {/* Top Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-[#B45F3A] text-[#B45F3A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Users
              <span className="ml-2 text-xs text-gray-400">({filteredUsers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('boards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'boards'
                  ? 'border-[#B45F3A] text-[#B45F3A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏛️ Land Boards
              <span className="ml-2 text-xs text-gray-400">({filteredBoards.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'audit'
                  ? 'border-[#B45F3A] text-[#B45F3A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Audit Logs
              <span className="ml-2 text-xs text-gray-400">({filteredLogs.length})</span>
            </button>
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#2C1810]">User Management</h2>
                <p className="text-sm text-gray-500 mt-1">Manage system users and their roles</p>
              </div>
              <div className="w-80">
                <SearchBar onSearch={handleUserSearch} placeholder="Search by name, email, role..." />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.slice(0, 50).map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">ID: {user.userNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'STAFF' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-[#B45F3A] hover:text-[#2C1810]">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className="text-center py-8 text-gray-500">No users found</div>}
            </div>
          </div>
        )}

        {/* Land Boards Tab */}
        {activeTab === 'boards' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#2C1810]">Land Board Management</h2>
                <p className="text-sm text-gray-500 mt-1">Manage land boards and subordinate boards</p>
              </div>
              <div className="w-80">
                <SearchBar onSearch={handleBoardSearch} placeholder="Search by name, region..." />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBoards.map((board) => (
                    <tr key={board.landBoardId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{board.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{board.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${board.type === 'MAIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                          {board.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-[#B45F3A] hover:text-[#2C1810]">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBoards.length === 0 && <div className="text-center py-8 text-gray-500">No boards found</div>}
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#2C1810]">Audit Logs</h2>
                <p className="text-sm text-gray-500 mt-1">Track all system actions</p>
              </div>
              <div className="w-80">
                <SearchBar onSearch={handleLogSearch} placeholder="Search by action, user..." />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.slice(0, 50).map((log) => (
                    <tr key={log.auditLogId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.user?.email || 'System'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                        {log.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLogs.length === 0 && <div className="text-center py-8 text-gray-500">No logs found</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;