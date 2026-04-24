// src/components/home/HeroSection.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-r from-[#2C1810] to-[#B45F3A] text-white">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-[#F5E6D3]">Kabo</span>Ditsha
          </h1>
          <p className="text-2xl mb-6 text-white/90">
            Your Digital Path to Land Allocation in Botswana
          </p>
          <p className="text-lg mb-8 text-white/80 max-w-2xl">
            Apply for land online, track your application in real-time, 
            and make informed decisions with transparent waiting list data.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="bg-[#F5E6D3] text-[#2C1810] px-8 py-3 rounded-lg font-semibold hover:bg-white transition duration-200">
              Get Started
            </Link>
            <Link to="/login" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition duration-200">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;