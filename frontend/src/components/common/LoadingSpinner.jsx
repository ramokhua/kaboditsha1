// frontend/src/components/common/LoadingSpinner.jsx

import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`spinner ${sizeClasses[size]}`}></div>
      {text && <p className="mt-4 text-[#2C1810] font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;