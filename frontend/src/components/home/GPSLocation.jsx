// src/components/home/GPSLocation.jsx

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Navigation, MapPin, Building, Hospital, School, Bus, 
  Shield, ChevronRight, Locate, TrendingUp, Clock 
} from 'lucide-react';

// Fix marker icons for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to center map on user location
const LocationMarker = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], 10);
    }
  }, [location, map]);
  return null;
};

const GPSLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nearbyLandBoards, setNearbyLandBoards] = useState([]);
  const [nearbyServices, setNearbyServices] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [showMap, setShowMap] = useState(true);

  // Botswana Land Boards coordinates (approximate)
  const landBoards = [
    { name: 'Gaborone Land Board', lat: -24.6282, lng: 25.9231, region: 'South-East', waitingTime: '18-24 months', pending: 12450, type: 'Main' },
    { name: 'Francistown Land Board', lat: -21.1702, lng: 27.5078, region: 'North-East', waitingTime: '12-18 months', pending: 8450, type: 'Main' },
    { name: 'Maun Land Board', lat: -19.9966, lng: 23.4181, region: 'North-West', waitingTime: '8-12 months', pending: 5620, type: 'Main' },
    { name: 'Kasane Land Board', lat: -17.8018, lng: 25.1602, region: 'North-West', waitingTime: '6-10 months', pending: 3240, type: 'Subordinate' },
    { name: 'Molepolole Land Board', lat: -24.4066, lng: 25.4951, region: 'Kweneng', waitingTime: '24-36 months', pending: 18750, type: 'Main' },
    { name: 'Serowe Land Board', lat: -22.3875, lng: 26.7108, region: 'Central', waitingTime: '20-30 months', pending: 15680, type: 'Main' },
    { name: 'Kanye Land Board', lat: -24.9855, lng: 25.3379, region: 'Southern', waitingTime: '15-20 months', pending: 8920, type: 'Main' },
    { name: 'Mochudi Land Board', lat: -24.3822, lng: 26.1469, region: 'Kgatleng', waitingTime: '30-48 months', pending: 21450, type: 'Main' },
    { name: 'Ramotswa Land Board', lat: -24.8715, lng: 25.8385, region: 'South-East', waitingTime: '12-18 months', pending: 6780, type: 'Subordinate' },
    { name: 'Tlokweng Land Board', lat: -24.6685, lng: 25.9659, region: 'South-East', waitingTime: '18-24 months', pending: 10540, type: 'Subordinate' },
    { name: 'Jwaneng Land Board', lat: -24.6017, lng: 24.7359, region: 'Southern', waitingTime: '8-12 months', pending: 4530, type: 'Main' },
    { name: 'Lobatse Land Board', lat: -25.2245, lng: 25.6792, region: 'South-East', waitingTime: '10-15 months', pending: 5670, type: 'Main' },
  ];

  // Botswana services (schools, clinics, roads)
  const services = [
    { name: 'Sir Ketumile Masire Hospital', type: 'Hospital', lat: -24.6282, lng: 25.9231, icon: Hospital },
    { name: 'University of Botswana', type: 'Education', lat: -24.6546, lng: 25.9362, icon: School },
    { name: 'Gaborone Private Hospital', type: 'Hospital', lat: -24.6591, lng: 25.9157, icon: Hospital },
    { name: 'Francistown Referral Hospital', type: 'Hospital', lat: -21.1702, lng: 27.5078, icon: Hospital },
    { name: 'Maun General Hospital', type: 'Hospital', lat: -19.9966, lng: 23.4181, icon: Hospital },
    { name: 'Molepolole Hospital', type: 'Hospital', lat: -24.4066, lng: 25.4951, icon: Hospital },
    { name: 'Botswana Police Station - Gaborone', type: 'Police', lat: -24.6512, lng: 25.9242, icon: Shield },
    { name: 'Gaborone Bus Rank', type: 'Transport', lat: -24.6589, lng: 25.9123, icon: Bus },
  ];

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        findNearbyLocations(latitude, longitude);
        setLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Unable to get your location. Please enable location services.');
        setLoading(false);
      }
    );
  };

  const findNearbyLocations = (lat, lng) => {
    const nearbyBoards = landBoards.map(board => ({
      ...board,
      distance: calculateDistance(lat, lng, board.lat, board.lng)
    })).sort((a, b) => a.distance - b.distance).slice(0, 5);
    setNearbyLandBoards(nearbyBoards);

    const nearbyServicesList = services.map(service => ({
      ...service,
      distance: calculateDistance(lat, lng, service.lat, service.lng)
    })).sort((a, b) => a.distance - b.distance).slice(0, 5);
    setNearbyServices(nearbyServicesList);
  };

  const getDistanceColor = (distance) => {
    if (distance < 30) return 'text-green-600';
    if (distance < 100) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getWaitTimeColor = (waitTime) => {
    const months = parseInt(waitTime);
    if (months < 12) return 'text-green-600';
    if (months < 24) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-[#F5E6D3] rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#B45F3A]/20 rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Locate className="w-6 h-6 text-[#B45F3A] animate-bounce" />
            </div>
          </div>
          <p className="mt-4 text-gray-600">Detecting your location...</p>
          <p className="text-sm text-gray-400">Please enable location services</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-white to-[#F5E6D3] rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-red-500" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={getCurrentLocation}
            className="px-6 py-2 bg-[#B45F3A] text-white rounded-lg hover:bg-[#2C1810] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-[#F5E6D3] rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2C1810] to-[#3d2418] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Location-Based Decision Support</h3>
              <p className="text-white/70 text-sm">Find nearby Land Boards and essential services</p>
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
        {/* Location Info */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Locate className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Your Location</p>
              <p className="font-medium text-gray-800">
                {location?.lat.toFixed(4)}°, {location?.lng.toFixed(4)}°
              </p>
            </div>
          </div>
          <button
            onClick={getCurrentLocation}
            className="text-sm text-[#B45F3A] hover:text-[#2C1810] flex items-center gap-1"
          >
            <Locate className="w-4 h-4" />
            Refresh Location
          </button>
        </div>

        {/* Map */}
        {showMap && (
          <div className="mb-8">
            <div className="h-96 rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
              <MapContainer
                center={[location.lat, location.lng]}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker location={location} />
                
                {/* User Location Marker */}
                <Marker position={[location.lat, location.lng]}>
                  <Popup>📍 You are here</Popup>
                </Marker>
                
                {/* Land Board Markers */}
                {landBoards.map((board, idx) => (
                  <Marker key={idx} position={[board.lat, board.lng]}>
                    <Popup>
                      <div className="text-center">
                        <strong className="text-[#2C1810]">{board.name}</strong><br />
                        <span className="text-sm text-gray-600">{board.region}</span><br />
                        <span className="text-xs text-[#B45F3A]">⏱️ {board.waitingTime}</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Nearby Land Boards - Enhanced */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#2C1810]/10 rounded-lg flex items-center justify-center">
                <Building className="w-4 h-4 text-[#2C1810]" />
              </div>
              <h4 className="font-semibold text-[#2C1810]">Nearest Land Boards</h4>
              <span className="text-xs text-gray-400 ml-auto">{nearbyLandBoards.length} found</span>
            </div>
            <div className="space-y-3">
              {nearbyLandBoards.map((board, idx) => (
                <div 
                  key={idx} 
                  className={`group p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                    selectedBoard === board.name 
                      ? 'bg-[#B45F3A]/10 border-2 border-[#B45F3A] shadow-md'
                      : 'bg-gray-50 hover:bg-[#F5E6D3] border border-transparent hover:border-[#B45F3A]/30'
                  }`}
                  onClick={() => setSelectedBoard(selectedBoard === board.name ? null : board.name)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold text-gray-800 group-hover:text-[#2C1810] transition-colors">
                          {board.name}
                        </h5>
                        <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-500">
                          {board.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{board.region}</p>
                      
                      {/* Expanded Info */}
                      {selectedBoard === board.name && (
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-[#B45F3A]" />
                            <span className="text-gray-600">Est. wait time:</span>
                            <span className={`font-medium ${getWaitTimeColor(board.waitingTime)}`}>
                              {board.waitingTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-[#B45F3A]" />
                            <span className="text-gray-600">Pending applications:</span>
                            <span className="font-medium text-gray-800">
                              {board.pending.toLocaleString()}
                            </span>
                          </div>
                          <a 
                            href={`/apply?board=${board.name}`} 
                            className="inline-flex items-center gap-1 mt-2 text-sm text-[#B45F3A] hover:text-[#2C1810] font-medium"
                          >
                            Apply to this board
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getDistanceColor(board.distance)}`}>
                        {board.distance} km
                      </p>
                      <p className="text-xs text-gray-400">away</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Services - Enhanced */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#B45F3A]/10 rounded-lg flex items-center justify-center">
                <Hospital className="w-4 h-4 text-[#B45F3A]" />
              </div>
              <h4 className="font-semibold text-[#2C1810]">Nearby Services</h4>
              <span className="text-xs text-gray-400 ml-auto">{nearbyServices.length} found</span>
            </div>
            <div className="space-y-3">
              {nearbyServices.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-[#F5E6D3] transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
                        <Icon className="w-5 h-5 text-[#B45F3A]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{service.name}</p>
                        <p className="text-xs text-gray-500">{service.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${getDistanceColor(service.distance)}`}>
                        {service.distance} km
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Application Advice - Enhanced */}
        {nearbyLandBoards.length > 0 && (
          <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-800 font-medium mb-1">📌 Application Recommendation</p>
                <p className="text-sm text-green-700">
                  Based on your location, you are closest to <strong className="text-green-900">{nearbyLandBoards[0].name}</strong> ({nearbyLandBoards[0].distance} km away).
                  {nearbyLandBoards[0].distance < 50 
                    ? ' This Land Board is in your local area, making it convenient for follow-up visits and inquiries.'
                    : ' Consider the distance for potential office visits. You may also apply to other Land Boards with shorter waiting times.'}
                </p>
                <div className="mt-3 flex gap-3">
                  <a 
                    href={`/apply?board=${nearbyLandBoards[0].name}`}
                    className="inline-flex items-center gap-1 text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Apply Now
                    <ChevronRight className="w-4 h-4" />
                  </a>
                  <a 
                    href="/waiting-list"
                    className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-900"
                  >
                    Compare waiting times
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-200">
          <span className="font-medium">💡 Note:</span> You can apply to any Land Board regardless of your location.
          Use this tool to understand the logistics and make informed decisions about where to apply.
        </p>
      </div>
    </div>
  );
};

export default GPSLocation;