// frontend/src/components/home/SettlementTypeChart.jsx

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { Filter, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const SettlementTypeChart = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [selectedPurpose, setSelectedPurpose] = useState('Residential');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [regions, setRegions] = useState([]);
  const [turnaroundData, setTurnaroundData] = useState([]);

  const purposes = ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Civic'];
  const settlementTypes = ['TOWN', 'VILLAGE', 'FARM'];

  useEffect(() => {
    fetchData();
  }, [selectedPurpose, selectedRegion]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/applications/all');
      let applications = response.data;
      
      // Filter by purpose
      applications = applications.filter(app => app.purpose === selectedPurpose);
      
      // Get unique regions
      const uniqueRegions = [...new Set(applications.map(app => app.landBoard?.region).filter(Boolean))];
      setRegions(['all', ...uniqueRegions]);
      
      // Filter by region
      if (selectedRegion !== 'all') {
        applications = applications.filter(app => app.landBoard?.region === selectedRegion);
      }
      
      // Process settlement data with turnaround time
      const processed = settlementTypes.map(settlement => {
        const settlementApps = applications.filter(app => app.settlementType === settlement);
        const total = settlementApps.length;
        const approved = settlementApps.filter(app => app.status === 'APPROVED').length;
        const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
        
        // Calculate average turnaround time in days for approved apps
        const approvedApps = settlementApps.filter(app => app.status === 'APPROVED' && app.approvedAt);
        const avgTurnaroundDays = approvedApps.length > 0 
          ? Math.round(approvedApps.reduce((sum, app) => {
              const days = (new Date(app.approvedAt) - new Date(app.submittedAt)) / (1000 * 60 * 60 * 24);
              return sum + days;
            }, 0) / approvedApps.length)
          : 0;
        
        return {
          settlement,
          total,
          approved,
          approvalRate,
          avgTurnaroundDays,
          // Color based on turnaround speed
          turnaroundColor: avgTurnaroundDays <= 30 ? '#22C55E' : avgTurnaroundDays <= 60 ? '#EAB308' : '#F97316'
        };
      });
      
      setChartData(processed);
      
      // Also prepare turnaround trend data
      const monthlyTurnaround = {};
      applications.forEach(app => {
        if (app.status === 'APPROVED' && app.approvedAt) {
          const month = new Date(app.approvedAt).toLocaleString('default', { month: 'short', year: 'numeric' });
          const days = (new Date(app.approvedAt) - new Date(app.submittedAt)) / (1000 * 60 * 60 * 24);
          if (!monthlyTurnaround[month]) {
            monthlyTurnaround[month] = { total: 0, count: 0 };
          }
          monthlyTurnaround[month].total += days;
          monthlyTurnaround[month].count++;
        }
      });
      
      const trendData = Object.entries(monthlyTurnaround).slice(-6).map(([month, data]) => ({
        month,
        avgTurnaroundDays: Math.round(data.total / data.count)
      }));
      
      setTurnaroundData(trendData);
      
    } catch (error) {
      console.error('Error fetching settlement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getApprovalColor = (rate) => {
    if (rate >= 70) return '#1F4A2B';
    if (rate >= 40) return '#E6B800';
    return '#B22222';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = chartData.find(d => d.settlement === label);
      if (!data) return null;
      
      return (
        <div className="bg-white p-3 shadow-xl rounded-lg border border-gray-200">
          <p className="font-bold text-[#2C1810] mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Approval Rate:</span>
              <span className="font-bold" style={{ color: getApprovalColor(data.approvalRate) }}>
                {data.approvalRate}%
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Turnaround Time:</span>
              <span className="font-bold" style={{ color: data.turnaroundColor }}>
                {data.avgTurnaroundDays} days
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Total Applied:</span>
              <span className="font-bold">{data.total.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {data.avgTurnaroundDays <= 30 
                ? '✅ Fastest processing - apply here for quick response'
                : data.avgTurnaroundDays <= 60
                ? '🟡 Moderate processing - expect 1-2 months'
                : '⚠️ Slow processing - consider other settlement types'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 h-[500px] flex items-center justify-center">
        <LoadingSpinner text="Loading settlement data..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#2C1810] flex items-center gap-2">
            <span className="text-2xl">🏘️</span>
            Settlement Performance by Purpose
          </h2>
          <p className="text-sm text-gray-500 mt-1">Approval rates & turnaround time by settlement type</p>
        </div>
        
        <div className="flex gap-2">
          {/* Purpose Filter */}
          <select
            value={selectedPurpose}
            onChange={(e) => setSelectedPurpose(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A]"
          >
            {purposes.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          
          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A]"
          >
            {regions.map(r => (
              <option key={r} value={r}>{r === 'all' ? 'All Regions' : r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dual Chart Layout */}
      <div className="space-y-6">
        {/* Chart 1: Approval Rates */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Approval Rates by Settlement Type
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="settlement" tick={{ fontSize: 12, fontWeight: 'bold' }} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="approvalRate" name="Approval Rate" barSize={35} radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getApprovalColor(entry.approvalRate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Chart 2: Turnaround Time Trend */}
        {turnaroundData.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Clock className="w-4 h-4 text-orange-600" />
              Turnaround Time Trend (Days) - Last 6 Months
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={turnaroundData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 'Days', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value} days`, 'Turnaround Time']} />
                  <Line 
                    type="monotone" 
                    dataKey="avgTurnaroundDays" 
                    stroke="#F97316" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#F97316' }}
                    name="Avg Turnaround (Days)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Insight Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-start gap-2 text-xs">
          <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-gray-600">
            For <strong>{selectedPurpose}</strong> applications in <strong>{selectedRegion === 'all' ? 'Botswana' : selectedRegion}</strong>:
            {chartData.map(d => {
              if (d.avgTurnaroundDays <= 30 && d.approvalRate >= 60) {
                return ` ${d.settlement} offers the best combination (${d.avgTurnaroundDays} days, ${d.approvalRate}% approval).`;
              }
              return '';
            }).join('')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettlementTypeChart;