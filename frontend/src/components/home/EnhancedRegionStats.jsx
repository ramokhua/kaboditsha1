// frontend/src/components/home/EnhancedGenderStats.jsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { Users } from 'lucide-react';
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
        <text x={cx} y={cy - 8} dy={8} textAnchor="middle" fill="#333" className="text-sm font-bold">
          {payload.name}
        </text>
        <text x={cx} y={cy + 8} dy={8} textAnchor="middle" fill="#666" className="text-xs">
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <text x={cx} y={cy + 24} dy={8} textAnchor="middle" fill="#999" className="text-xs">
          {value.toLocaleString()}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
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
          innerRadius={outerRadius + 3}
          outerRadius={outerRadius + 8}
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 animate-pulse h-[500px] flex flex-col">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="flex-1 bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 h-[500px] flex flex-col">
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <Users className="w-5 h-5 text-[#B45F3A]" />
        <h3 className="text-xl font-bold text-[#2C1810]">Gender Distribution</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4 flex-shrink-0">Based on Omang number (5th digit)</p>
      
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 min-h-0">
        <div className="w-56 h-56 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                dataKey="value"
                onMouseEnter={onPieEnter}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value.toLocaleString()} applicants`, '']}
                contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 space-y-3 w-full min-w-0">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${item.color}20` }}>
                  {item.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.value.toLocaleString()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold" style={{ color: item.color }}>
                  {Math.round((item.value / total) * 100)}%
                </div>
                <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full rounded-full"
                    style={{ width: `${(item.value / total) * 100}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Applicants</span>
              <span className="text-xl font-bold text-[#2C1810]">{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );s
};

export default EnhancedGenderStats;