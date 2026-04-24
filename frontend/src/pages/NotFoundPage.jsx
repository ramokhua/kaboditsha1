// frontend/src/pages/NotFoundPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const NotFoundPage = () => {
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-[#2C1810]">404</h1>
          <h2 className="text-3xl font-semibold text-[#B45F3A] mt-4 mb-6">
            Page Not Found
          </h2>
          <p className="text-[#1A1A1A] mb-8 max-w-md mx-auto">
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </p>
          <Link to="/" className="btn-primary inline-block">
            Go to Homepage
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;