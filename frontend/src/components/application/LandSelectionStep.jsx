// src/components/application/LandSelectionStep.jsx

import React from 'react';

const PURPOSE_OPTIONS = [
  { value: 'residential', label: 'Residential' },
  { value: 'ploughing', label: 'Ploughing' },
  { value: 'cemetery', label: 'Cemetery' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'community', label: 'Community Project' },
  { value: 'other', label: 'Other (specify)' }
];

const SETTLEMENT_TYPES = [
  { value: 'TOWN', label: 'Town' },
  { value: 'VILLAGE', label: 'Village' },
  { value: 'FARM', label: 'Farm' }
];

const LandSelectionStep = ({ formData, onChange, errors, landBoards, loading }) => {
  const [otherPurpose, setOtherPurpose] = React.useState('');

  const handlePurposeChange = (e) => {
    const value = e.target.value;
    onChange('purpose', value);
    if (value !== 'other') {
      setOtherPurpose('');
    }
  };

  const handleOtherPurposeChange = (e) => {
    setOtherPurpose(e.target.value);
    onChange('purpose', `other: ${e.target.value}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#2C1810] mb-6">Land Selection</h2>
      
      {/* Land Board Selection */}
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
          Land Board <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.landBoardId}
          onChange={(e) => onChange('landBoardId', e.target.value)}
          className={`input-field ${errors.landBoardId ? 'border-red-500' : ''}`}
          disabled={loading}
        >
          <option value="">Select Land Board</option>
          {landBoards.map((board) => (
            <option key={board.landBoardId} value={board.landBoardId}>
              {board.name} - {board.region}
            </option>
          ))}
        </select>
        {errors.landBoardId && (
          <p className="text-red-500 text-sm mt-1">{errors.landBoardId}</p>
        )}
      </div>

      {/* Settlement Type */}
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
          Settlement Type <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.settlementType}
          onChange={(e) => onChange('settlementType', e.target.value)}
          className={`input-field ${errors.settlementType ? 'border-red-500' : ''}`}
        >
          <option value="">Select Settlement Type</option>
          {SETTLEMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.settlementType && (
          <p className="text-red-500 text-sm mt-1">{errors.settlementType}</p>
        )}
      </div>

      {/* Purpose Dropdown */}
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
          Proposed Use <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.purpose.split(':')[0] || ''}
          onChange={handlePurposeChange}
          className={`input-field ${errors.purpose ? 'border-red-500' : ''}`}
        >
          <option value="">Select Purpose</option>
          {PURPOSE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.purpose && (
          <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>
        )}
      </div>

      {/* Other Purpose Input (conditional) */}
      {formData.purpose.startsWith('other') && (
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
            Please specify <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={otherPurpose}
            onChange={handleOtherPurposeChange}
            placeholder="Enter purpose"
            className="input-field"
            maxLength="100"
          />
        </div>
      )}

      {/* Information Box */}
      <div className="mt-6 p-4 bg-[#F5E6D3] rounded-lg border border-[#8B4513]/20">
        <h3 className="font-semibold text-[#2C1810] mb-2">One-Plot-Per-Settlement Rule</h3>
        <p className="text-sm text-[#1A1A1A]">
          Please note: You can only have one active application per settlement type.
          If you already have a pending application for the selected settlement type,
          you will not be able to submit another.
        </p>
      </div>
    </div>
  );
};

export default LandSelectionStep;