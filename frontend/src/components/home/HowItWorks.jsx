// src/components/home/HowItWorks.jsx

import React from 'react';

const HowItWorks = () => {
  const steps = [
    { number: 1, title: 'Create Account', description: 'Sign up with your email and Omang number' },
    { number: 2, title: 'Submit Application', description: 'Fill out the application form and upload documents' },
    { number: 3, title: 'Track Status', description: 'Monitor your application in real-time' },
    { number: 4, title: 'Document Verification', description: 'Staff verify your uploaded documents' },
    { number: 5, title: 'Manager Approval', description: 'Application is reviewed and approved' },
    { number: 6, title: 'Plot Allocation', description: 'Receive your plot allocation notice' }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-[#2C1810]">How It Works</h2>
        <p className="text-center text-[#1A1A1A] mb-12 max-w-2xl mx-auto">
          A simple, transparent process from application to allocation
        </p>

        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 bg-[#2C1810] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="font-bold text-[#2C1810] mb-2">{step.title}</h3>
              <p className="text-sm text-[#1A1A1A]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;