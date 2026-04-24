// frontend/src/pages/AdminPage.jsx

import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SearchBar from '../components/common/SearchBar';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [landBoards, setLandBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [usersRes, boardsRes, logsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/landboards'),
        api.get('/admin/audit-logs')
      ]);
      setUsers(usersRes.data);
      setFilteredUsers(usersRes.data);
      setLandBoards(boardsRes.data);
      setFilteredBoards(boardsRes.data);
      setAuditLogs(logsRes.data);
      setFilteredLogs(logsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      addNotification('error', 'Failed to load admin data');
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
      user.role?.toLowerCase().includes(lowerTerm) ||
      user.phone?.includes(term)
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
      board.region?.toLowerCase().includes(lowerTerm) ||
      board.type?.toLowerCase().includes(lowerTerm)
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
      log.user?.email?.toLowerCase().includes(lowerTerm) ||
      log.ipAddress?.includes(term)
    );
    setFilteredLogs(filtered);
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading admin dashboard..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#F5E6D3] py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-[#2C1810] mb-8">Admin Dashboard</h1>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-[#B45F3A] border-b-2 border-[#B45F3A]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Users ({filteredUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('boards')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'boards'
                  ? 'text-[#B45F3A] border-b-2 border-[#B45F3A]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Land Boards ({filteredBoards.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'audit'
                  ? 'text-[#B45F3A] border-b-2 border-[#B45F3A]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Audit Logs ({filteredLogs.length})
            </button>
          </div>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#2C1810]">User Management</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Total: {filteredUsers.length} users
                    {searchTerm && ` (filtered from ${users.length})`}
                  </p>
                </div>
                <div className="w-80">
                  <SearchBar
                    onSearch={handleUserSearch}
                    placeholder="Search by name, email, role..."
                  />
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
                    {filteredUsers.map((user) => (
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
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No users found matching your search
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Land Boards Tab */}
          {activeTab === 'boards' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#2C1810]">Land Board Management</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Total: {filteredBoards.length} boards
                    {searchTerm && ` (filtered from ${landBoards.length})`}
                  </p>
                </div>
                <div className="w-80">
                  <SearchBar
                    onSearch={handleBoardSearch}
                    placeholder="Search by name, region..."
                  />
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
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            board.type === 'MAIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
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
                {filteredBoards.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No land boards found matching your search
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#2C1810]">Audit Logs</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Total: {filteredLogs.length} logs
                    {searchTerm && ` (filtered from ${auditLogs.length})`}
                  </p>
                </div>
                <div className="w-80">
                  <SearchBar
                    onSearch={handleLogSearch}
                    placeholder="Search by action, user, IP..."
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ipAddress || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No audit logs found matching your search
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;