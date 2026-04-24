// frontend/src/components/staff/QueueManagement.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';

const QueueManagement = ({ landBoardId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchQueue();
  }, [landBoardId]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/waiting-list?landBoardId=${landBoardId}`);
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, newStatus, notes) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus, notes });
      await fetchQueue(); // Refresh queue
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading queue...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Queue Management</h3>
        <p className="text-sm text-gray-600">Manage and process applications in FIFO order</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app.referenceNumber} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-blue-600">#{app.position}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                  {app.referenceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {app.applicantName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    app.settlementType === 'CITY' ? 'bg-blue-100 text-blue-800' :
                    app.settlementType === 'TOWN' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {app.settlementType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(app.submittedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    app.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                    app.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusUpdate(app.referenceNumber, e.target.value, '')}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Review</option>
                    <option value="DOCUMENTS_VERIFIED">Verified</option>
                    <option value="APPROVED">Approve</option>
                    <option value="REJECTED">Reject</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {applications.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No applications in queue
        </div>
      )}
    </div>
  );
};

export default QueueManagement;