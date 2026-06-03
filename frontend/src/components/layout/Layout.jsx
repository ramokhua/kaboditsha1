// frontend/src/components/layout/Layout.jsx

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;