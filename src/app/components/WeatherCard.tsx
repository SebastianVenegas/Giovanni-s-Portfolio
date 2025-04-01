import React, { useEffect, useState } from 'react';
import { SunIcon, CloudIcon, CloudArrowDownIcon, CloudIcon as CloudOutline } from '@heroicons/react/24/outline';

export interface WeatherCardProps {
  location: string;
  temperature?: number | null;
  conditions?: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ 
  location, 
  temperature: initialTemperature = null,
  conditions: initialConditions = ''
}) => {
  const [weatherData, setWeatherData] = useState({
    temperature: initialTemperature,
    conditions: initialConditions,
    description: '',
    loading: true,
    error: false
  });

  useEffect(() => {
    // Fetch weather data when location changes
    const fetchWeatherData = async () => {
      if (!location) return;
      
      setWeatherData(prev => ({ ...prev, loading: true, error: false }));
      
      try {
        console.log(`[WeatherCard] Fetching weather data for location: "${location}"`);
        const response = await fetch(`/api/weather?city=${encodeURIComponent(location)}`);
        
        if (!response.ok) {
          console.error(`[WeatherCard] API response not OK: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch weather: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[WeatherCard] Received weather data:', data);
        
        setWeatherData({
          temperature: data.temperature,
          conditions: data.condition,
          description: data.description,
          loading: false,
          error: false
        });
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setWeatherData(prev => ({ 
          ...prev, 
          loading: false, 
          error: true 
        }));
      }
    };

    fetchWeatherData();
  }, [location]);

  // Determine which icon to show based on conditions
  const getWeatherIcon = () => {
    if (weatherData.loading) {
      return (
        <div className="animate-pulse flex">
          <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
        </div>
      );
    }
    
    const conditionsLower = (weatherData.conditions || '').toLowerCase();
    
    if (conditionsLower.includes('sun') || conditionsLower.includes('clear')) {
      return <SunIcon className="h-6 w-6 text-amber-400" />;
    } else if (conditionsLower.includes('cloud')) {
      return <CloudIcon className="h-6 w-6 text-zinc-400" />;
    } else if (conditionsLower.includes('rain') || conditionsLower.includes('drizzle')) {
      return <CloudArrowDownIcon className="h-6 w-6 text-blue-400" />;
    } else if (conditionsLower.includes('snow')) {
      return <CloudOutline className="h-6 w-6 text-blue-100" />;
    } else if (conditionsLower.includes('fog') || conditionsLower.includes('mist')) {
      return <CloudOutline className="h-6 w-6 text-gray-400" />;
    } else {
      return <SunIcon className="h-6 w-6 text-amber-400" />;
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium text-gray-800">
            {location || "Current Location"}
          </h3>
          <p className="text-xs mt-0.5 text-gray-500">
            {weatherData.loading ? 'Loading...' : 'Current conditions'}
          </p>
        </div>
        <div className="p-2 rounded-full bg-gray-100">
          {getWeatherIcon()}
        </div>
      </div>
      
      {weatherData.error ? (
        <div className="text-red-500 text-sm">
          Could not load weather data for this location.
        </div>
      ) : (
        <>
          <div className="flex items-baseline mb-3">
            {weatherData.loading ? (
              <div className="animate-pulse h-8 w-12 bg-gray-300 rounded"></div>
            ) : (
              <>
                <span className="text-3xl font-semibold text-gray-800">
                  {weatherData.temperature ? Math.round(weatherData.temperature as number) : '--'}
                </span>
                <span className="ml-1 text-sm text-gray-500">°F</span>
              </>
            )}
          </div>
          
          <div className="flex items-center">
            {weatherData.loading ? (
              <div className="animate-pulse h-4 w-24 bg-gray-300 rounded"></div>
            ) : (
              <span className="text-sm text-gray-700">
                {weatherData.description || weatherData.conditions || "Clear skies"}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}; 