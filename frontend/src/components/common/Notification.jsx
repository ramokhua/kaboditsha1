// frontend/src/components/common/Notification.jsx

import React, { useEffect } from 'react';

const Notification = ({ type = 'info', message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const colors = {
    success: 'bg-[#1F7A3B]/10 border-[#1F7A3B] text-[#1F7A3B]',
    error: 'bg-[#B22222]/10 border-[#B22222] text-[#B22222]',
    warning: 'bg-[#B76E2E]/10 border-[#B76E2E] text-[#B76E2E]',
    info: 'bg-[#2C5F8A]/10 border-[#2C5F8A] text-[#2C5F8A]'
  };

  return (
    <div className={`alert ${colors[type]} flex items-center justify-between`}>
      <div className="flex items-center">
        <span className="mr-2 text-xl">{icons[type]}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-lg hover:opacity-70">
          ✕
        </button>
      )}
    </div>
  );
};

export default Notification;