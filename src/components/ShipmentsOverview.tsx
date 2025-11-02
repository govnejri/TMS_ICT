import React, { useState, useEffect } from 'react';
import { Plus, Package, Truck, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Shipment } from '../types';
import { apiService } from '../services/api';

interface ShipmentsOverviewProps {
  onCreateShipment: () => void;
  onTrackShipment: (shipment: Shipment) => void;
}

const ShipmentsOverview: React.FC<ShipmentsOverviewProps> = ({
  onCreateShipment,
  onTrackShipment
}) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const loadShipments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getShipments(selectedStatus || undefined);
      setShipments(data);
    } catch (error) {
      console.error('Error loading shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, [selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Booked': return 'bg-yellow-900 text-yellow-300';
      case 'In Transit': return 'bg-blue-900 text-blue-300';
      case 'Delivered': return 'bg-green-900 text-green-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Booked': return <Calendar className="w-4 h-4" />;
      case 'In Transit': return <Truck className="w-4 h-4" />;
      case 'Delivered': return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Shipments</h1>
          <p className="text-gray-400 mt-1">Manage and track your shipments</p>
        </div>
        <button
          onClick={onCreateShipment}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Shipment
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedStatus('')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedStatus === '' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Shipments
        </button>
        {['Booked', 'In Transit', 'Delivered'].map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Shipments Grid */}
      <div className="grid gap-4">
        {shipments.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No shipments found</h3>
            <p className="text-gray-500">Create your first shipment to get started</p>
          </div>
        ) : (
          shipments.map(shipment => (
            <div key={shipment.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    {getStatusIcon(shipment.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{shipment.id}</h3>
                    <p className="text-gray-400">{shipment.carrier}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(shipment.status)}`}>
                  {getStatusIcon(shipment.status)}
                  {shipment.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">From: {shipment.origin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">To: {shipment.destination}</span>
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

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Current: {shipment.currentLocation.lat.toFixed(4)}, {shipment.currentLocation.lon.toFixed(4)}
                </div>
                <button
                  onClick={() => onTrackShipment(shipment)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Track on Map
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShipmentsOverview;