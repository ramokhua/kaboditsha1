// frontend/src/components/auth/RegisterForm.jsx

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    omangNumber: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Omang validation (9 digits)
    const omangRegex = /^\d{9}$/;
    if (!omangRegex.test(formData.omangNumber)) {
      newErrors.omangNumber = 'Omang must be exactly 9 digits';
    }

    // Phone validation (Botswana format: 8 digits starting with 7)
    const phoneRegex = /^[7][0-9]{7}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone must be 8 digits starting with 7';
    }

    // Password validation
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (!result.success) {
      setErrors({ form: result.error });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5E6D3] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white p-10 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-[#2C1810]">Create Account</h2>
          <p className="mt-2 text-[#1A1A1A]">Join KaboDitsha today</p>
        </div>

        {errors.form && (
          <div className="alert-error mb-6">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`input-field ${errors.fullName ? 'border-[#B22222]' : ''}`}
                placeholder="Thabo Molefe"
              />
              {errors.fullName && (
                <p className="input-error">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${errors.email ? 'border-[#B22222]' : ''}`}
                placeholder="thabo.molefe@gmail.com"
              />
              {errors.email && (
                <p className="input-error">{errors.email}</p>
              )}
            </div>

            {/* Omang Number */}
            <div>
              <label className="input-label">Omang Number</label>
              <input
                type="text"
                name="omangNumber"
                value={formData.omangNumber}
                onChange={handleChange}
                maxLength="9"
                className={`input-field ${errors.omangNumber ? 'border-[#B22222]' : ''}`}
                placeholder="123456789"
              />
              {errors.omangNumber && (
                <p className="input-error">{errors.omangNumber}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="input-label">Phone Number (Optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength="8"
                className={`input-field ${errors.phone ? 'border-[#B22222]' : ''}`}
                placeholder="71234567"
              />
              {errors.phone && (
                <p className="input-error">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="input-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field ${errors.password ? 'border-[#B22222]' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="input-error">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="input-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-field ${errors.confirmPassword ? 'border-[#B22222]' : ''}`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="input-error">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="bg-[#2C1810]/5 p-4 rounded-lg border border-[#8B4513]/20">
            <p className="text-sm text-[#1A1A1A]">
              <span className="font-bold">Note:</span> By creating an account, you confirm that:
            </p>
            <ul className="list-disc list-inside text-sm text-[#1A1A1A] mt-2 space-y-1">
              <li>You are a Botswana citizen aged 18 years or older</li>
              <li>The Omang number provided is valid and belongs to you</li>
              <li>You have not been allocated a plot in the same settlement type</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="spinner w-5 h-5 mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-[#1A1A1A]">
            Already have an account?{' '}
            <button
              onClick={onToggleForm}
              className="font-semibold text-[#B45F3A] hover:text-[#2C1810] transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;