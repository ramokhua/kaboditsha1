// src/components/application/ApplicationForm.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';
import PersonalInfoStep from './PersonalInfoStep';
import LandSelectionStep from './LandSelectionStep';
import DocumentUpload from './DocumentUpload';
import ReviewStep from './ReviewStep';
import StepIndicator from './StepIndicator';
import SuccessModal from './SuccessModal';

const REQUIRED_DOCUMENTS = ['omang'];

const ApplicationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const [landBoards, setLandBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploadedDocTypes, setUploadedDocTypes] = useState(new Set());
  const [tempDocIds, setTempDocIds] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedApplicationNumber, setSubmittedApplicationNumber] = useState(null);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    omangNumber: user?.omangNumber || '',
    maritalStatus: user?.maritalStatus || '',
    spouseName: user?.spouseName || '',
    landBoardId: '',
    settlementType: '',
    purpose: '',
    landBoardName: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchLandBoards();
  }, []);

  const fetchLandBoards = async () => {
    try {
      setLoading(true);
      const response = await api.get('/landboards');
      setLandBoards(response.data.filter(b => b.type === 'MAIN'));
    } catch (error) {
      addNotification('error', 'Failed to load land boards');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (formData.phone && !/^7\d{7}$/.test(formData.phone)) {
        newErrors.phone = 'Phone must be 8 digits starting with 7';
      }
    }

    if (step === 2) {
      if (!formData.landBoardId) newErrors.landBoardId = 'Please select a land board';
      if (!formData.settlementType) newErrors.settlementType = 'Please select settlement type';
      if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        const selectedBoard = landBoards.find(b => b.landBoardId === formData.landBoardId);
        setFormData(prev => ({ ...prev, landBoardName: selectedBoard?.name }));
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleUploadComplete = (doc) => {
    setUploadedDocs(prev => [...prev, doc]);
    setUploadedDocTypes(prev => new Set([...prev, doc.documentType]));
    if (doc.tempId) {
      setTempDocIds(prev => [...prev, doc.tempId]);
    }
    addNotification('success', 'Document uploaded successfully');
  };

  const handleFinalSubmit = async () => {
    const missingRequired = REQUIRED_DOCUMENTS.filter(
      docType => !uploadedDocTypes.has(docType)
    );

    if (missingRequired.length > 0) {
      const missingNames = missingRequired.map(doc => {
        const docMap = { 'omang': 'Certified Copy of Omang' };
        return docMap[doc] || doc;
      }).join(', ');
      
      addNotification('error', `Please upload required documents: ${missingNames}`);
      return;
    }

    setSubmitting(true);
    try {
      const createResponse = await api.post('/applications', {
        landBoardId: formData.landBoardId,
        settlementType: formData.settlementType,
        purpose: formData.purpose,
        tempDocIds: tempDocIds
      });
      
      const newApplicationNumber = createResponse.data.applicationNumber;
      setSubmittedApplicationNumber(newApplicationNumber);
      
      addNotification('success', 'Application submitted successfully!');
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      addNotification('error', error.response?.data?.error || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };
  
  const steps = [
    { number: 1, name: 'Personal Information' },
    { number: 2, name: 'Land Selection' },
    { number: 3, name: 'Upload Documents' },
    { number: 4, name: 'Review & Submit' }
  ];

  const hasRequiredDocuments = () => {
    return REQUIRED_DOCUMENTS.every(docType => uploadedDocTypes.has(docType));
  };

  const canProceedToReview = () => {
    return hasRequiredDocuments();
  };

  return (
    <div className="min-h-screen bg-[#F5E6D3] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <StepIndicator currentStep={currentStep} steps={steps} />

        <div className="bg-white rounded-xl shadow-2xl p-8">
          {currentStep === 1 && (
            <PersonalInfoStep
              formData={formData}
              onChange={handleChange}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <LandSelectionStep
              formData={formData}
              onChange={handleChange}
              errors={errors}
              landBoards={landBoards}
              loading={loading}
            />
          )}

          {currentStep === 3 && (
            <DocumentUpload
              onUploadComplete={handleUploadComplete}
              uploadedDocTypes={uploadedDocTypes}
            />
          )}

          {currentStep === 4 && (
            <ReviewStep
              formData={formData}
              uploadedDocs={uploadedDocs}
              onSubmit={handleFinalSubmit}
              onBack={() => setCurrentStep(3)}
              submitting={submitting}
            />
          )}

          {currentStep < 4 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'btn-outline'
                }`}
              >
                ← Back
              </button>
              
              {currentStep === 3 ? (
                <button
                  onClick={() => setCurrentStep(4)}
                  disabled={!canProceedToReview() || submitting}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    canProceedToReview() && !submitting
                      ? 'btn-primary'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Review Application →
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={submitting || (currentStep === 2 && loading)}
                  className="btn-primary"
                >
                  Next →
                </button>
              )}
            </div>
          )}

          {currentStep === 3 && !canProceedToReview() && (
            <div className="mt-4 text-center">
              <p className="text-sm text-red-600">
                ⚠️ Please upload your certified Omang copy before continuing
              </p>
            </div>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            navigate('/applications');
          }}
          applicationNumber={submittedApplicationNumber}
        />
      )}
    </div>
  );
};

export default ApplicationForm;