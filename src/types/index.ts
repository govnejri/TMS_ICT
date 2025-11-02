export interface Location {
  lat: number;
  lon: number;
}

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: 'Booked' | 'In Transit' | 'Delivered';
  carrier: string;
  currentLocation: Location;
  estimatedArrival?: string;
  progress?: number;
}

export interface CarrierRate {
  carrierName: string;
  price: number;
  days: number;
}

export interface City {
  name: string;
  display_name: string;
  lat: string;
  lon: string;
  country: string;
}

export interface CreateShipmentRequest {
  origin: string;
  destination: string;
  goodsInfo: string;
  selectedCarrier: {
    carrierName: string;
    price: number;
  };
}