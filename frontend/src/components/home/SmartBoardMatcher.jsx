// frontend/src/components/home/SmartBoardMatcher.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Target, MapPin, Zap, Award, Navigation,
  ChevronRight, ChevronDown, Loader2, Home, Building2, TreePine, Tractor, Locate
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom markers
const createUserMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `<div style="width: 20px; height: 20px; background-color: #3B82F6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); animation: pulse 1.5s infinite;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const createBoardMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-board-marker',
    html: `<div style="width: 24px; height: 24px; background-color: #B45F3A; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const createRecommendedMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-recommended-marker',
    html: `<div style="width: 28px; height: 28px; background-color: #22C55E; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); animation: pulse 2s infinite;"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

const LocationMarker = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location && map) {
      map.setView([location.lat, location.lng], 10);
    }
  }, [location, map]);
  return null;
};

const SmartBoardMatcher = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [selectedSettlement, setSelectedSettlement] = useState('VILLAGE');
  const [useLocation, setUseLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(true);

  const settlementTypes = [
    { value: 'TOWN', label: 'Town Plot', icon: Building2, color: 'from-green-500 to-emerald-500' },
    { value: 'VILLAGE', label: 'Village Plot', icon: TreePine, color: 'from-orange-500 to-amber-500' },
    { value: 'FARM', label: 'Farm Plot', icon: Tractor, color: 'from-emerald-600 to-green-600' }
  ];

  // Botswana Land Boards coordinates
  const landBoardLocations = {
    'Ngwato Land Board': { lat: -22.3875, lng: 26.7108, region: 'Central' },
    'Kweneng Land Board': { lat: -24.4066, lng: 25.4951, region: 'Kweneng' },
    'Kgatleng Land Board': { lat: -24.3822, lng: 26.1469, region: 'Kgatleng' },
    'Ngwaketse Land Board': { lat: -24.9855, lng: 25.3379, region: 'Southern' },
    'Rolong Land Board': { lat: -25.2245, lng: 25.6792, region: 'Southern' },
    'Tlokweng Land Board': { lat: -24.6685, lng: 25.9659, region: 'South-East' },
    'Kgalagadi Land Board': { lat: -26.05, lng: 22.45, region: 'Kgalagadi' },
    'Chobe Land Board': { lat: -17.8018, lng: 25.1602, region: 'Chobe' },
    'Ghanzi Land Board': { lat: -21.6979, lng: 21.6458, region: 'Ghanzi' },
    'North West Land Board': { lat: -19.9966, lng: 23.4181, region: 'North-West' },
    'Tati Land Board': { lat: -21.1702, lng: 27.5078, region: 'North-East' },
    'Malete Land Board': { lat: -24.8715, lng: 25.8385, region: 'South-East' },
    'Palapye Sub Land Board': { lat: -22.5461, lng: 27.125, region: 'Central' },
    'Serowe Sub Land Board': { lat: -22.3875, lng: 26.7108, region: 'Central' },
    'Molepolole Sub Land Board': { lat: -24.4066, lng: 25.4951, region: 'Kweneng' },
    'Mochudi Sub Land Board': { lat: -24.3822, lng: 26.1469, region: 'Kgatleng' },
    'Kanye Sub Land Board': { lat: -24.9855, lng: 25.3379, region: 'Southern' },
    'Ramotswa Sub Land Board': { lat: -24.8715, lng: 25.8385, region: 'South-East' },
    'Mogoditshane Sub Land Board': { lat: -24.6282, lng: 25.9231, region: 'Kweneng' },
    'Francistown Sub Land Board': { lat: -21.1702, lng: 27.5078, region: 'North-East' },
    'Kasane Sub Land Board': { lat: -17.8018, lng: 25.1602, region: 'Chobe' },
    'Maun Sub Land Board': { lat: -19.9966, lng: 23.4181, region: 'North-West' },
  };

  useEffect(() => {
    fetchBoardData();
  }, []);

  useEffect(() => {
    if (boards.length > 0) {
      filterAndRankBoards();
    }
  }, [boards]);

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/waiting-list/stats');
      const data = response.data;
      
      console.log('API Response:', data);
      
      // Process boards - ONLY include boards with totalWaiting > 0
      const processedBoards = data
        .filter(board => (board.totalWaiting || board.pendingCount || 0) > 0)
        .map(board => {
          const location = landBoardLocations[board.boardName] || { 
            lat: -24.6282, 
            lng: 25.9231, 
            region: board.region || 'Unknown' 
          };
          
          const pendingCount = board.totalWaiting || board.pendingCount || 0;
          
          // Calculate estimated wait time based on pending count
          let estimatedWaitMonths;
          let approvalRate;
          
          if (pendingCount < 1000) {
            estimatedWaitMonths = 6;
            approvalRate = 75;
          } else if (pendingCount < 2000) {
            estimatedWaitMonths = 12;
            approvalRate = 68;
          } else if (pendingCount < 5000) {
            estimatedWaitMonths = 24;
            approvalRate = 60;
          } else if (pendingCount < 10000) {
            estimatedWaitMonths = 36;
            approvalRate = 52;
          } else {
            estimatedWaitMonths = 48;
            approvalRate = 45;
          }
          
          return {
            id: board.landBoardId,
            name: board.boardName,
            region: board.region,
            totalWaiting: pendingCount,
            estimatedWaitMonths: estimatedWaitMonths,
            approvalRate: approvalRate,
            lat: location.lat,
            lng: location.lng,
          };
        });
      
      // Sort by pending count (smallest first = fastest processing)
      processedBoards.sort((a, b) => a.totalWaiting - b.totalWaiting);
      
      console.log('Processed boards (sorted by fastest):', processedBoards.map(b => ({ name: b.name, pending: b.totalWaiting, wait: b.estimatedWaitMonths })));
      setBoards(processedBoards);
    } catch (err) {
      console.error('Error fetching board data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported');
      setLocationLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationLoading(false);
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError('Unable to get location');
        setLocationLoading(false);
        setUseLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const filterAndRankBoards = () => {
    // Get top 3 boards with smallest pending counts (fastest processing)
    const topBoards = [...boards].slice(0, 3);
    console.log('Top 3 recommendations:', topBoards.map(b => ({ name: b.name, pending: b.totalWaiting })));
    setFilteredBoards(topBoards);
  };

  const getWaitColor = (months) => {
    if (months <= 12) return 'text-green-600';
    if (months <= 24) return 'text-yellow-600';
    if (months <= 36) return 'text-orange-600';
    return 'text-red-600';
  };

  const getWaitBadge = (months) => {
    if (months <= 12) return { text: 'Fast', color: 'bg-green-100 text-green-700', icon: '⚡' };
    if (months <= 24) return { text: 'Moderate', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' };
    if (months <= 36) return { text: 'Slow', color: 'bg-orange-100 text-orange-700', icon: '🐢' };
    return { text: 'Very Slow', color: 'bg-red-100 text-red-700', icon: '⚠️' };
  };

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
    <div className="bg-gradient-to-br from-white to-[#F5E6D3] rounded-2xl shadow-xl overflow-hidden">
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
          .leaflet-marker-icon { background: transparent !important; border: none !important; }
        `}
      </style>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#2C1810] to-[#B45F3A] px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Smart Board Matcher</h2>
              <p className="text-white/70 text-sm">Top 3 Land Boards with fastest processing</p>
            </div>
          </div>
          <button
            onClick={() => setShowMap(!showMap)}
            className="text-white/80 hover:text-white text-sm flex items-center gap-1"
          >
            {showMap ? 'Hide Map' : 'Show Map'}
            <ChevronRight className={`w-4 h-4 transition-transform ${showMap ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#B45F3A]" />
              Plot Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {settlementTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedSettlement === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedSettlement(type.value)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                      isSelected
                        ? `bg-gradient-to-r ${type.color} text-white shadow-lg`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-2 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#B45F3A]" />
              Your Location
            </label>
            <button
              onClick={() => {
                if (!useLocation) {
                  setUseLocation(true);
                  getUserLocation();
                } else {
                  setUseLocation(false);
                  setUserLocation(null);
                }
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                useLocation && userLocation
                  ? 'bg-green-500 text-white'
                  : useLocation && locationLoading
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              <span className="text-sm">
                {useLocation && userLocation ? '✓ Location detected' : 
                 useLocation && locationLoading ? 'Getting location...' : 
                 'Use my location'}
              </span>
            </button>
            {locationError && <p className="text-xs text-red-500 mt-1">{locationError}</p>}
          </div>
        </div>

        {/* Map */}
        {showMap && (
          <div className="mb-8">
            <div className="h-96 rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg relative z-0">
              <MapContainer
                center={userLocation ? [userLocation.lat, userLocation.lng] : [-24.6282, 25.9231]}
                zoom={userLocation ? 9 : 6}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {userLocation && <LocationMarker location={userLocation} />}
                
                {userLocation && (
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserMarkerIcon()}>
                    <Popup><strong>📍 Your Location</strong></Popup>
                  </Marker>
                )}
                
                {boards.map((board) => {
                  const isTopRecommendation = filteredBoards[0]?.id === board.id;
                  return (
                    <Marker 
                      key={board.id} 
                      position={[board.lat, board.lng]} 
                      icon={isTopRecommendation ? createRecommendedMarkerIcon() : createBoardMarkerIcon()}
                    >
                      <Popup>
                        <div className="text-center min-w-[160px]">
                          <strong className="text-[#2C1810]">{board.name}</strong><br />
                          <span className="text-xs text-gray-500">{board.region}</span><br />
                          <span className="text-xs text-[#B45F3A]">⏱️ {board.estimatedWaitMonths} months wait</span><br />
                          <span className="text-xs text-green-600">✅ {board.approvalRate}% approval</span>
                          {isTopRecommendation && (
                            <div className="mt-2"><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">⭐ Best Match</span></div>
                          )}
                          <button onClick={() => handleApplyNow(board)} className="mt-2 text-xs bg-[#B45F3A] text-white px-3 py-1 rounded hover:bg-[#2C1810] w-full">Apply Now</button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
            <div className="flex justify-center gap-6 mt-3 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div><span>Your Location</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#B45F3A] rounded-full"></div><span>Land Board</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div><span>Top Recommendation</span></div>
            </div>
          </div>
        )}

        {/* Top 3 Recommendations */}
        <div className="space-y-4">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[#2C1810]/5 to-[#B45F3A]/5 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#B45F3A]" />
              <h3 className="font-bold text-[#2C1810]">Top 3 Recommendations</h3>
              <span className="text-xs text-gray-400">({filteredBoards.length} boards) • Sorted by fastest processing</span>
            </div>
            {showRecommendations ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </button>

          <AnimatePresence>
            {showRecommendations && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                {filteredBoards.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center">
                    <p className="text-gray-500">Loading recommendations...</p>
                  </div>
                ) : (
                  filteredBoards.map((board, idx) => {
                    const waitBadge = getWaitBadge(board.estimatedWaitMonths);
                    const isBest = idx === 0;
                    
                    return (
                      <motion.div
                        key={board.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all ${isBest ? 'border-yellow-400' : 'border-gray-100'}`}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between flex-wrap gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {isBest && <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full"><Award className="w-3 h-3" />Best Match</span>}
                                <span className="text-xs text-gray-400">#{idx + 1}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${waitBadge.color}`}>{waitBadge.icon} {waitBadge.text}</span>
                              </div>
                              <h4 className="text-lg font-bold text-[#2C1810]">{board.name}</h4>
                              <p className="text-sm text-gray-500">{board.region}</p>
                              <div className="grid grid-cols-3 gap-4 mt-4">
                                <div><p className="text-xs text-gray-400">Wait Time</p><p className={`text-xl font-bold ${getWaitColor(board.estimatedWaitMonths)}`}>{board.estimatedWaitMonths} <span className="text-sm">months</span></p></div>
                                <div><p className="text-xs text-gray-400">Approval Rate</p><p className="text-xl font-bold text-green-600">{board.approvalRate}%</p></div>
                                <div><p className="text-xs text-gray-400">Pending</p><p className="text-xl font-bold text-[#2C1810]">{board.totalWaiting.toLocaleString()}</p></div>
                              </div>
                            </div>
                            <button onClick={() => handleApplyNow(board)} className="bg-gradient-to-r from-[#2C1810] to-[#B45F3A] text-white px-5 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap">Apply Now <ChevronRight className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <Locate className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">How it works</p>
              <p className="text-xs text-blue-600 mt-1">Boards are ranked by total pending applications (smallest = fastest processing). Enable location to see boards near you.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartBoardMatcher;