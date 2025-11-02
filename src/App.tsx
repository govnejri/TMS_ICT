import React, { useState } from 'react';
import { Shipment } from './types';
import ShipmentsOverview from './components/ShipmentsOverview';
import CreateShipmentFlow from './components/CreateShipmentFlow';
import MapView from './components/MapView';

type View = 'overview' | 'create' | 'map';

function App() {
  const [currentView, setCurrentView] = useState<View>('overview');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateShipment = () => {
    setCurrentView('create');
  };

  const handleTrackShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setCurrentView('map');
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
    setSelectedShipment(null);
  };

  const handleShipmentCreated = () => {
    setCurrentView('overview');
    setRefreshKey(prev => prev + 1); // Force refresh of shipments list
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {currentView === 'overview' && (
          <ShipmentsOverview
            key={refreshKey}
            onCreateShipment={handleCreateShipment}
            onTrackShipment={handleTrackShipment}
          />
        )}
        
        {currentView === 'create' && (
          <CreateShipmentFlow
            onBack={handleBackToOverview}
            onSuccess={handleShipmentCreated}
          />
        )}
        
        {currentView === 'map' && selectedShipment && (
          <MapView
            shipment={selectedShipment}
            onBack={handleBackToOverview}
          />
        )}
      </div>
    </div>
  );
}

export default App;