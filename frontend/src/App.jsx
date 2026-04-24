// frontend/src/App.jsx

import React from 'react';
import 'leaflet/dist/leaflet.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AuthGuard from './components/auth/AuthGuard';
import RoleGuard from './components/auth/RoleGuard';
import ErrorBoundary from './components/common/ErrorBoundary';
// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ApplyPage from './pages/ApplyPage';
import ProfilePage from './pages/ProfilePage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationDetailsPage from './pages/ApplicationDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import FAQPage from './pages/FAQPage';
import StaffReviewPage from './pages/StaffReviewPage';
import NotificationsPage from './pages/NotificationsPage'; 
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ManagerAuditPage from './pages/ManagerAuditPage';
import ManagerDashboard from './components/dashboard/ManagerDashboard';
import VerifyEmailPage from './pages/VerifyEmailPage';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              {/* PROTECTED ROUTES */}
              <Route path="/dashboard" element={
                <AuthGuard>
                  <DashboardPage />
                </AuthGuard>
              } />
              
              <Route path="/apply" element={
                <AuthGuard>
                  <RoleGuard allowedRoles={['APPLICANT']}>
                    <ApplyPage />
                  </RoleGuard>
                </AuthGuard>
              } />
              
              <Route path="/profile" element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              } />
              
              <Route path="/applications" element={
                <AuthGuard>
                  <ApplicationsPage />
                </AuthGuard>
              } />
              
              <Route path="/applications/:id" element={
                <AuthGuard>
                  <ApplicationDetailsPage />
                </AuthGuard>
              } />
              
              <Route path="/notifications" element={
                <AuthGuard>
                  <Layout>
                    <NotificationsPage />
                  </Layout>
                </AuthGuard>
              } />
              
              {/* Review Routes */}
              <Route path="/staff/review/:id" element={
                <AuthGuard>
                  <RoleGuard allowedRoles={['STAFF', 'MANAGER', 'ADMIN']}>
                    <StaffReviewPage />
                  </RoleGuard>
                </AuthGuard>
              } />

              <Route path="/manager/analytics" element={
                <AuthGuard>
                  <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
                    <Layout>
                      <ManagerDashboard />
                    </Layout>
                  </RoleGuard>
                </AuthGuard>
              } />

              <Route path="/manager/audit" element={
                <AuthGuard>
                  <RoleGuard allowedRoles={['MANAGER']}>
                    <ManagerAuditPage />
                  </RoleGuard>
                </AuthGuard>
              } />
              
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;