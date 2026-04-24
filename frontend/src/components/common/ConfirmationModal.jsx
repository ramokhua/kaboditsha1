// frontend/src/components/common/ConfirmationModal.jsx

import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-md w-full rounded-xl shadow-2xl">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-[#2C1810] mb-4">{title}</h3>
          <p className="text-[#1A1A1A] mb-6">{message}</p>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="btn-outline px-6 py-2"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="btn-primary px-6 py-2"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;