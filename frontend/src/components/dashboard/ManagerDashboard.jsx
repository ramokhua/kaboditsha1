// frontend/src/components/dashboard/ManagerDashboard.jsx
// ORIGINAL WORKING VERSION - All charts working

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, 
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LoadingSpinner from '../common/LoadingSpinner';
import SearchBar from '../common/SearchBar';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6');
  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [regionStats, setRegionStats] = useState({});
  const [trendData, setTrendData] = useState([]);
  const [genderData, setGenderData] = useState({ male: 0, female: 0, other: 0 });
  const [managerRegion, setManagerRegion] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const dashboardRef = useRef();

  const COLORS = {
    primary: '#2C1810',
    secondary: '#B45F3A',
    success: '#1F4A2B',
    warning: '#E6B800',
    info: '#2C5F8A',
    purple: '#6B4E71',
    teal: '#2C7A6E',
    gradient: ['#2C1810', '#B45F3A', '#8B4513', '#1F4A2B', '#2C5F8A', '#E6B800']
  };

  useEffect(() => {
    fetchAnalyticsData();
    fetchAuditLogs();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const appsResponse = await api.get('/applications/all');
      const applications = appsResponse.data;
      
      const statsResponse = await api.get('/waiting-list/stats');
      const waitingStats = statsResponse.data;
      
      const genderResponse = await api.get('/applications/stats/gender');
      setGenderData({
        male: genderResponse.data.maleCount,
        female: genderResponse.data.femaleCount,
        other: genderResponse.data.otherCount
      });

      const monthsToShow = parseInt(timeRange);
      const processedMonthly = processMonthlyData(applications, monthsToShow);
      setMonthlyData(processedMonthly);
      
      const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});
      setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));
      
      const regionAgg = {};
      waitingStats.forEach(board => {
        if (!regionAgg[board.region]) {
          regionAgg[board.region] = { totalPending: 0, avgWait: 0, boardCount: 0 };
        }
        regionAgg[board.region].totalPending += board.totalWaiting;
        regionAgg[board.region].boardCount++;
        const avgWait = board.bySettlementType?.reduce((sum, s) => sum + (s.averageWaitMonths || 0), 0) / (board.bySettlementType?.length || 1);
        regionAgg[board.region].avgWait += avgWait;
      });
      Object.keys(regionAgg).forEach(region => {
        regionAgg[region].avgWait = Math.round(regionAgg[region].avgWait / regionAgg[region].boardCount);
      });
      setRegionStats(regionAgg);
      
      const trend = calculateTrend(applications, monthsToShow);
      setTrendData(trend);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      addNotification('error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get('/manager/audit-logs');
      setAuditLogs(response.data);
      setFilteredLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const handleAuditSearch = (term) => {
    setAuditSearchTerm(term);
    if (!term.trim()) {
      setFilteredLogs(auditLogs);
      return;
    }
    const lowerTerm = term.toLowerCase();
    const filtered = auditLogs.filter(log => 
      log.action?.toLowerCase().includes(lowerTerm) ||
      log.user?.email?.toLowerCase().includes(lowerTerm)
    );
    setFilteredLogs(filtered);
  };

  const processMonthlyData = (applications, months) => {
    const monthly = {};
    const now = new Date();
    let cumulative = 0;
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthly[key] = { 
        month: date.toLocaleString('default', { month: 'short' }), 
        year: date.getFullYear(), 
        submitted: 0, 
        approved: 0,
        cumulative: 0
      };
    }
    
    const sortedMonths = Object.keys(monthly).sort();
    applications.forEach(app => {
      const date = new Date(app.submittedAt);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (monthly[key]) {
        monthly[key].submitted++;
        if (app.status === 'APPROVED') monthly[key].approved++;
      }
    });
    
    let runningTotal = 0;
    sortedMonths.forEach(key => {
      runningTotal += monthly[key].submitted;
      monthly[key].cumulative = runningTotal;
    });
    
    return Object.values(monthly);
  };

  const calculateTrend = (applications, months) => {
    const trend = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthApps = applications.filter(app => {
        const appDate = new Date(app.submittedAt);
        return appDate >= monthStart && appDate <= monthEnd;
      });
      
      const avgProcessingDays = monthApps
        .filter(app => app.approvedAt)
        .reduce((sum, app) => {
          const days = (new Date(app.approvedAt) - new Date(app.submittedAt)) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / (monthApps.filter(app => app.approvedAt).length || 1);
      
      trend.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        applications: monthApps.length,
        avgProcessingDays: Math.round(avgProcessingDays)
      });
    }
    
    return trend;
  };

  const handleExportPDF = async () => {
    try {
      addNotification('info', 'Generating PDF report...');
      const element = dashboardRef.current;
      if (!element) {
        addNotification('error', 'Dashboard element not found');
        return;
      }
      
      const originalOverflow = element.style.overflow;
      const originalHeight = element.style.height;
      element.style.overflow = 'visible';
      element.style.height = 'auto';
      
      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });
      
      element.style.overflow = originalOverflow;
      element.style.height = originalHeight;
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = 297;
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      const ratio = contentWidth / canvas.width;
      const contentHeight = canvas.height * ratio;
      
      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
      pdf.save(`kaboditsha-report-${new Date().toISOString().split('T')[0]}.pdf`);
      addNotification('success', 'PDF report generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      addNotification('error', 'Failed to generate PDF');
    }
  };

  const handleExportExcel = () => {
    const exportData = monthlyData.map(m => ({
      Month: `${m.month} ${m.year}`,
      'Applications Submitted': m.submitted,
      'Applications Approved': m.approved,
      'Approval Rate': `${Math.round((m.approved / m.submitted) * 100)}%`,
      'Cumulative Total': m.cumulative
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Report');
    XLSX.writeFile(wb, `kaboditsha-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    addNotification('success', 'Excel report exported successfully');
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
          <p className="font-bold text-[#2C1810]">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} className="text-sm" style={{ color: p.color }}>
              {p.name}: {p.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <LoadingSpinner text="Loading manager dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E6D3] to-[#E8D9C4] py-8">
      <div className="container mx-auto max-w-7xl px-4" ref={dashboardRef}>
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#2C1810]">Manager Dashboard</h1>
              <p className="text-gray-600 mt-1">Performance analytics & system insights</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F3A]"
              >
                <option value="3">Last 3 Months</option>
                <option value="6">Last 6 Months</option>
                <option value="12">Last 12 Months</option>
              </select>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                📄 Export PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                📊 Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8 bg-white rounded-t-xl px-6 pt-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-[#B45F3A] text-[#B45F3A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'audit'
                  ? 'border-[#B45F3A] text-[#B45F3A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Audit Trail
            </button>
          </nav>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <>
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Monthly Trends - Area Chart */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-[#2C1810] mb-4 flex items-center">
                  <span className="w-3 h-3 bg-gradient-to-r from-[#2C1810] to-[#B45F3A] rounded-full mr-2"></span>
                  Application Trends
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="submitted" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorSubmitted)" name="Submitted" />
                    <Area type="monotone" dataKey="approved" stroke={COLORS.success} fillOpacity={1} fill="url(#colorApproved)" name="Approved" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Status Distribution - Pie Chart */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-[#2C1810] mb-4 flex items-center">
                  <span className="w-3 h-3 bg-gradient-to-r from-[#2C1810] to-[#B45F3A] rounded-full mr-2"></span>
                  Application Status Distribution
                </h2>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name.replace('_', ' ')}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      innerRadius={30}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS.gradient[index % COLORS.gradient.length]}
                          style={{
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center text-xs text-gray-500 mt-2">
                  Total: {statusData.reduce((sum, s) => sum + s.value, 0).toLocaleString()} applications
                </div>
              </div>
            </div>

            {/* Gender Distribution - Full width */}
            <div className="grid grid-cols-1 gap-8 mb-8">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-[#2C1810] mb-4 flex items-center">
                  <span className="w-3 h-3 bg-gradient-to-r from-[#2C1810] to-[#B45F3A] rounded-full mr-2"></span>
                  Gender Distribution of Applicants
                </h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="w-64 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Male', value: genderData.male, color: '#2C5F8A' },
                            { name: 'Female', value: genderData.female, color: '#B45F3A' },
                            { name: 'Other', value: genderData.other, color: '#6B4E71' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                          labelLine={false}
                        >
                          <Cell fill="#2C5F8A" />
                          <Cell fill="#B45F3A" />
                          <Cell fill="#6B4E71" />
                        </Pie>
                        <Tooltip formatter={(value) => value.toLocaleString()} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#2C5F8A' }}></div>
                        <span className="font-medium text-gray-700">Male</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#2C5F8A]">{genderData.male.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{Math.round((genderData.male / (genderData.male + genderData.female + genderData.other)) * 100)}%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#B45F3A' }}></div>
                        <span className="font-medium text-gray-700">Female</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#B45F3A]">{genderData.female.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{Math.round((genderData.female / (genderData.male + genderData.female + genderData.other)) * 100)}%</div>
                      </div>
                    </div>
                    {genderData.other > 0 && (
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#6B4E71' }}></div>
                          <span className="font-medium text-gray-700">Other/Unspecified</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#6B4E71]">{genderData.other.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{Math.round((genderData.other / (genderData.male + genderData.female + genderData.other)) * 100)}%</div>
                        </div>
                      </div>
                    )}
                    <div className="pt-3 mt-2 text-center">
                      <div className="text-2xl font-bold text-[#2C1810]">{(genderData.male + genderData.female + genderData.other).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Total Applicants</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Regional Performance - Radar Chart */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-[#2C1810] mb-4 flex items-center">
                  <span className="w-3 h-3 bg-gradient-to-r from-[#2C1810] to-[#B45F3A] rounded-full mr-2"></span>
                  Regional Performance Metrics
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={Object.entries(regionStats).map(([region, data]) => ({ region, pending: data.totalPending, waitTime: data.avgWait }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="region" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis />
                    <Radar name="Pending Applications" dataKey="pending" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} />
                    <Radar name="Avg Wait Time (months)" dataKey="waitTime" stroke={COLORS.warning} fill={COLORS.warning} fillOpacity={0.3} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Turnaround Time Trend */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-[#2C1810] mb-4 flex items-center">
                  <span className="w-3 h-3 bg-gradient-to-r from-[#2C1810] to-[#B45F3A] rounded-full mr-2"></span>
                  Application Turnaround Time (Days)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="avgProcessingDays" stroke={COLORS.warning} strokeWidth={3} dot={{ r: 6, fill: COLORS.warning }} name="Turnaround Time (Days)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Audit Trail Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#2C1810]">Audit Trail</h2>
                <p className="text-sm text-gray-500 mt-1">Track all system actions and changes</p>
              </div>
              <div className="w-80">
                <SearchBar onSearch={handleAuditSearch} placeholder="Search by action or user..." />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.slice(0, 100).map((log) => (
                    <tr key={log.auditLogId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.user?.email || 'System'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                        {log.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">No audit logs found</div>
              )}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Data updated in real-time • Report generated on {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;