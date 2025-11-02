import axios from 'axios';
import { Shipment, CarrierRate, CreateShipmentRequest, Location, City } from '../types';

const API_BASE = '/api';

// Mock API for demo purposes - in production this would connect to real backend
class ApiService {
  private shipments: Shipment[] = [
    {
      id: 'SH-1023',
      origin: 'Moscow, Russia',
      destination: 'Saint Petersburg, Russia',
      status: 'In Transit',
      carrier: 'Russian Railways',
      currentLocation: { lat: 56.8431, lon: 35.9123 },
      estimatedArrival: '2025-01-15T14:30:00Z',
      progress: 65
    },
    {
      id: 'SH-1024',
      origin: 'London, UK',
      destination: 'Paris, France',
      status: 'Delivered',
      carrier: 'Eurostar Logistics',
      currentLocation: { lat: 48.8566, lon: 2.3522 },
      progress: 100
    },
    {
      id: 'SH-1025',
      origin: 'New York, USA',
      destination: 'Los Angeles, USA',
      status: 'Booked',
      carrier: 'American Transport',
      currentLocation: { lat: 40.7128, lon: -74.0060 },
      progress: 5
    }
  ];

  async getShipments(status?: string, query?: string): Promise<Shipment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...this.shipments];
    
    if (status) {
      filtered = filtered.filter(s => s.status === status);
    }
    
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(s => 
        s.id.toLowerCase().includes(lowercaseQuery) ||
        s.origin.toLowerCase().includes(lowercaseQuery) ||
        s.destination.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    return filtered;
  }

  async getRates(origin: string, destination: string, goodsInfo: string): Promise<CarrierRate[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const basePrice = Math.floor(Math.random() * 2000) + 1000;
    const baseDays = Math.floor(Math.random() * 5) + 3;
    
    return [
      {
        carrierName: 'Express Logistics',
        price: basePrice + 500,
        days: baseDays - 1
      },
      {
        carrierName: 'Standard Transport',
        price: basePrice,
        days: baseDays
      },
      {
        carrierName: 'Economy Shipping',
        price: basePrice - 300,
        days: baseDays + 2
      }
    ];
  }

  async createShipment(data: CreateShipmentRequest): Promise<Shipment> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get coordinates for origin city
    const originCoords = await this.getCityCoordinates(data.origin);
    
    const newShipment: Shipment = {
      id: `SH-${Math.floor(Math.random() * 9000) + 1000}`,
      origin: data.origin,
      destination: data.destination,
      status: 'Booked',
      carrier: data.selectedCarrier.carrierName,
      currentLocation: originCoords || { lat: 0, lon: 0 },
      progress: 0
    };
    
    this.shipments.push(newShipment);
    return newShipment;
  }

  async trackShipment(id: string): Promise<Location> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const shipment = this.shipments.find(s => s.id === id);
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    
    // Simulate movement for in-transit shipments
    if (shipment.status === 'In Transit' && shipment.progress < 95) {
      const progressIncrement = Math.random() * 2;
      shipment.progress = Math.min(95, (shipment.progress || 0) + progressIncrement);
      
      // Simulate coordinate movement (this would be real GPS data in production)
      const latOffset = (Math.random() - 0.5) * 0.01;
      const lonOffset = (Math.random() - 0.5) * 0.01;
      shipment.currentLocation.lat += latOffset;
      shipment.currentLocation.lon += lonOffset;
    }
    
    return shipment.currentLocation;
  }

  async searchCities(query: string): Promise<City[]> {
    if (query.length < 2) return [];
    
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`
      );
      
      return response.data
        .filter((item: any) => item.type === 'administrative' || item.class === 'place')
        .map((item: any) => ({
          name: item.name,
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon,
          country: item.address?.country || ''
        }));
    } catch (error) {
      console.error('Error searching cities:', error);
      return [];
    }
  }

  async getCityCoordinates(cityName: string): Promise<Location | null> {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`
      );
      
      if (response.data.length > 0) {
        const result = response.data[0];
        return {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting city coordinates:', error);
      return null;
    }
  }
}

export const apiService = new ApiService();