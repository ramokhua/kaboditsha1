import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

const ApplyPage = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [landBoards, setLandBoards] = useState([]);
  const [formData, setFormData] = useState({
    landBoardId: '',
    settlementType: '',
    purpose: '',
    tempDocIds: []
  });
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    fetchLandBoards();
    loadDraft();
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!draftLoaded) return;
    
    const interval = setInterval(() => {
      if (currentStep > 1 && currentStep < 4) {
        const draftData = {
          formData,
          uploadedDocs,
          currentStep,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('kaboditsha_application_draft', JSON.stringify(draftData));
        console.log('Draft saved at:', new Date().toLocaleTimeString());
        addNotification('info', 'Draft saved automatically');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, uploadedDocs, currentStep, draftLoaded]);

  const loadDraft = () => {
    const savedDraft = localStorage.getItem('kaboditsha_application_draft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      const hoursSinceSave = (new Date() - new Date(draft.timestamp)) / (1000 * 60 * 60);
      if (hoursSinceSave < 24 && window.confirm('You have a saved draft from ' + new Date(draft.timestamp).toLocaleString() + '. Resume where you left off?')) {
        setFormData(draft.formData);
        setUploadedDocs(draft.uploadedDocs || []);
        setCurrentStep(draft.currentStep);
      } else if (hoursSinceSave >= 24) {
        localStorage.removeItem('kaboditsha_application_draft');
      }
    }
    setDraftLoaded(true);
  };

  const clearDraft = () => {
    localStorage.removeItem('kaboditsha_application_draft');
  };

  const fetchLandBoards = async () => {
    try {
      const response = await api.get('/landboards');
      const mainBoards = response.data.filter(board => board.type === 'MAIN');
      setLandBoards(mainBoards);
    } catch (error) {
      console.error('Error fetching land boards:', error);
      addNotification('error', 'Failed to load land boards');
    }
  };

  const handleTempUpload = async (file, documentType) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    try {
      const response = await api.post('/documents/temp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUploadedDocs([...uploadedDocs, response.data]);
      setFormData({
        ...formData,
        tempDocIds: [...formData.tempDocIds, response.data.tempId]
      });
      
      addNotification('success', `${file.name} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      addNotification('error', 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const removeTempDoc = (tempId) => {
    setUploadedDocs(uploadedDocs.filter(doc => doc.tempId !== tempId));
    setFormData({
      ...formData,
      tempDocIds: formData.tempDocIds.filter(id => id !== tempId)
    });
  };

  const handleSubmit = async () => {
    if (!formData.landBoardId || !formData.settlementType) {
      addNotification('error', 'Please complete all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/applications', formData);
      clearDraft();
      addNotification('success', 'Application submitted successfully!');
      navigate(`/applications/${response.data.applicationId}`);
    } catch (error) {
      console.error('Submit error:', error);
      addNotification('error', error.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const settlementTypes = [
    { value: 'TOWN', label: 'Town Plot', description: 'Urban residential/commercial area' },
    { value: 'VILLAGE', label: 'Village Plot', description: 'Rural residential area' },
    { value: 'FARM', label: 'Farm Plot', description: 'Agricultural land' }
  ];

  const purposes = [
    { value: 'Residential', label: 'Residential', description: 'Building a home' },
    { value: 'Commercial', label: 'Commercial', description: 'Business purposes' },
    { value: 'Agricultural', label: 'Agricultural', description: 'Farming' },
    { value: 'Industrial', label: 'Industrial', description: 'Factory/warehouse' },
    { value: 'Civic', label: 'Civic', description: 'Community facilities' }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-white py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#2C1810] to-[#B45F3A] p-6">
              <h1 className="text-2xl font-bold text-white">Apply for Land</h1>
              <p className="text-white/80 mt-1">Complete the steps below to submit your application</p>
              
              {/* Step Indicator */}
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
              {/* Step 1: Select Land Board */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-[#2C1810] mb-4">Select Land Board</h2>
                  <p className="text-gray-600 mb-6">Choose the Land Board you want to apply to</p>
                  
                  <div className="space-y-3">
                    {landBoards.map(board => (
                      <label key={board.landBoardId} className={`block p-4 border rounded-xl cursor-pointer transition-all ${
                        formData.landBoardId === board.landBoardId
                          ? 'border-[#B45F3A] bg-[#F5E6D3] shadow-md'
                          : 'border-gray-200 hover:border-[#B45F3A]'
                      }`}>
                        <div className="flex items-start">
                          <input
                            type="radio"
                            name="landBoardId"
                            value={board.landBoardId}
                            checked={formData.landBoardId === board.landBoardId}
                            onChange={(e) => setFormData({ ...formData, landBoardId: e.target.value })}
                            className="mt-1 mr-3"
                          />
                          <div>
                            <p className="font-semibold text-[#2C1810]">{board.name}</p>
                            <p className="text-sm text-gray-500">{board.region}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Settlement Type & Purpose */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-[#2C1810] mb-4">Application Details</h2>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Settlement Type *</label>
                    <div className="grid md:grid-cols-3 gap-3">
                      {settlementTypes.map(type => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, settlementType: type.value })}
                          className={`p-3 border rounded-xl text-left transition-all ${
                            formData.settlementType === type.value
                              ? 'border-[#B45F3A] bg-[#F5E6D3]'
                              : 'border-gray-200 hover:border-[#B45F3A]'
                          }`}
                        >
                          <p className="font-semibold text-[#2C1810]">{type.label}</p>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Purpose (Optional)</label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {purposes.map(purpose => (
                        <button
                          key={purpose.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, purpose: purpose.value })}
                          className={`p-3 border rounded-xl text-left transition-all ${
                            formData.purpose === purpose.value
                              ? 'border-[#B45F3A] bg-[#F5E6D3]'
                              : 'border-gray-200 hover:border-[#B45F3A]'
                          }`}
                        >
                          <p className="font-semibold text-[#2C1810]">{purpose.label}</p>
                          <p className="text-xs text-gray-500">{purpose.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Document Upload */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-[#2C1810] mb-4">Upload Documents</h2>
                  <p className="text-gray-600 mb-6">Upload the required documents for your application</p>

                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                      <input
                        type="file"
                        id="document-upload"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            const docType = prompt('Enter document type (omang, proof, affidavit, marriage):');
                            if (docType) handleTempUpload(e.target.files[0], docType);
                          }
                          e.target.value = '';
                        }}
                      />
                      <label
                        htmlFor="document-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-[#2C1810] text-white rounded-lg hover:bg-[#3d2418] transition-colors"
                      >
                        📄 {uploading ? 'Uploading...' : 'Upload Document'}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PDF, JPG, PNG (max 5MB)</p>
                    </div>

                    {uploadedDocs.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-[#2C1810] mb-2">Uploaded Documents</h3>
                        <div className="space-y-2">
                          {uploadedDocs.map(doc => (
                            <div key={doc.tempId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-[#2C1810]">{doc.filename}</p>
                                <p className="text-xs text-gray-500">Type: {doc.documentType}</p>
                              </div>
                              <button
                                onClick={() => removeTempDoc(doc.tempId)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-xl font-bold text-[#2C1810] mb-4">Review Your Application</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Selected Land Board</p>
                      <p className="font-semibold text-[#2C1810]">
                        {landBoards.find(b => b.landBoardId === formData.landBoardId)?.name || 'Not selected'}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Settlement Type</p>
                      <p className="font-semibold text-[#2C1810]">{formData.settlementType || 'Not selected'}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Purpose</p>
                      <p className="font-semibold text-[#2C1810]">{formData.purpose || 'Not specified'}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Documents</p>
                      <p className="font-semibold text-[#2C1810]">{uploadedDocs.length} document(s) uploaded</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                )}
                
                {currentStep < 4 && (
                  <button
                    onClick={() => {
                      if (currentStep === 1 && !formData.landBoardId) {
                        addNotification('error', 'Please select a Land Board');
                        return;
                      }
                      if (currentStep === 2 && !formData.settlementType) {
                        addNotification('error', 'Please select a settlement type');
                        return;
                      }
                      setCurrentStep(currentStep + 1);
                    }}
                    className="ml-auto px-6 py-2 bg-[#2C1810] text-white rounded-lg hover:bg-[#3d2418]"
                  >
                    Next
                  </button>
                )}
                
                {currentStep === 4 && (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>

              {/* Clear Draft Button */}
              <div className="mt-4 text-center">
                <button
                  onClick={clearDraft}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear saved draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ApplyPage;