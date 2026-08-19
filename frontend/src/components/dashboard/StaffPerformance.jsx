import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StaffPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/manager/staff-performance');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching staff performance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading staff performance..." />;

  const chartData = data?.staff.map(s => ({
    name: s.fullName.split(' ')[0],
    'Applications Reviewed': s.totalReviewed,
    'Approved': s.approved,
    'Rejected': s.rejected
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <p className="text-sm text-gray-500">Total Staff</p>
          <p className="text-2xl font-bold text-[#2C1810]">{data?.summary?.totalStaff}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <p className="text-sm text-gray-500">Total Reviewed</p>
          <p className="text-2xl font-bold text-[#2C1810]">{data?.summary?.totalReviewed}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <p className="text-sm text-gray-500">Avg Approval Rate</p>
          <p className="text-2xl font-bold text-green-600">{data?.summary?.avgApprovalRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <p className="text-sm text-gray-500">Avg Processing (Days)</p>
          <p className="text-2xl font-bold text-blue-600">{data?.summary?.avgProcessingDays} days</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-bold text-[#2C1810] mb-4">Staff Performance Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Applications Reviewed" fill="#2C1810" />
            <Bar dataKey="Approved" fill="#1F4A2B" />
            <Bar dataKey="Rejected" fill="#B22222" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Staff Table */}
      <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
        <h3 className="text-lg font-bold text-[#2C1810] mb-4">Staff Details</h3>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Staff</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Board</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Reviewed</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Approved</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Rejected</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Approval Rate</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Avg Days</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.staff.map(staff => (
              <tr key={staff.userId} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm font-medium text-gray-900">{staff.fullName}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{staff.board}</td>
                <td className="px-4 py-2 text-sm text-center font-bold">{staff.totalReviewed}</td>
                <td className="px-4 py-2 text-sm text-center text-green-600">{staff.approved}</td>
                <td className="px-4 py-2 text-sm text-center text-red-600">{staff.rejected}</td>
                <td className="px-4 py-2 text-sm text-center font-bold">{staff.approvalRate}%</td>
                <td className="px-4 py-2 text-sm text-center">{staff.avgProcessingDays} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffPerformance;