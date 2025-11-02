import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { apiService } from '../services/api';
import { City } from '../types';

interface CitySearchProps {
  placeholder?: string;
  value?: string;
  onCitySelect: (city: string) => void;
  className?: string;
}

const CitySearch: React.FC<CitySearchProps> = ({
  placeholder = "Search for a city...",
  value = "",
  onCitySelect,
  className = ""
}) => {
  const [query, setQuery] = useState(value);
  const [cities, setCities] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchCities = async () => {
      if (query.length < 2) {
        setCities([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await apiService.searchCities(query);
        setCities(results);
        setIsOpen(true);
      } catch (error) {
        console.error('Error searching cities:', error);
        setCities([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchCities, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleCitySelect = (city: City) => {
    const cityName = `${city.name}, ${city.country}`;
    setQuery(cityName);
    onCitySelect(cityName);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-400"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {isOpen && cities.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {cities.map((city, index) => (
            <button
              key={index}
              onClick={() => handleCitySelect(city)}
              className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <div className="text-white font-medium">{city.name}</div>
                <div className="text-gray-400 text-sm truncate">{city.display_name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitySearch;