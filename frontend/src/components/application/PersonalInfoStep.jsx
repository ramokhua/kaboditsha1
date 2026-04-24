// src/components/application/PersonalInfoStep.jsx

import React from 'react';

const MARITAL_STATUS_OPTIONS = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'SEPARATED', label: 'Separated' },
  { value: 'WIDOWED', label: 'Widowed' }
];

const PersonalInfoStep = ({ formData, onChange, errors }) => {
  const [showSpouseField, setShowSpouseField] = React.useState(
    formData.maritalStatus === 'MARRIED'
  );

  React.useEffect(() => {
    setShowSpouseField(formData.maritalStatus === 'MARRIED');
    if (formData.maritalStatus !== 'MARRIED') {
      onChange('spouseName', '');
    }
  }, [formData.maritalStatus]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#2C1810] mb-6">Personal Information</h2>
      
      {/* Full Name - Read Only from Omang */}
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.fullName}
          readOnly
          className="input-field bg-gray-100 cursor-not-allowed"
        />
        <p className="text-xs text-[#4A4A4A] mt-1">
          Name auto-populated from Omang record
        </p>
      </div>

      {/* Omang Number - Locked */}
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
          Omang Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.omangNumber}
          readOnly
          className="input-field bg-gray-100 cursor-not-allowed"
        />
        <p className="text-xs text-[#4A4A4A] mt-1">
          9-digit national ID (locked for security)
        </p>
      </div>

      {/* Email - MODIFIABLE */}
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          className={`input-field ${errors.email ? 'border-red-500' : ''}`}
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* Phone - MODIFIABLE */}
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
          placeholder="71234567"
          maxLength="8"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
        )}
        <p className="text-xs text-[#4A4A4A] mt-1">
          8-digit Botswana mobile number
        </p>
      </div>

      {/* Marital Status - NEW */}
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
          Marital Status <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.maritalStatus || ''}
          onChange={(e) => onChange('maritalStatus', e.target.value)}
          className={`input-field ${errors.maritalStatus ? 'border-red-500' : ''}`}
        >
          <option value="">Select marital status</option>
          {MARITAL_STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.maritalStatus && (
          <p className="text-red-500 text-sm mt-1">{errors.maritalStatus}</p>
        )}
      </div>

      {/* Spouse Name - Conditional */}
      {showSpouseField && (
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
            Spouse Name
          </label>
          <input
            type="text"
            value={formData.spouseName || ''}
            onChange={(e) => onChange('spouseName', e.target.value)}
            className="input-field"
            placeholder="Enter spouse's full name"
          />
          <p className="text-xs text-[#4A4A4A] mt-1">
            Required if married
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-[#F5E6D3] rounded-lg border border-[#8B4513]/20">
        <p className="text-sm text-[#1A1A1A]">
          <span className="font-bold">Note:</span> You can update your email, phone number, and marital status 
          later in your profile. Your Omang number is permanently locked for security.
        </p>
      </div>
    </div>
  );
};

export default PersonalInfoStep;