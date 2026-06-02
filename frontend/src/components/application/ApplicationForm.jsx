import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';
import PersonalInfoStep from './PersonalInfoStep';
import LandSelectionStep from './LandSelectionStep';
import DocumentUpload from './DocumentUpload';
import ReviewStep from './ReviewStep';
import SuccessModal from './SuccessModal';

const REQUIRED_DOCUMENTS = ['omang'];

const ApplicationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resume');
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
  const [draftId, setDraftId] = useState(null);
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
    if (resumeId) {
      loadSpecificDraft(resumeId);
    } else {
      loadDraft();
    }
  }, [resumeId]);

  // Auto-save draft to backend every 30 seconds
  useEffect(() => {
    if (currentStep > 1 && currentStep < 4 && formData.landBoardId) {
      const interval = setInterval(() => {
        saveDraftToBackend();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [formData, uploadedDocs, uploadedDocTypes, tempDocIds, currentStep, draftId]);

  const saveDraftToBackend = async () => {
    try {
      const draftData = {
        landBoardId: formData.landBoardId,
        settlementType: formData.settlementType,
        purpose: formData.purpose,
        tempDocIds: tempDocIds,
        maritalStatus: formData.maritalStatus,
        spouseName: formData.spouseName,
        email: formData.email,
        phone: formData.phone,
        currentStep: currentStep
      };

      if (draftId) {
        await api.put(`/applications/draft/${draftId}`, draftData);
      } else {
        const response = await api.post('/applications/draft', draftData);
        setDraftId(response.data.applicationId);
      }
      console.log('Draft saved to backend at:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const loadDraft = async () => {
    try {
      const response = await api.get('/applications/draft');
      if (response.data) {
        const draft = response.data;
        const confirmLoad = window.confirm('You have a saved draft from ' + new Date(draft.updatedAt).toLocaleString() + '. Resume where you left off?');
        if (confirmLoad) {
          loadDraftData(draft);
        }
      }
    } catch (error) {
      console.log('No draft found:', error.message);
    }
  };

  const loadSpecificDraft = async (draftId) => {
    try {
      const response = await api.get(`/applications/draft/${draftId}`);
      if (response.data) {
        loadDraftData(response.data);
      }
    } catch (error) {
      console.error('Error loading specific draft:', error);
      addNotification('error', 'Could not load the requested draft');
      navigate('/dashboard');
    }
  };

  const loadDraftData = (draft) => {
    setFormData({
      ...formData,
      landBoardId: draft.landBoardId || '',
      settlementType: draft.settlementType || '',
      purpose: draft.purpose || '',
      email: draft.email || formData.email,
      phone: draft.phone || formData.phone,
      maritalStatus: draft.maritalStatus || '',
      spouseName: draft.spouseName || ''
    });
    setTempDocIds(draft.tempDocIds || []);
    setCurrentStep(draft.currentStep || 2);
    setDraftId(draft.applicationId);
    
    if (draft.documents) {
      setUploadedDocs(draft.documents);
      setUploadedDocTypes(new Set(draft.documents.map(d => d.documentType)));
    }
  };

  const clearDraft = async () => {
    if (draftId) {
      try {
        await api.delete(`/applications/draft/${draftId}`);
      } catch (error) {
        console.error('Failed to delete draft:', error);
      }
    }
    setDraftId(null);
    addNotification('success', 'Draft cleared');
  };

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
      
      await clearDraft();
      addNotification('success', 'Application submitted successfully!');
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      addNotification('error', error.response?.data?.error || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraftManually = async () => {
    if (currentStep === 1) {
      addNotification('error', 'Please complete Step 1 before saving a draft');
      return;
    }
    await saveDraftToBackend();
    addNotification('success', 'Draft saved successfully! You can resume later from your dashboard.');
  };

  const hasRequiredDocuments = () => {
    return REQUIRED_DOCUMENTS.every(docType => uploadedDocTypes.has(docType));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#2C1810] to-[#B45F3A] p-6">
            <h1 className="text-2xl font-bold text-white">Apply for Land</h1>
            <p className="text-white/80 mt-1">Complete the steps below to submit your application</p>
            
            <div className="flex mt-6 gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex-1">
                  <div className={`h-1 rounded-full transition-all ${
                    step <= currentStep ? 'bg-white' : 'bg-white/30'
                  }`} />
                  <p className={`text-xs mt-1 text-center ${
                    step <= currentStep ? 'text-white' : 'text-white/50'
                  }`}>
                    {step === 1 && 'Board'}
                    {step === 2 && 'Details'}
                    {step === 3 && 'Documents'}
                    {step === 4 && 'Review'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
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

            <div className="flex justify-between mt-8 pt-6 border-t">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              
              {currentStep > 1 && currentStep < 4 && (
                <button
                  onClick={saveDraftManually}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  💾 Save Draft
                </button>
              )}
              
              {currentStep < 4 && (
                <button
                  onClick={() => {
                    if (currentStep === 1 && !validateStep(1)) return;
                    if (currentStep === 2 && !validateStep(2)) return;
                    if (currentStep === 3) {
                      if (!hasRequiredDocuments()) {
                        addNotification('error', 'Please upload your certified Omang copy');
                        return;
                      }
                      setCurrentStep(4);
                    } else {
                      handleNext();
                    }
                  }}
                  className="ml-auto px-6 py-2 bg-[#2C1810] text-white rounded-lg hover:bg-[#3d2418] transition-colors"
                >
                  {currentStep === 3 ? 'Review →' : 'Next →'}
                </button>
              )}
              
              {currentStep === 4 && (
                <button
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>

            {currentStep > 1 && (
              <div className="mt-4 text-center">
                <button
                  onClick={clearDraft}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Clear saved draft
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/applications');
        }}
        applicationNumber={submittedApplicationNumber}
      />
    </div>
  );
};

export default ApplicationForm;