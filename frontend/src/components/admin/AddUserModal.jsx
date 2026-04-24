import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [landBoards, setLandBoards] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    omangNumber: '',
    phone: '',
    role: 'APPLICANT',
    landBoardId: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchLandBoards();
    }
  }, [isOpen]);

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

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[A-Z])/.test(formData.password)) newErrors.password = 'Password must contain an uppercase letter';
    else if (!/(?=.*[a-z])/.test(formData.password)) newErrors.password = 'Password must contain a lowercase letter';
    else if (!/(?=.*\d)/.test(formData.password)) newErrors.password = 'Password must contain a number';

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.omangNumber) newErrors.omangNumber = 'Omang number is required';
    else if (!/^\d{9}$/.test(formData.omangNumber)) newErrors.omangNumber = 'Omang must be 9 digits';

    if (formData.phone && !/^7\d{7}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 8 digits starting with 7';
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
      await api.post('/admin/users', {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        omangNumber: formData.omangNumber,
        phone: formData.phone,
        role: formData.role,
        landBoardId: formData.role !== 'APPLICANT' ? formData.landBoardId : null
      });
      addNotification('success', 'User created successfully');
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      addNotification('error', error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      omangNumber: '',
      phone: '',
      role: 'APPLICANT',
      landBoardId: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#2C1810]">Add New User</h2>
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
            <label className="input-label">Omang Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="omangNumber"
              value={formData.omangNumber}
              onChange={handleChange}
              maxLength="9"
              className={`input-field ${errors.omangNumber ? 'border-red-500' : ''}`}
            />
            {errors.omangNumber && <p className="text-red-500 text-sm mt-1">{errors.omangNumber}</p>}
          </div>

          <div>
            <label className="input-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength="8"
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
            <label className="input-label">Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`input-field ${errors.password ? 'border-red-500' : ''}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="input-label">Confirm Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;