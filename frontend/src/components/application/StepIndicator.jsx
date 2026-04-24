// src/components/application/StepIndicator.jsx
import React from 'react';

const StepIndicator = ({ currentStep, steps }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="flex flex-col items-center"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                currentStep > step.number
                  ? 'bg-green-600 text-white'
                  : currentStep === step.number
                  ? 'bg-[#2C1810] text-white ring-4 ring-[#8B4513]/30'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <span
              className={`text-xs mt-2 text-center ${
                currentStep === step.number
                  ? 'text-[#2C1810] font-semibold'
                  : 'text-gray-500'
              }`}
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
        <div
          className="bg-[#2C1810] h-2 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default StepIndicator;