// frontend/src/pages/VerifyEmailPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    // Redirect to backend GET endpoint - backend will return HTML
    // The backend verifyEmail function handles the verification and returns HTML
    window.location.href = `http://localhost:5000/api/auth/verify-email?token=${token}`;
  }, [searchParams]);

  // This page will redirect to backend, so we show a loading state
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <Loader className="w-16 h-16 text-[#B45F3A] animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#2C1810] mb-2">Verifying Your Email</h2>
        <p className="text-gray-600">Please wait while we verify your account...</p>
        <p className="text-gray-400 text-sm mt-4">You will be redirected automatically.</p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;