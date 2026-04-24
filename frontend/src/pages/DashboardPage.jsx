// frontend/src/pages/DashboardPage.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Layout from '../components/layout/Layout';
import ApplicantDashboard from '../components/dashboard/ApplicantDashboard';
import StaffDashboard from '../components/dashboard/StaffDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

const DashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading dashboard..." />
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  console.log('DashboardPage - User role:', user.role); // Debug log

  // Render role-specific dashboard
  switch (user.role) {
    case 'APPLICANT':
      return (
        <Layout>
          <ApplicantDashboard />
        </Layout>
      );
    case 'STAFF':
      return (
        <Layout>
          <StaffDashboard />
        </Layout>
      );
    case 'MANAGER':
      return (
        <Layout>
          <ManagerDashboard />
        </Layout>
      );
    case 'ADMIN':
      return (
        <Layout>
          <AdminDashboard />
        </Layout>
      );
    default:
      return (
        <Layout>
          <ApplicantDashboard />
        </Layout>
      );
  }
};

export default DashboardPage;