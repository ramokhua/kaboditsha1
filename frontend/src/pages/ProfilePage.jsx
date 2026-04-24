// frontend/src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    maritalStatus: '',
    spouseName: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');
      setProfile(response.data);
      setFormData({
        email: response.data.email || '',
        phone: response.data.phone || '',
        maritalStatus: response.data.maritalStatus || '',
        spouseName: response.data.spouseName || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      addNotification('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.phone && !/^7\d{7}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 8 digits starting with 7';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const response = await api.put('/users/profile', {
        email: formData.email,
        phone: formData.phone,
        maritalStatus: formData.maritalStatus,
        spouseName: formData.spouseName
      });
      
      setProfile(response.data.user);
      setEditing(false);
      addNotification('success', 'Profile updated successfully');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      addNotification('error', error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: profile?.email || '',
      phone: profile?.phone || '',
      maritalStatus: profile?.maritalStatus || '',
      spouseName: profile?.spouseName || ''
    });
    setEditing(false);
    setErrors({});
  };

  const maritalStatusOptions = [
    { value: 'SINGLE', label: 'Single' },
    { value: 'MARRIED', label: 'Married' },
    { value: 'DIVORCED', label: 'Divorced' },
    { value: 'SEPARATED', label: 'Separated' },
    { value: 'WIDOWED', label: 'Widowed' }
  ];

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-[#F5E6D3] py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Navigation Links */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            to="/dashboard" 
            className="text-[#B45F3A] hover:text-[#2C1810] flex items-center"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header with Edit Button */}
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#2C1810]">My Profile</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-[#B45F3A] text-white rounded-lg hover:bg-[#2C1810] transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {!editing ? (
              // View Mode
              <div className="space-y-6">
                {/* Read-only Section (Omang) */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Identity Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                      <p className="text-gray-900 font-medium">{profile?.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Omang Number</label>
                      <p className="text-gray-900 font-medium">{profile?.omangNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Editable Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact & Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                      <p className="text-gray-900">{profile?.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Phone Number</label>
                      <p className="text-gray-900">{profile?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Marital Status</label>
                      <p className="text-gray-900">
                        {profile?.maritalStatus ? maritalStatusOptions.find(s => s.value === profile.maritalStatus)?.label : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Spouse Name</label>
                      <p className="text-gray-900">{profile?.spouseName || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">User ID</label>
                      <p className="text-gray-600">{profile?.userNumber}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Role</label>
                      <p className="text-gray-600 capitalize">{profile?.role?.toLowerCase()}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Member Since</label>
                      <p className="text-gray-600">
                        {new Date(profile?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Last Updated</label>
                      <p className="text-gray-600">
                        {new Date(profile?.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-5">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Identity Information (Read-only)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                      <p className="text-gray-500">{profile?.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Omang Number</label>
                      <p className="text-gray-500">{profile?.omangNumber}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact & Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A] focus:border-transparent ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="your@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A] focus:border-transparent ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="71234567"
                        maxLength="8"
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      <p className="text-xs text-gray-500 mt-1">8-digit Botswana mobile number</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                      <select
                        value={formData.maritalStatus}
                        onChange={(e) => handleChange('maritalStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A] focus:border-transparent"
                      >
                        <option value="">Select marital status</option>
                        {maritalStatusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Spouse Name</label>
                      <input
                        type="text"
                        value={formData.spouseName}
                        onChange={(e) => handleChange('spouseName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A] focus:border-transparent"
                        placeholder="Spouse's full name"
                        disabled={formData.maritalStatus !== 'MARRIED'}
                      />
                      {formData.maritalStatus === 'MARRIED' && (
                        <p className="text-xs text-gray-500 mt-1">Required if married</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 bg-[#B45F3A] text-white rounded-lg hover:bg-[#2C1810] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;