// src/components/application/DocumentUpload.jsx

import React, { useState } from 'react';
import api from '../../services/api';

const DocumentUpload = ({ onUploadComplete, uploadedDocTypes }) => {
  const [files, setFiles] = useState({});
  const [uploading, setUploading] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [previews, setPreviews] = useState({});

  const REQUIRED_DOCUMENTS = [
    { id: 'omang', name: 'Certified Copy of Omang', required: true, description: 'Front and back of Omang card' },
    { id: 'marriage', name: 'Marriage Certificate', required: false, description: 'If applicable' },
    { id: 'affidavit', name: 'Affidavit', required: false, description: 'If single/divorced/widowed' },
    { id: 'proof', name: 'Proof of Residence', required: false, description: 'Water/electricity bill or council letter' }
  ];

  const handleFileSelect = (docId, file) => {
    setFiles(prev => ({ ...prev, [docId]: file }));
    
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [docId]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews(prev => ({ ...prev, [docId]: null }));
    }
  };

  const handleUpload = async (docId) => {
    const file = files[docId];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', docId);

    setUploading(prev => ({ ...prev, [docId]: true }));
    
    try {
      const response = await api.post('/temp-documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [docId]: percent }));
        }
      });

      onUploadComplete(response.data);
      
      setTimeout(() => {
        setFiles(prev => {
          const newFiles = { ...prev };
          delete newFiles[docId];
          return newFiles;
        });
        setPreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[docId];
          return newPreviews;
        });
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[docId];
          return newProgress;
        });
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.error || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [docId]: false }));
    }
  };

  const handleRemoveFile = (docId) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[docId];
      return newFiles;
    });
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[docId];
      return newPreviews;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2C1810]">Upload Required Documents</h2>
        <div className="text-sm text-gray-500">
          {uploadedDocTypes.size} / {REQUIRED_DOCUMENTS.length} uploaded
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800 flex items-start">
          <span className="text-lg mr-2">📄</span>
          <span>All documents must be certified copies (where applicable) in PDF, JPG, or PNG format. 
          Maximum file size: 5MB per document. Uploaded documents are stored temporarily and will be 
          attached to your application upon final submission.</span>
        </p>
      </div>

      <div className="grid gap-4">
        {REQUIRED_DOCUMENTS.map((doc) => {
          const isUploaded = uploadedDocTypes?.has(doc.id);
          const isUploading = uploading[doc.id];
          const progress = uploadProgress[doc.id];
          const selectedFile = files[doc.id];
          const preview = previews[doc.id];
          
          return (
            <div 
              key={doc.id} 
              className={`border rounded-lg overflow-hidden transition-all ${
                isUploaded ? 'bg-green-50 border-green-300' : 'border-gray-200 hover:border-[#8B4513]/30'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{doc.icon}</span>
                      <div>
                        <h3 className="font-semibold text-[#2C1810]">
                          {doc.name}
                          {doc.required && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                      </div>
                    </div>
                    
                    {isUploaded && (
                      <div className="mt-2 flex items-center text-green-600 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Uploaded successfully
                      </div>
                    )}
                    
                    {!isUploaded && (
                      <>
                        {!selectedFile ? (
                          <div className="mt-3">
                            <label className="cursor-pointer">
                              <div className="inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#8B4513] hover:bg-[#F5E6D3] transition-colors">
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="text-sm text-gray-600">Choose File</span>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileSelect(doc.id, e.target.files[0])}
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="mt-3 space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                {preview ? (
                                  <img src={preview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                    <span className="text-lg">📄</span>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                    {selectedFile.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(selectedFile.size)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {!isUploading && (
                                  <button
                                    onClick={() => handleRemoveFile(doc.id)}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUpload(doc.id)}
                                  disabled={isUploading}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isUploading
                                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                      : 'bg-[#2C1810] text-white hover:bg-[#3d2418]'
                                  }`}
                                >
                                  {isUploading ? 'Uploading...' : 'Upload'}
                                </button>
                              </div>
                            </div>
                            
                            {isUploading && progress !== undefined && progress < 100 && (
                              <div className="space-y-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-[#2C1810] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-500 text-right">{progress}% uploaded</p>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!uploadedDocTypes?.has('omang') && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 flex items-center">
            <span className="text-lg mr-2">⚠️</span>
            <span>Your Omang copy is required before you can review and submit your application.</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;