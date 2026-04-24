import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

const EditUserModal = ({ isOpen, onClose, onSuccess, user }) => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [landBoards, setLandBoards] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    role: '',
    landBoardId: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && user) {
      fetchLandBoards();
      setFormData({
        email: user.email || '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        role: user.role || 'APPLICANT',
        landBoardId: user.landBoardId || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [isOpen, user]);

  const fetchLandBoards = async () => {
    try {
      const response = await api.get('/admin/landboards');
      setLandBoards(response.data.filter(b => b.type === 'MAIN'));
    } catch (error) {
      console.error('Error fetching land boards:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.fullName) newErrors.fullName = 'Full name is required';

    if (formData.phone && !/^7\d{7}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 8 digits starting with 7';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.role !== 'APPLICANT' && !formData.landBoardId) {
      newErrors.landBoardId = 'Please select a land board for staff/manager';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role,
        landBoardId: formData.role !== 'APPLICANT' ? formData.landBoardId : null
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      await api.put(`/admin/users/${user.userId}`, updateData);
      addNotification('success', 'User updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      addNotification('error', error.response?.data?.error || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#2C1810]">Edit User</h2>
          <p className="text-sm text-[#4A4A4A]">Editing: {user?.fullName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="input-label">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`input-field ${errors.fullName ? 'border-red-500' : ''}`}
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="input-label">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="input-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="71234567"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="input-label">Role <span className="text-red-500">*</span></label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="APPLICANT">Applicant</option>
              <option value="STAFF">Staff</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {formData.role !== 'APPLICANT' && (
            <div>
              <label className="input-label">Land Board <span className="text-red-500">*</span></label>
              <select
                name="landBoardId"
                value={formData.landBoardId}
                onChange={handleChange}
                className={`input-field ${errors.landBoardId ? 'border-red-500' : ''}`}
              >
                <option value="">Select Land Board</option>
                {landBoards.map(board => (
                  <option key={board.landBoardId} value={board.landBoardId}>
                    {board.name} - {board.region}
                  </option>
                ))}
              </select>
              {errors.landBoardId && <p className="text-red-500 text-sm mt-1">{errors.landBoardId}</p>}
            </div>
          )}

          <div>
            <label className="input-label">New Password (leave blank to keep current)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="input-label">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;