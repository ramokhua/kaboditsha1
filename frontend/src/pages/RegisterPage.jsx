// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const RegisterPage = () => {
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const navigate = useNavigate();

  const validateOmang = (omang) => {
    return /^\d{9}$/.test(omang);
  };

  const validatePhone = (phone) => {
    if (!phone) return true;
    return /^[7]\d{7}$/.test(phone);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validateOmang(formData.omangNumber)) {
      newErrors.omangNumber = 'Omang must be exactly 9 digits';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Phone must be 8 digits starting with 7';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

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
    
    try {
      const { confirmPassword, ...userData } = formData;
      const response = await api.post('/auth/register', userData);
      
      if (response.data.message || response.data.requiresVerification) {
        setRegisteredEmail(formData.email);
        setSuccessMessage(response.data.message || 'Account created successfully! Please check your email to verify your account.');
        setShowSuccessModal(true);
        
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          omangNumber: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setErrors({ 
        form: error.response?.data?.error || 'Registration failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
          <div className="max-w-2xl w-full bg-white p-10 rounded-xl shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-[#2C1810]">Create Account</h2>
              <p className="mt-2 text-gray-600">Join KaboDitsha today</p>
            </div>

            {errors.form && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A] ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Thabo Molefe"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A] ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="thabo.molefe@gmail.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Omang Number *</label>
                  <input
                    type="text"
                    name="omangNumber"
                    value={formData.omangNumber}
                    onChange={handleChange}
                    maxLength="9"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A] ${
                      errors.omangNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123456789"
                  />
                  {errors.omangNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.omangNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength="8"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A] ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="71234567"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A] ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A] ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="bg-[#2C1810]/5 p-4 rounded-lg border border-[#8B4513]/20">
                <p className="text-sm text-gray-700">
                  <span className="font-bold">Note:</span> By creating an account, you confirm that:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  <li>You are a Botswana citizen aged 18 years or older</li>
                  <li>The Omang number provided is valid and belongs to you</li>
                  <li>You have not been allocated a plot in the same settlement type</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#2C1810] to-[#B45F3A] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[#B45F3A] hover:text-[#2C1810] transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Layout>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center transform animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-[#2C1810] mb-2">Registration Successful!</h3>
            <p className="text-gray-600 mb-4">{successMessage}</p>
            {registeredEmail && (
              <div className="bg-blue-50 p-3 rounded-lg mb-6">
                <p className="text-sm text-blue-700">
                  📧 Verification email sent to:<br />
                  <strong>{registeredEmail}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Check your spam folder if you don't see it in your inbox.
                </p>
              </div>
            )}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/login');
                }}
                className="w-full bg-gradient-to-r from-[#2C1810] to-[#B45F3A] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Go to Login
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisterPage;