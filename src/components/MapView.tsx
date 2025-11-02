import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, Package, Truck, MapPin, Clock, Route } from 'lucide-react';
import { Shipment, Location } from '../types';
import { apiService } from '../services/api';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  shipment: Shipment;
  onBack: () => void;
}

const MapView: React.FC<MapViewProps> = ({ shipment, onBack }) => {
  const [currentLocation, setCurrentLocation] = useState<Location>(shipment.currentLocation);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [originCoords, setOriginCoords] = useState<Location | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Location | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Custom icons
  const truckIcon = L.divIcon({
    html: `<div style="background-color: #3B82F6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg></div>`,
    className: 'truck-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  const originIcon = L.divIcon({
    html: `<div style="background-color: #10B981; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/></svg></div>`,
    className: 'origin-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const destinationIcon = L.divIcon({
    html: `<div style="background-color: #EF4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/></svg></div>`,
    className: 'destination-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  useEffect(() => {
    // Get coordinates for origin and destination
    const loadRouteCoordinates = async () => {
      try {
        const [origin, destination] = await Promise.all([
          apiService.getCityCoordinates(shipment.origin),
          apiService.getCityCoordinates(shipment.destination)
        ]);
        setOriginCoords(origin);
        setDestinationCoords(destination);
      } catch (error) {
        console.error('Error loading route coordinates:', error);
      }
    };

    loadRouteCoordinates();

    // Start tracking if shipment is in transit
    if (shipment.status === 'In Transit') {
      const trackingInterval = setInterval(async () => {
        try {
          setLoading(true);
          const newLocation = await apiService.trackShipment(shipment.id);
          setCurrentLocation(newLocation);
          setLastUpdate(new Date());
        } catch (error) {
          console.error('Error tracking shipment:', error);
        } finally {
          setLoading(false);
        }
      }, 5000);

      intervalRef.current = trackingInterval;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [shipment.id, shipment.status]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Booked': return 'text-yellow-400';
      case 'In Transit': return 'text-blue-400';
      case 'Delivered': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const calculateDistance = (loc1: Location, loc2: Location) => {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lon - loc1.lon) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const estimatedTimeLeft = destinationCoords ? 
    `${Math.round(calculateDistance(currentLocation, destinationCoords) / 50)} hours` : 'Calculating...';

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Tracking {shipment.id}</h1>
              <p className="text-gray-400">{shipment.origin} → {shipment.destination}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Last Update</div>
              <div className="text-white font-medium">{formatTime(lastUpdate)}</div>
            </div>
            {loading && (
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-96 bg-gray-800 border-r border-gray-700 p-6 space-y-6 overflow-y-auto">
          {/* Status Card */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{shipment.id}</h3>
                <p className={`text-sm font-medium ${getStatusColor(shipment.status)}`}>
                  {shipment.status}
                </p>
              </div>
            </div>
            
            {shipment.progress !== undefined && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm text-white font-medium">{Math.round(shipment.progress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${shipment.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400 mb-1">Carrier</div>
                <div className="text-white font-medium">{shipment.carrier}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Est. Time Left</div>
                <div className="text-white font-medium">{estimatedTimeLeft}</div>
              </div>
            </div>
          </div>

          {/* Route Info */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Route className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-white">Route</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="text-white font-medium">Origin</div>
                  <div className="text-gray-400 text-sm">{shipment.origin}</div>
                </div>
              </div>
              
              <div className="ml-1.5 w-px h-6 bg-gray-600"></div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-white font-medium">Current Location</div>
                  <div className="text-gray-400 text-sm">
                    {currentLocation.lat.toFixed(4)}, {currentLocation.lon.toFixed(4)}
                  </div>
                </div>
              </div>
              
              <div className="ml-1.5 w-px h-6 bg-gray-600"></div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <div className="text-white font-medium">Destination</div>
                  <div className="text-gray-400 text-sm">{shipment.destination}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Updates */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-white">Live Updates</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">{formatTime(lastUpdate)} - Location updated</span>
              </div>
              
              {shipment.status === 'In Transit' && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-300">Auto-tracking every 5 seconds</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[currentLocation.lat, currentLocation.lon]}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Current location marker */}
            <Marker position={[currentLocation.lat, currentLocation.lon]} icon={truckIcon}>
              <Popup>
                <div className="text-center">
                  <strong>Current Location</strong><br />
                  {shipment.id}<br />
                  Status: {shipment.status}
                </div>
              </Popup>
            </Marker>
            
            {/* Origin marker */}
            {originCoords && (
              <Marker position={[originCoords.lat, originCoords.lon]} icon={originIcon}>
                <Popup>
                  <div className="text-center">
                    <strong>Origin</strong><br />
                    {shipment.origin}
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Destination marker */}
            {destinationCoords && (
              <Marker position={[destinationCoords.lat, destinationCoords.lon]} icon={destinationIcon}>
                <Popup>
                  <div className="text-center">
                    <strong>Destination</strong><br />
                    {shipment.destination}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapView;