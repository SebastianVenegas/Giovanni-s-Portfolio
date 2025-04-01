'use client';

import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import { motion } from 'framer-motion';
import { WeatherCard } from './WeatherCard';
import { CloudIcon, SunIcon, CloudRainIcon, WindIcon, SearchIcon } from 'lucide-react'; 

export default function GenerativeWeatherUI() {
  const [location, setLocation] = useState('');
  const [weatherVisible, setWeatherVisible] = useState(false);
  const [weatherIcon, setWeatherIcon] = useState(<CloudIcon className="w-8 h-8 text-blue-300" />);
  const [time, setTime] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = (hour: number) => {
    if (hour >= 6 && hour < 18) {
      return <SunIcon className="w-8 h-8 text-yellow-300" />;
    } else {
      return <CloudIcon className="w-8 h-8 text-blue-300" />;
    }
  };

  const { messages, input, handleInputChange, handleSubmit: handleSubmitBase, isLoading } = useChat({
    api: '/api/admin/chat',
    headers: {
      'x-api-key': 'Aaron3209',
    },
    onResponse: (response) => {
      setError(null);
      console.log('[WeatherUI] Received response');
      
      // Extract query content from the last user message with improved typo handling
      const userQuery = messages.length > 0 ? messages[messages.length - 1].content : '';
      console.log('[WeatherUI] User query:', userQuery);
      
      // Check if query is about weather and set location immediately
      if (userQuery.toLowerCase().includes('weather')) {
        // First check for specific location patterns
        const specificLocationPatterns = [
          /weather (?:in|at|for|of)?\s+([^?.,]+)/i,  // "weather in X"
          /(?:what|how)(?:'s| is) the weather (?:in|at|for|of)?\s+([^?.,]+)/i,  // "what's the weather in X"
          /weather (?:conditions|forecast|like|report) (?:in|at|for|of)?\s+([^?.,]+)/i,  // "weather conditions in X"
          /(?:what|how) (?:are|is) the weather (?:conditions|like) (?:in|at|for|of)?\s+([^?.,]+)/i // "what are the weather conditions in X"
        ];
        
        let locationFound = false;
        
        // Try all patterns to extract location
        for (const pattern of specificLocationPatterns) {
          const match = userQuery.match(pattern);
          if (match && match[1]) {
            // Extract and clean up the location
            let queryLocation = match[1].trim();
            
            // Handle common typos and formatting
            queryLocation = queryLocation
              .replace(/\s+/g, ' ') // normalize spaces
              .trim();
              
            console.log('[WeatherUI] Extracted location from query:', queryLocation);
            setLocation(queryLocation);
            setWeatherVisible(true);
            locationFound = true;
            break;
          }
        }
        
        // If no specific location found, check for common locations
        if (!locationFound) {
          const lowercaseQuery = userQuery.toLowerCase();
          if (lowercaseQuery.includes('maui') || lowercaseQuery.includes('hawaii')) {
            setLocation('Maui');
            setWeatherVisible(true);
          } else if (lowercaseQuery.includes('weather') && !lowercaseQuery.includes('in')) {
            // Default to Maui if just asking about weather with no location
            setLocation('Maui');
            setWeatherVisible(true);
          }
        }
      }
    },
    onFinish: (message) => {
      // Check if the original user query was about weather
      const userQuery = messages.length > 0 ? messages[messages.length - 1].content : '';
      
      // If query is weather-related, always show the weather card regardless of AI response
      if (userQuery.toLowerCase().includes('weather')) {
        console.log('[WeatherUI] Weather query detected, ensuring weather card is visible');
        
        // First try to extract location from AI response
        const locationMatch = message.content.match(/weather in ([^is]+?)(?:is|with|has|shows)/i) || 
                              message.content.match(/in ([^,\.]+)(?:is currently|is now)/i) ||
                              message.content.match(/The weather in ([^\s].*?) is currently/i);
        
        console.log('[WeatherUI] AI response:', message.content);
        
        if (locationMatch && locationMatch[1]) {
          const extractedLocation = locationMatch[1].trim();
          console.log('[WeatherUI] Extracted location from response:', extractedLocation);
          setLocation(extractedLocation);
          setWeatherVisible(true);
        } else {
          // If AI response doesn't have location, extract from original query
          // Extensive location detection
          const locationPatterns = [
            /weather (?:in|at|for|of)?\s+([^?.,]+)/i,
            /(?:what|how)(?:'s| is) the weather (?:in|at|for|of)?\s+([^?.,]+)/i
          ];
          
          let locationFound = false;
          
          for (const pattern of locationPatterns) {
            const match = userQuery.match(pattern);
            if (match && match[1]) {
              const queryLocation = match[1].trim();
              console.log('[WeatherUI] Using location from query:', queryLocation);
              setLocation(queryLocation);
              setWeatherVisible(true);
              locationFound = true;
              break;
            }
          }
          
          // Check for specific locations in query
          if (!locationFound) {
            const lowercaseQuery = userQuery.toLowerCase();
            if (lowercaseQuery.includes('maui') || lowercaseQuery.includes('hawaii')) {
              console.log('[WeatherUI] Setting location to Maui');
              setLocation('Maui');
              setWeatherVisible(true);
              locationFound = true;
            } else if (lowercaseQuery.includes('moreno valley')) {
              console.log('[WeatherUI] Setting location to Moreno Valley');
              setLocation('Moreno Valley');
              setWeatherVisible(true);
              locationFound = true;
            }
          }
          
          // If still no location and query mentions weather, default to Maui
          if (!locationFound && userQuery.toLowerCase().includes('weather')) {
            console.log('[WeatherUI] No specific location found, defaulting to Maui');
            setLocation('Maui');
            setWeatherVisible(true);
          }
        }

        // Set a weather icon based on content or use default
        if (message.content.toLowerCase().includes('rain')) {
          setWeatherIcon(<CloudRainIcon className="w-8 h-8 text-blue-300" />);
        } else if (message.content.toLowerCase().includes('wind')) {
          setWeatherIcon(<WindIcon className="w-8 h-8 text-gray-300" />);
        } else if (message.content.toLowerCase().includes('sun') || message.content.toLowerCase().includes('clear')) {
          setWeatherIcon(<SunIcon className="w-8 h-8 text-yellow-300" />);
        } else {
          setWeatherIcon(getWeatherIcon(time.getHours()));
        }
      }
    },
    onError: (err) => {
      console.error('[WeatherUI] Error:', err);
      setError("Sorry, there was an error processing your request.");
    }
  });

  // Custom submit handler that pre-processes the input
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    // Check if query is about weather and set the card to visible
    if (input.toLowerCase().includes('weather')) {
      // Try to extract location from input
      const match = input.match(/weather (?:in|at|for)?\s+([^?.,]+)/i);
      if (match && match[1]) {
        const loc = match[1].trim();
        console.log('[WeatherUI] Setting location from input:', loc);
        setLocation(loc);
        setWeatherVisible(true);
      } else if (input.toLowerCase().includes('weather') && !input.toLowerCase().includes('in')) {
        // Default to Maui if just asking about weather
        setLocation('Maui');
        setWeatherVisible(true);
      }
    }
    
    // Continue with the normal form submission
    handleSubmitBase(e);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto p-4 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-4 rounded-lg bg-gradient-to-r from-blue-900 to-indigo-900 shadow-lg"
      >
        <div className="flex items-center justify-center mb-2">
          {weatherIcon}
          <h2 className="text-2xl font-bold text-white ml-2">Weather Assistant</h2>
        </div>
        <p className="text-gray-300 text-sm">Ask me about the weather anywhere in the world</p>
        <div className="text-xs text-gray-400 mt-1">
          {time.toLocaleTimeString()} | {time.toLocaleDateString()}
        </div>
      </motion.div>

      {weatherVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <WeatherCard location={location} />
        </motion.div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 max-h-[400px] p-4 rounded-lg bg-gray-900/50">
        {messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 text-gray-400"
          >
            <CloudIcon className="w-12 h-12 mx-auto mb-2 text-blue-400" />
            <p>Try asking about the weather in your favorite city!</p>
            <div className="mt-2 text-sm text-gray-500">
              Examples:
              <ul className="mt-1 space-y-1">
                <li>"What's the weather in New York?"</li>
                <li>"How's the weather in Tokyo today?"</li>
                <li>"Weather conditions in Paris"</li>
              </ul>
            </div>
          </motion.div>
        )}
        
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg max-w-[80%] ${
              message.role === 'user'
                ? 'bg-blue-600 text-white ml-auto rounded-tr-none'
                : 'bg-gray-700 text-white rounded-tl-none'
            }`}
          >
            {message.content}
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-700 text-white p-3 rounded-lg max-w-[80%] rounded-tl-none"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
            </div>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about the weather..."
            className="w-full p-3 pl-10 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <span>Send</span>
          )}
        </button>
      </form>
    </div>
  );
} 