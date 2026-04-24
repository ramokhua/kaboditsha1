// src/components/application/ReviewStep.jsx

import React, { useState } from 'react';

const ReviewStep = ({ formData, uploadedDocs, onSubmit, onBack, submitting }) => {
  const [editingSection, setEditingSection] = useState(null);
  
  const purposeMap = {
    residential: 'Residential',
    ploughing: 'Ploughing',
    cemetery: 'Cemetery',
    commercial: 'Commercial',
    community: 'Community Project',
  };

  const getPurposeLabel = (purpose) => {
    if (purpose?.startsWith('other:')) {
      return `Other: ${purpose.replace('other:', '')}`;
    }
    return purposeMap[purpose] || purpose;
  };

  const getDocName = (docType) => {
    const names = {
      omang: 'Certified Copy of Omang',
      marriage: 'Marriage Certificate',
      affidavit: 'Affidavit',
      proof: 'Proof of Residence'
    };
    return names[docType] || docType;
  };

  const sections = [
    { id: 'personal', name: 'Personal Information'},
    { id: 'land', name: 'Land Details' },
    { id: 'documents', name: 'Documents'}
  ];

  const getSectionContent = (sectionId) => {
    switch(sectionId) {
      case 'personal':
        return (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Full Name</p>
              <p className="font-medium text-gray-900">{formData.fullName}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Omang Number</p>
              <p className="font-medium text-gray-900">{formData.omangNumber}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Email</p>
              <p className="font-medium text-gray-900">{formData.email}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Phone</p>
              <p className="font-medium text-gray-900">{formData.phone}</p>
            </div>
            {formData.maritalStatus && (
              <div className="col-span-2">
                <p className="text-gray-500 text-xs">Marital Status</p>
                <p className="font-medium text-gray-900">{formData.maritalStatus}</p>
                {formData.spouseName && (
                  <p className="text-sm text-gray-600 mt-1">Spouse: {formData.spouseName}</p>
                )}
              </div>
            )}
          </div>
        );
      case 'land':
        return (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2">
              <p className="text-gray-500 text-xs">Land Board</p>
              <p className="font-medium text-gray-900">{formData.landBoardName}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Settlement Type</p>
              <p className="font-medium text-gray-900">{formData.settlementType}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 text-xs">Purpose</p>
              <p className="font-medium text-gray-900">{getPurposeLabel(formData.purpose)}</p>
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="space-y-2">
            {uploadedDocs.length === 0 ? (
              <p className="text-sm text-red-600">No documents uploaded yet</p>
            ) : (
              uploadedDocs.map((doc, index) => (
                <div key={index} className="flex items-center text-sm p-2 bg-gray-50 rounded">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">{getDocName(doc.documentType)}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const hasOmang = uploadedDocs.some(doc => doc.documentType === 'omang');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2C1810]">Review Your Application</h2>
        <div className="text-sm text-gray-500">Please verify all information</div>
      </div>
      
      {/* Review Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b">
              <div className="flex items-center">
                <span className="text-xl mr-2">{section.icon}</span>
                <h3 className="font-semibold text-gray-900">{section.name}</h3>
              </div>
              <button
                onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                className="text-sm text-[#B45F3A] hover:text-[#2C1810]"
              >
                {editingSection === section.id ? 'Done' : 'Edit'}
              </button>
            </div>
            <div className="p-4">
              {getSectionContent(section.id)}
              {editingSection === section.id && (
                <div className="mt-4 pt-4 border-t border-dashed">
                  <p className="text-sm text-gray-500 mb-2">
                    {section.id === 'personal' && "To update personal information, go to your Profile page"}
                    {section.id === 'land' && "To change land selection, click Back to modify"}
                    {section.id === 'documents' && "To add/remove documents, click Back to upload"}
                  </p>
                  <button
                    onClick={() => {
                      if (section.id === 'land') onBack();
                      if (section.id === 'documents') onBack();
                      if (section.id === 'personal') window.location.href = '/profile';
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {section.id === 'personal' ? 'Go to Profile →' : 
                     section.id === 'land' ? 'Back to Land Selection →' : 
                     'Back to Document Upload →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Declaration */}
      <div className="bg-[#F5E6D3] p-4 rounded-lg border border-[#8B4513]/20">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="declaration"
            className="mt-0.5 mr-3"
            required
          />
          <label htmlFor="declaration" className="text-sm text-gray-700">
            I declare that all information provided is true and correct to the best of my knowledge. 
            I understand that providing false information may result in rejection of my application 
            and/or legal prosecution under the Tribal Land Act (Cap 32:02).
          </label>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
          <span className="text-lg mr-2">📋</span>
          Application Summary
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-blue-600">Documents Uploaded</p>
            <p className="font-semibold text-blue-900">{uploadedDocs.length} files</p>
          </div>
          <div>
            <p className="text-blue-600">Required Documents</p>
            <p className="font-semibold text-blue-900">
              {hasOmang ? '✓ Complete' : '✗ Missing Omang'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          disabled={submitting}
          className="px-6 py-3 rounded-lg font-semibold btn-outline"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting || !hasOmang}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
            submitting || !hasOmang
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {submitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Application'
          )}
        </button>
      </div>
      
      {!hasOmang && (
        <p className="text-sm text-red-600 text-center">
          ⚠️ Please upload your certified Omang copy to submit
        </p>
      )}
    </div>
  );
};

export default ReviewStep;