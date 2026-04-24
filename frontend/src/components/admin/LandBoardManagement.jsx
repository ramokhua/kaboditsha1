import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal';

const LandBoardManagement = () => {
  const { addNotification } = useNotifications();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    type: 'MAIN',
    jurisdiction: '',
    officeAddress: '',
    contactInfo: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/landboards');
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching land boards:', error);
      addNotification('error', 'Failed to load land boards');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.region) newErrors.region = 'Region is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    try {
      await api.post('/admin/landboards', formData);
      addNotification('success', 'Land board created successfully');
      fetchBoards();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      addNotification('error', error.response?.data?.error || 'Failed to create land board');
    }
  };

  const handleEdit = async () => {
    if (!validateForm()) return;
    try {
      await api.put(`/admin/landboards/${selectedBoard.landBoardId}`, formData);
      addNotification('success', 'Land board updated successfully');
      fetchBoards();
      setShowEditModal(false);
      setSelectedBoard(null);
      resetForm();
    } catch (error) {
      addNotification('error', error.response?.data?.error || 'Failed to update land board');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/landboards/${selectedBoard.landBoardId}`);
      addNotification('success', 'Land board deleted successfully');
      fetchBoards();
      setShowDeleteModal(false);
      setSelectedBoard(null);
    } catch (error) {
      addNotification('error', error.response?.data?.error || 'Failed to delete land board');
    }
  };

  const openEditModal = (board) => {
    setSelectedBoard(board);
    setFormData({
      name: board.name,
      region: board.region,
      type: board.type,
      jurisdiction: board.jurisdiction || '',
      officeAddress: board.officeAddress || '',
      contactInfo: board.contactInfo || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      region: '',
      type: 'MAIN',
      jurisdiction: '',
      officeAddress: '',
      contactInfo: ''
    });
    setErrors({});
  };

  if (loading) {
    return <LoadingSpinner text="Loading land boards..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#2C1810]">Land Board Management</h2>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          ➕ Add Land Board
        </button>
      </div>

      <div className="space-y-4">
        {boards.map((board) => (
          <div
            key={board.landBoardId}
            className="border border-[#8B4513]/20 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-[#2C1810]">{board.name}</h3>
                <p className="text-sm text-[#4A4A4A]">{board.boardNumber}</p>
                <p className="text-sm text-[#4A4A4A]">Region: {board.region}</p>
                <p className="text-sm text-[#4A4A4A]">Type: {board.type}</p>
                {board.jurisdiction && (
                  <p className="text-sm text-[#4A4A4A]">Jurisdiction: {board.jurisdiction}</p>
                )}
                {board.officeAddress && (
                  <p className="text-sm text-[#4A4A4A]">Office: {board.officeAddress}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-[#4A4A4A]">Applications</p>
                <p className="text-xl font-bold text-[#B45F3A]">{board._count?.applications || 0}</p>
                <p className="text-sm text-[#4A4A4A] mt-2">Staff: {board._count?.staff || 0}</p>
                <div className="mt-3 space-x-2">
                  <button
                    onClick={() => openEditModal(board)}
                    className="text-[#B45F3A] hover:text-[#2C1810] text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBoard(board);
                      setShowDeleteModal(true);
                    }}
                    className="text-[#B22222] hover:text-[#2C1810] text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#2C1810]">Add Land Board</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="input-label">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
              <div>
                <label className="input-label">Region *</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className={`input-field ${errors.region ? 'border-red-500' : ''}`}
                />
              </div>
              <div>
                <label className="input-label">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                >
                  <option value="MAIN">Main Board</option>
                  <option value="SUBORDINATE">Subordinate Board</option>
                </select>
              </div>
              <div>
                <label className="input-label">Jurisdiction</label>
                <textarea
                  value={formData.jurisdiction}
                  onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                  className="input-field"
                  rows="2"
                />
              </div>
              <div>
                <label className="input-label">Office Address</label>
                <input
                  type="text"
                  value={formData.officeAddress}
                  onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Contact Info</label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button onClick={() => setShowAddModal(false)} className="btn-outline">
                  Cancel
                </button>
                <button onClick={handleAdd} className="btn-primary">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#2C1810]">Edit Land Board</h2>
              <p className="text-sm text-[#4A4A4A]">Editing: {selectedBoard?.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="input-label">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Region *</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                  disabled
                >
                  <option value="MAIN">Main Board</option>
                  <option value="SUBORDINATE">Subordinate Board</option>
                </select>
              </div>
              <div>
                <label className="input-label">Jurisdiction</label>
                <textarea
                  value={formData.jurisdiction}
                  onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                  className="input-field"
                  rows="2"
                />
              </div>
              <div>
                <label className="input-label">Office Address</label>
                <input
                  type="text"
                  value={formData.officeAddress}
                  onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Contact Info</label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button onClick={() => setShowEditModal(false)} className="btn-outline">
                  Cancel
                </button>
                <button onClick={handleEdit} className="btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Land Board"
        message={`Are you sure you want to delete ${selectedBoard?.name}? This will remove all associated data.`}
      />
    </div>
  );
};

export default LandBoardManagement;