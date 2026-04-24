// src/components/application/SuccessModal.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const SuccessModal = ({ isOpen, onClose, applicationNumber }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-[#2C1810] mb-2">Application Submitted!</h2>
        <p className="text-gray-600 mb-4">
          Your application has been successfully submitted.
        </p>
        
        {applicationNumber && (
          <div className="bg-gray-100 p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-500">Reference Number</p>
            <p className="text-lg font-mono font-bold text-[#2C1810]">{applicationNumber}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            You can track your application status in your dashboard.
            You will receive email notifications when your application is reviewed.
          </p>
          
          <div className="flex space-x-3">
            <Link
              to="/dashboard"
              className="flex-1 btn-primary text-center"
              onClick={onClose}
            >
              Go to Dashboard
            </Link>
            <button
              onClick={onClose}
              className="flex-1 btn-outline"
            >
              Stay Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;