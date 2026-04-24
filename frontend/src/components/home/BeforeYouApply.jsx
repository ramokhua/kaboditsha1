// src/components/home/BeforeYouApply.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const BeforeYouApply = () => {
  return (
    <section className="py-16 bg-[#F5E6D3]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-[#2C1810]">Before You Apply</h2>
        <p className="text-center text-[#1A1A1A] mb-12 max-w-2xl mx-auto">
          Everything you need to know before submitting your land application
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center hover:shadow-xl transition">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-[#2C1810] mb-2">Eligibility Check</h3>
            <p className="text-[#1A1A1A]">
              You must be 18+ years, Botswana citizen, and not already own a plot in the same settlement type
            </p>
          </div>

          <div className="card text-center hover:shadow-xl transition">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-[#2C1810] mb-2">Required Documents</h3>
            <p className="text-[#1A1A1A]">
              Certified Omang, marriage certificate (if applicable), and proof of residence
            </p>
          </div>

          <div className="card text-center hover:shadow-xl transition">
            <div className="text-5xl mb-4">🏛️</div>
            <h3 className="text-xl font-bold text-[#2C1810] mb-2">One Plot Rule</h3>
            <p className="text-[#1A1A1A]">
              One plot per settlement type: City, Town/Village, and Farm
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link to="/register" className="btn-primary inline-block px-8 py-3 text-lg">
            Start Your Application
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BeforeYouApply;