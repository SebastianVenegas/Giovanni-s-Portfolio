import { NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function GET(request: Request) {
  try {
    // Check if API key is available
    if (!OPENWEATHER_API_KEY) {
      console.error('OpenWeather API key is missing');
      return NextResponse.json({
        error: 'Weather service is not configured',
        details: 'The weather service is not currently available.',
        message: 'Please contact the administrator to enable weather functionality.'
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    let city = searchParams.get('city');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    
    // Default to Maui if no location provided
    if (!city && !lat && !lon) {
      city = 'Maui';
    }
    
    // Clean up city name if provided - handle "maui" case insensitive
    if (city?.toLowerCase() === 'maui') {
      city = 'Maui, Hawaii';
    }
    
    console.log('Weather request params:', { city, lat, lon }); // Debug log

    let url = `${BASE_URL}/weather?appid=${OPENWEATHER_API_KEY}&units=imperial`;
    
    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else if (city) {
      url += `&q=${encodeURIComponent(city)}`;
    } else {
      return NextResponse.json({
        error: 'Location not found',
        details: 'No location was provided.',
        message: 'Please provide a city name or coordinates.'
      }, { status: 400 });
    }

    // Add error handling for fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(url, { 
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('OpenWeather API error:', response.status);
        
        if (response.status === 401) {
          return NextResponse.json({
            error: 'Invalid API key',
            details: 'The weather service authentication failed.',
            message: 'Please contact the administrator to fix the weather service.'
          }, { status: 401 });
        }
        
        if (response.status === 404) {
          return NextResponse.json({
            error: 'Location not found',
            details: `Could not find weather data for "${city || 'the provided coordinates'}"`,
            message: 'Please check the location name or coordinates and try again.'
          }, { status: 404 });
        }
        
        return NextResponse.json({
          error: 'Weather service error',
          details: `The weather service returned an error: ${response.status}`,
          message: 'Please try again later.'
        }, { status: response.status });
      }
      
      const responseData = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseData);
      } catch (e) {
        console.error('Failed to parse OpenWeather response:', responseData);
        throw new Error('Invalid response from weather service');
      }
      
      const formattedData = {
        location: data.name,
        temperature: data.main.temp,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon
      };
  
      console.log('Formatted response:', formattedData); // Debug log
      
      return NextResponse.json(formattedData);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('Fetch request timed out');
        return NextResponse.json({
          error: 'Request timeout',
          details: 'The weather service took too long to respond.',
          message: 'Please try again later.'
        }, { status: 504 });
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Weather API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch weather data',
      details: error?.message || 'An unexpected error occurred',
      message: 'The weather service is currently unavailable. Please try again later.'
    }, { status: 500 });
  }
} 