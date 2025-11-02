import React, { useState } from 'react';
import { ArrowLeft, Package, MapPin, Truck, DollarSign, Clock } from 'lucide-react';
import { CarrierRate } from '../types';
import { apiService } from '../services/api';
import CitySearch from './CitySearch';

interface CreateShipmentFlowProps {
  onBack: () => void;
  onSuccess: () => void;
}

type Step = 'details' | 'rates' | 'confirmation';

const CreateShipmentFlow: React.FC<CreateShipmentFlowProps> = ({
  onBack,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [goodsInfo, setGoodsInfo] = useState('');
  const [rates, setRates] = useState<CarrierRate[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierRate | null>(null);

  const handleGetRates = async () => {
    if (!origin || !destination || !goodsInfo) return;

    setLoading(true);
    try {
      const carrierRates = await apiService.getRates(origin, destination, goodsInfo);
      setRates(carrierRates);
      setCurrentStep('rates');
    } catch (error) {
      console.error('Error getting rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipment = async () => {
    if (!selectedCarrier) return;

    setLoading(true);
    try {
      await apiService.createShipment({
        origin,
        destination,
        goodsInfo,
        selectedCarrier: {
          carrierName: selectedCarrier.carrierName,
          price: selectedCarrier.price
        }
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating shipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center gap-4 mb-8">
      {[
        { step: 'details', label: 'Shipment Details', icon: Package },
        { step: 'rates', label: 'Select Carrier', icon: Truck },
        { step: 'confirmation', label: 'Confirmation', icon: DollarSign }
      ].map(({ step, label, icon: Icon }, index) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === step ? 'bg-blue-600 text-white' : 
            ['details', 'rates'].indexOf(currentStep) > ['details', 'rates'].indexOf(step) ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className={`ml-2 ${currentStep === step ? 'text-white' : 'text-gray-400'}`}>
            {label}
          </span>
          {index < 2 && <div className="w-8 h-px bg-gray-700 ml-4" />}
        </div>
      ))}
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Shipment Details</h2>
      
      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Origin City *
          </label>
          <CitySearch
            placeholder="Search origin city..."
            value={origin}
            onCitySelect={setOrigin}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Destination City *
          </label>
          <CitySearch
            placeholder="Search destination city..."
            value={destination}
            onCitySelect={setDestination}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Goods Information *
          </label>
          <textarea
            value={goodsInfo}
            onChange={(e) => setGoodsInfo(e.target.value)}
            placeholder="Describe your goods (weight, dimensions, type, etc.)"
            rows={4}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-400"
          />
        </div>
      </div>

      <button
        onClick={handleGetRates}
        disabled={!origin || !destination || !goodsInfo || loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
      >
        {loading ? 'Getting Rates...' : 'Get Carrier Rates'}
      </button>
    </div>
  );

  const renderRatesStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Select Carrier</h2>
        <button
          onClick={() => setCurrentStep('details')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Edit Details
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">From: {origin}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">To: {destination}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {rates.map((rate, index) => (
          <div
            key={index}
            onClick={() => setSelectedCarrier(rate)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedCarrier?.carrierName === rate.carrierName
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white">{rate.carrierName}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {rate.days} days
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">${rate.price.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total cost</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setCurrentStep('confirmation')}
        disabled={!selectedCarrier}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
      >
        Continue to Confirmation
      </button>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Confirm Shipment</h2>

      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-gray-700">
          <span className="font-medium text-white">Route</span>
          <button
            onClick={() => setCurrentStep('details')}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Edit
          </button>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{origin} → {destination}</span>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <span className="font-medium text-white">Carrier</span>
          <button
            onClick={() => setCurrentStep('rates')}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Change
          </button>
        </div>
        {selectedCarrier && (
          <div className="flex justify-between items-center">
            <div>
              <div className="text-white font-medium">{selectedCarrier.carrierName}</div>
              <div className="text-sm text-gray-400">{selectedCarrier.days} days delivery</div>
            </div>
            <div className="text-2xl font-bold text-white">${selectedCarrier.price.toLocaleString()}</div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-700">
          <span className="font-medium text-white">Goods</span>
          <p className="text-gray-300 mt-1">{goodsInfo}</p>
        </div>
      </div>

      <button
        onClick={handleCreateShipment}
        disabled={loading}
        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
      >
        {loading ? 'Creating Shipment...' : 'Create Shipment'}
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Shipment</h1>
          <p className="text-gray-400 mt-1">Set up your shipment in a few easy steps</p>
        </div>
      </div>

      {renderStepIndicator()}

      <div className="bg-gray-900 rounded-lg p-8">
        {currentStep === 'details' && renderDetailsStep()}
        {currentStep === 'rates' && renderRatesStep()}
        {currentStep === 'confirmation' && renderConfirmationStep()}
      </div>
    </div>
  );
};

export default CreateShipmentFlow;