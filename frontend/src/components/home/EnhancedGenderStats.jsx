// src/components/home/EnhancedGenderStats.jsx

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { Users, UserCheck, UserX } from 'lucide-react';
import api from '../../services/api';

const EnhancedGenderStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [total, setTotal] = useState(0);

  const COLORS = {
    male: '#2C5F8A',
    female: '#B45F3A',
    other: '#6B4E71'
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#333" className="text-lg font-bold">
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#666" className="text-sm">
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <text x={cx} y={cy + 30} dy={8} textAnchor="middle" fill="#999" className="text-xs">
          {value.toLocaleString()} applicants
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.3}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 5}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  useEffect(() => {
    fetchGenderStats();
  }, []);

  const fetchGenderStats = async () => {
    try {
      const response = await api.get('/applications/stats/gender');
      const maleCount = response.data.maleCount || 0;
      const femaleCount = response.data.femaleCount || 0;
      const otherCount = response.data.otherCount || 0;
      
      const chartData = [
        { name: 'Male', value: maleCount, color: COLORS.male, icon: '👨' },
        { name: 'Female', value: femaleCount, color: COLORS.female, icon: '👩' },
        { name: 'Other', value: otherCount, color: COLORS.other, icon: '👤' }
      ].filter(item => item.value > 0);
      
      setData(chartData);
      setTotal(maleCount + femaleCount + otherCount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching gender stats:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="bg-white rounded-2xl shadow-xl p-6 animate-pulse h-96"></div>;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#B45F3A]/5 to-transparent rounded-full -ml-20 -mb-20" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-[#B45F3A]" />
          <h3 className="text-xl font-bold text-[#2C1810]">Gender Distribution</h3>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-64 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  paddingAngle={5}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} applicants`, '']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 space-y-4">
            {data.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: `${item.color}20` }}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.value.toLocaleString()} applicants</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: item.color }}>
                    {Math.round((item.value / total) * 100)}%
                  </div>
                  <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full rounded-full"
                      style={{ width: `${(item.value / total) * 100}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Applicants</span>
                <span className="text-2xl font-bold text-[#2C1810]">{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedGenderStats;