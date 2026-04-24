// frontend/src/components/home/DensityChart.jsx

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import api from '../../services/api';
import { TrendingUp, TrendingDown, Calendar, Award, Clock, AlertCircle } from 'lucide-react';

const DensityChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('12');
  const [insights, setInsights] = useState(null);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/applications/trends?months=${timeframe}`);
      const trendData = response.data;
      setData(trendData);
      
      // Calculate insights for decision-making
      if (trendData.length > 0) {
        calculateInsights(trendData);
        calculateForecast(trendData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching density data:', error);
      setLoading(false);
    }
  };

  const calculateInsights = (trendData) => {
    const lastMonth = trendData[trendData.length - 1];
    const prevMonth = trendData[trendData.length - 2];
    const sixMonthsAgo = trendData[Math.max(0, trendData.length - 7)];
    
    // Calculate trends
    const submittedChange = prevMonth ? ((lastMonth?.submitted - prevMonth?.submitted) / prevMonth?.submitted) * 100 : 0;
    const approvedChange = prevMonth ? ((lastMonth?.approved - prevMonth?.approved) / prevMonth?.approved) * 100 : 0;
    
    // Find best and worst months
    const bestMonth = [...trendData].sort((a, b) => b.approved - a.approved)[0];
    const worstMonth = [...trendData].sort((a, b) => a.approved - b.approved)[0];
    const highestSubmissionMonth = [...trendData].sort((a, b) => b.submitted - a.submitted)[0];
    
    // Calculate 6-month trend
    const sixMonthTrend = sixMonthsAgo ? 
      ((lastMonth?.submitted - sixMonthsAgo?.submitted) / sixMonthsAgo?.submitted) * 100 : 0;
    
    // Calculate approval rate trend
    const avgApprovalRate6Months = trendData.slice(-6).reduce((sum, m) => sum + (m.approved / m.submitted * 100), 0) / 6;
    const avgApprovalRatePrev6Months = trendData.slice(-12, -6).reduce((sum, m) => sum + (m.approved / m.submitted * 100), 0) / 6;
    const approvalRateChange = avgApprovalRate6Months - avgApprovalRatePrev6Months;
    
    setInsights({
      direction: submittedChange > 0 ? 'increasing' : 'decreasing',
      submittedChangePercent: Math.abs(submittedChange).toFixed(1),
      approvedChangePercent: Math.abs(approvedChange).toFixed(1),
      approvedDirection: approvedChange > 0 ? 'increasing' : 'decreasing',
      sixMonthTrend: sixMonthTrend > 0 ? 'increasing' : 'decreasing',
      sixMonthTrendPercent: Math.abs(sixMonthTrend).toFixed(1),
      bestMonth: bestMonth,
      worstMonth: worstMonth,
      highestSubmissionMonth: highestSubmissionMonth,
      avgApprovalRate6Months: avgApprovalRate6Months.toFixed(1),
      approvalRateChange: approvalRateChange.toFixed(1),
      approvalRateDirection: approvalRateChange > 0 ? 'improving' : 'declining'
    });
  };

  const calculateForecast = (trendData) => {
    if (trendData.length < 3) return;
    
    // Simple linear regression for forecast
    const recentData = trendData.slice(-6);
    const xValues = recentData.map((_, i) => i);
    const yValues = recentData.map(d => d.submitted);
    
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const nextMonthPrediction = Math.max(0, Math.round(intercept + slope * n));
    const seasonalityFactor = 1.1; // 10% increase expected during peak season
    
    setForecast({
      nextMonthPrediction: nextMonthPrediction,
      adjustedPrediction: Math.round(nextMonthPrediction * seasonalityFactor),
      trend: slope > 0 ? 'upward' : 'downward'
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = data.find(d => d.month === label);
      const approvalRate = dataPoint ? ((dataPoint.approved / dataPoint.submitted) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-white p-4 shadow-xl rounded-lg border border-gray-200 min-w-[200px]">
          <p className="font-bold text-[#2C1810] text-base mb-2">{label}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">📝 Submitted:</span>
              <span className="font-bold text-[#2C1810]">{payload[0]?.value?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">✅ Approved:</span>
              <span className="font-bold text-green-600">{payload[1]?.value?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">⏳ Pending:</span>
              <span className="font-bold text-yellow-600">{payload[2]?.value?.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 mt-1">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">📊 Approval Rate:</span>
                <span className={`font-bold ${approvalRate >= 15 ? 'text-green-600' : 'text-orange-600'}`}>
                  {approvalRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 animate-pulse h-[550px] flex flex-col">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="flex-1 bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      {/* Header with Timeframe Selector */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-bold text-[#2C1810] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#B45F3A]" />
            Application Volume Trends
          </h3>
          <p className="text-sm text-gray-500 mt-1">Monthly submissions, approvals & pending applications</p>
        </div>
        <div className="flex gap-2">
          {['3', '6', '12'].map(months => (
            <button
              key={months}
              onClick={() => setTimeframe(months)}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                timeframe === months
                  ? 'bg-[#2C1810] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {months} Months
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2C1810" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2C1810" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1F4A2B" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#1F4A2B" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E6B800" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#E6B800" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="submitted" 
              stroke="#2C1810" 
              fillOpacity={1} 
              fill="url(#colorSubmitted)" 
              strokeWidth={2}
              name="Submitted"
            />
            <Area 
              type="monotone" 
              dataKey="approved" 
              stroke="#1F4A2B" 
              fillOpacity={1} 
              fill="url(#colorApproved)" 
              strokeWidth={2}
              name="Approved"
            />
            <Area 
              type="monotone" 
              dataKey="pending" 
              stroke="#E6B800" 
              fillOpacity={1} 
              fill="url(#colorPending)" 
              strokeWidth={2}
              name="Pending"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#2C1810]"></div>
          <span className="text-xs text-gray-600">Submitted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#1F4A2B]"></div>
          <span className="text-xs text-gray-600">Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#E6B800]"></div>
          <span className="text-xs text-gray-600">Pending</span>
        </div>
      </div>

      {/* DECISION-MAKING INSIGHTS PANEL - This is what supervisor requested */}
      {insights && (
        <div className="mt-5 space-y-3">
          {/* Trend Alert */}
          <div className={`p-3 rounded-lg border ${
            insights.direction === 'increasing' 
              ? 'bg-orange-50 border-orange-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-start gap-2">
              {insights.direction === 'increasing' ? (
                <TrendingUp className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              ) : (
                <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium" style={{ color: insights.direction === 'increasing' ? '#EA580C' : '#16A34A' }}>
                  {insights.direction === 'increasing' 
                    ? `📈 Applications are up ${insights.submittedChangePercent}% from last month`
                    : `📉 Applications are down ${insights.submittedChangePercent}% from last month`}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Approval rate is {insights.approvedDirection === 'increasing' ? 'up' : 'down'} {insights.approvedChangePercent}% compared to last month
                </p>
              </div>
            </div>
          </div>

          {/* Best Time to Apply */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-semibold text-blue-800">Best Time to Apply</p>
              </div>
              <p className="text-sm font-bold text-blue-900">{insights.bestMonth?.month}</p>
              <p className="text-xs text-blue-700 mt-1">
                Historically highest approval rate: {((insights.bestMonth?.approved / insights.bestMonth?.submitted) * 100).toFixed(1)}% 
                ({insights.bestMonth?.approved.toLocaleString()} approvals)
              </p>
              <p className="text-xs text-blue-600 mt-1">
                💡 Tip: Submit applications during {insights.bestMonth?.month} for best approval chances
              </p>
            </div>

            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-800">Busiest Period</p>
              </div>
              <p className="text-sm font-bold text-amber-900">{insights.highestSubmissionMonth?.month}</p>
              <p className="text-xs text-amber-700 mt-1">
                Peak volume: {insights.highestSubmissionMonth?.submitted.toLocaleString()} applications
              </p>
              <p className="text-xs text-amber-600 mt-1">
                💡 Tip: Expect longer processing times during this period
              </p>
            </div>
          </div>

          {/* 6-Month Trend & Forecast */}
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-semibold text-purple-800">6-Month Outlook</p>
            </div>
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <p className="text-sm font-bold text-purple-900">
                  {insights.sixMonthTrend === 'increasing' ? '↑' : '↓'} {insights.sixMonthTrendPercent}% 
                  {insights.sixMonthTrend === 'increasing' ? ' increase' : ' decrease'} in applications
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  Approval rate is {insights.approvalRateDirection} ({insights.approvalRateChange > 0 ? '+' : ''}{insights.approvalRateChange}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DensityChart;