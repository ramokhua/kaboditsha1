// frontend/src/pages/ApplicationsPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DataTable from '../components/common/DataTable';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/applications/my');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      SUBMITTED: 'badge-info',
      UNDER_REVIEW: 'badge-warning',
      DOCUMENTS_VERIFIED: 'badge-success',
      APPROVED: 'badge-success',
      REJECTED: 'badge-error',
      WITHDRAWN: 'badge-error'
    };
    return colors[status] || 'badge-info';
  };

  const columns = [
    {
      key: 'applicationNumber',
      label: 'Reference',
      sortable: true
    },
    {
      key: 'landBoard',
      label: 'Land Board',
      sortable: true,
      render: (_, row) => row.landBoard?.name || 'N/A'
    },
    {
      key: 'settlementType',
      label: 'Type',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (status) => (
        <span className={`badge ${getStatusBadge(status)}`}>
          {status.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'queuePosition',
      label: 'Queue Position',
      sortable: true,
      render: (pos, row) => pos ? `${pos} of ${row.totalInQueue || '?'}` : 'N/A'
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString()
    }
  ];

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading your applications..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#F5E6D3] py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#2C1810]">My Applications</h1>
            <Link to="/apply" className="btn-primary">
              ➕ New Application
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-xl text-[#4A4A4A] mb-4">You haven't submitted any applications yet.</p>
              <Link to="/apply" className="btn-primary inline-block">
                Start Your First Application
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <DataTable
                columns={columns}
                data={applications}
                onRowClick={(row) => window.location.href = `/applications/${row.applicationId}`}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ApplicationsPage;