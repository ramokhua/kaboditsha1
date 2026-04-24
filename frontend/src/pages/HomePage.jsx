// frontend/src/pages/HomePage.jsx

import React from 'react';
import 'leaflet/dist/leaflet.css';
import HeroSection from '../components/home/HeroSection';
import BeforeYouApply from '../components/home/BeforeYouApply';
import EnhancedGenderStats from '../components/home/EnhancedGenderStats';
import HowItWorks from '../components/home/HowItWorks';
import Footer from '../components/layout/Footer';
import DensityChart from '../components/home/DensityChart';
import WaitingListSeverity from '../components/home/WaitingListSeverity';
import SettlementTypeChart from '../components/home/SettlementTypeChart';
import SmartBoardMatcher from '../components/home/SmartBoardMatcher';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-white">
      {/* 1. Hero Section */}
      <HeroSection />
      
      {/* 2. Before You Apply */}
      <BeforeYouApply />
      
      {/* 3. Smart Board Matcher */}
      <section className="py-12 bg-gradient-to-r from-white to-[#F5E6D3]">
        <div className="container mx-auto px-4">
          <SmartBoardMatcher />
        </div>
      </section>
      
      {/* 4. Analytics Section */}
      <section className="py-16 bg-gradient-to-b from-white to-[#F5E6D3]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#2C1810] to-[#B45F3A] bg-clip-text text-transparent">
              Botswana Land Allocation Analytics
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visual insights into waiting lists, application volumes, demographics, and settlement performance
            </p>
          </div>
          
          {/* Row 1: Land Board Waiting List Severity - Standalone (full width) */}
          <div className="mb-12">
            <WaitingListSeverity />
          </div>
          
          {/* Row 2: 2-Column Grid for remaining charts */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="h-full">
              <DensityChart />
            </div>
            <div className="h-full">
              <SettlementTypeChart />
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <HowItWorks />

      {/* 6. Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;