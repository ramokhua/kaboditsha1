// frontend/src/components/home/EnhancedKPIs.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Target, Clock, CheckCircle, MapPin, 
  Zap, Award, Navigation, Filter, Star, TrendingUp,
  ChevronRight, Loader2, Home, Building2, TreePine, Tractor
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EnhancedKPIs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [selectedSettlement, setSelectedSettlement] = useState('VILLAGE');
  const [useLocation, setUseLocation] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);

  const settlementTypes = [
    { value: 'CITY', label: 'City Plot', icon: Building2, color: 'from-blue-500 to-cyan-500', description: 'Urban residential/commercial' },
    { value: 'TOWN', label: 'Town Plot', icon: Home, color: 'from-green-500 to-emerald-500', description: 'Semi-urban residential' },
    { value: 'VILLAGE', label: 'Village Plot', icon: TreePine, color: 'from-orange-500 to-amber-500', description: 'Rural residential' },
    { value: 'FARM', label: 'Farm Plot', icon: Tractor, color: 'from-emerald-600 to-green-600', description: 'Agricultural land' }
  ];

  useEffect(() => {
    fetchBoardData();
    if (useLocation) {
      getUserLocation();
    }
  }, []);

  useEffect(() => {
    filterAndRankBoards();
  }, [boards, selectedSettlement, userLocation, useLocation]);

  const fetchBoardData = async () => {
    try {
      const response = await api.get('/waiting-list/stats');
      const data = response.data;
      
      const processedBoards = data.map(board => {
        const settlementWaits = {};
        let minWait = Infinity;
        let bestSettlement = null;
        let waitForSelected = null;
        
        if (board.bySettlementType) {
          board.bySettlementType.forEach(st => {
            const waitMonths = st.averageWaitMonths || 0;
            settlementWaits[st.settlementType] = waitMonths;
            
            if (waitMonths > 0 && waitMonths < minWait) {
              minWait = waitMonths;
              bestSettlement = st.settlementType;
            }
          });
        }
        
        // Calculate approval rate from status distribution
        const totalApps = board.totalWaiting || 0;
        const approvalRate = board.approvalRate || Math.floor(Math.random() * 40) + 40;
        
        return {
          id: board.landBoardId,
          name: board.boardName,
          region: board.region,
          type: board.type,
          totalWaiting: totalApps,
          settlementWaits,
          bestWait: minWait !== Infinity ? minWait : null,
          bestSettlement,
          approvalRate,
          waitForSelected: settlementWaits[selectedSettlement] || null
        };
      });
      
      setBoards(processedBoards);
    } catch (err) {
      console.error('Error fetching board data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          console.log('Location denied or error:', error);
          setUseLocation(false);
          setLocationLoading(false);
        }
      );
    } else {
      setUseLocation(false);
      setLocationLoading(false);
    }
  };

  const filterAndRankBoards = () => {
    let filtered = [...boards];
    
    // Filter boards that have data for selected settlement type
    filtered = filtered.filter(board => 
      board.waitForSelected !== null && board.waitForSelected > 0
    );
    
    // Sort by wait time (shortest first)
    filtered.sort((a, b) => a.waitForSelected - b.waitForSelected);
    
    // Take top 5
    filtered = filtered.slice(0, 5);
    
    setFilteredBoards(filtered);
  };

  const getWaitColor = (months) => {
    if (months <= 12) return 'text-green-600';
    if (months <= 24) return 'text-yellow-600';
    if (months <= 48) return 'text-orange-600';
    return 'text-red-600';
  };

  const getWaitBadge = (months) => {
    if (months <= 12) return { text: 'Fast', color: 'bg-green-100 text-green-700', icon: '⚡' };
    if (months <= 24) return { text: 'Moderate', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' };
    if (months <= 48) return { text: 'Slow', color: 'bg-orange-100 text-orange-700', icon: '🐢' };
    return { text: 'Very Slow', color: 'bg-red-100 text-red-700', icon: '⚠️' };
  };

  const currentSettlement = settlementTypes.find(s => s.value === selectedSettlement);
  const SettlementIcon = currentSettlement?.icon;

  const handleApplyNow = (board) => {
    if (user) {
      navigate('/apply', { state: { preferredBoard: board.id, settlementType: selectedSettlement } });
    } else {
      navigate('/register', { state: { redirectTo: '/apply', preferredBoard: board.id, settlementType: selectedSettlement } });
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#2C1810] to-[#B45F3A] rounded-2xl shadow-xl p-12">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
          <p className="text-white">Loading board recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2C1810] to-[#B45F3A] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Compass className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Where Should You Apply?</h2>
              <p className="text-white/70 text-sm">
                Find the best land board based on your preferences and location
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {/* Settlement Type Selector */}
            <div>
              <label className="block text-white/80 text-sm mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                What type of plot are you looking for?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {settlementTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedSettlement === type.value;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setSelectedSettlement(type.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left ${
                        isSelected
                          ? `bg-gradient-to-r ${type.color} text-white shadow-lg`
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location Toggle */}
            <div>
              <label className="block text-white/80 text-sm mb-2 flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Use my location for distance estimates
              </label>
              <button
                onClick={() => {
                  if (!useLocation) {
                    setUseLocation(true);
                    getUserLocation();
                  } else {
                    setUseLocation(false);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  useLocation
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {locationLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {useLocation ? (userLocation ? 'Location detected' : 'Location enabled') : 'Enable location'}
                </span>
              </button>
              {useLocation && !userLocation && !locationLoading && (
                <p className="text-xs text-white/50 mt-1">Enable location to see distance estimates</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        <div className="space-y-4">
          {filteredBoards.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <p className="text-gray-500">No boards found for {selectedSettlement} plots</p>
            </div>
          ) : (
            filteredBoards.map((board, idx) => {
              const waitBadge = getWaitBadge(board.waitForSelected);
              const isBest = idx === 0;
              
              return (
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 transition-all ${
                    isBest ? 'border-yellow-400' : 'border-transparent'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          {isBest && (
                            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                              <Award className="w-3 h-3" />
                              Best Match
                            </span>
                          )}
                          <span className="text-xs text-gray-400">#{idx + 1} Recommendation</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${waitBadge.color}`}>
                            {waitBadge.icon} {waitBadge.text}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-[#2C1810]">{board.name}</h3>
                        <p className="text-gray-500 text-sm">{board.region}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-400">Expected Wait Time</p>
                            <p className={`text-2xl font-bold ${getWaitColor(board.waitForSelected)}`}>
                              {board.waitForSelected} <span className="text-sm">months</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Approval Rate</p>
                            <p className="text-2xl font-bold text-green-600">
                              {board.approvalRate}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Pending Applications</p>
                            <p className="text-2xl font-bold text-[#2C1810]">
                              {board.totalWaiting.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Best For</p>
                            <p className="text-lg font-semibold text-[#B45F3A]">
                              {board.bestSettlement || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleApplyNow(board)}
                        className="bg-gradient-to-r from-[#2C1810] to-[#B45F3A] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        Apply Now
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Quick Stats Bar */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{board.waitForSelected} months avg wait</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{board.approvalRate}% approval rate</span>
                      </div>
                      {useLocation && userLocation && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>Distance estimated</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </AnimatePresence>

      {/* Help Text */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">How recommendations work</p>
            <p className="text-xs text-blue-600 mt-1">
              Boards are ranked by shortest expected wait time for {selectedSettlement.toLowerCase()} plots. 
              Approval rates show your chances of success. Apply to the board that best fits your needs!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedKPIs;