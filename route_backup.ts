import { NextRequest } from 'next/server';
import { createClient } from '@vercel/postgres';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ContactStats, ChatSession } from './types';
import OpenAI from 'openai';

export const runtime = 'edge';
export const preferredRegion = 'auto';

// Function to fetch weather data
async function fetchWeatherData(location: string) {
  try {
    console.log(`[Weather API] Fetching weather data for location: "${location}"`);
    
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.error('[Weather API] Error: OpenWeather API key not configured');
      throw new Error('OpenWeather API key not configured');
    }

    // Format multi-word locations correctly
    let formattedLocation = location
      .replace(/\s+/g, ' ')                 // normalize spaces
      .replace(/(california|CA)$/i, ',CA')  // format state properly
      .replace(/\s+,/g, ',');               // remove spaces before commas
      
    // Enhance with known locations that might need country codes
    const knownLocations: Record<string, string> = {
      // US locations
      'lake tahoe': 'Lake Tahoe,CA,US',
      'tahoe': 'Lake Tahoe,CA,US',
      'tahoee': 'Lake Tahoe,CA,US',
      'taheo': 'Lake Tahoe,CA,US',
      
      // Islands and tourist destinations
      'maui': 'Maui,HI,US',
      'hawaii': 'Hawaii,US',
      'kauai': 'Kauai,HI,US',
      'oahu': 'Oahu,HI,US',
      'honolulu': 'Honolulu,HI,US',
      'waikiki': 'Waikiki,HI,US',
      'bali': 'Bali,ID',
      'phuket': 'Phuket,TH',
      'tahiti': 'Tahiti,PF',
      'santorini': 'Santorini,GR',
      'ibiza': 'Ibiza,ES',
      'cancun': 'Cancun,MX',
      'tulum': 'Tulum,MX',
      'cabo': 'Cabo San Lucas,MX',
      
      // Major international cities
      'paris': 'Paris,FR',
      'london': 'London,GB',
      'tokyo': 'Tokyo,JP',
      'rome': 'Rome,IT',
      'barcelona': 'Barcelona,ES',
      'beijing': 'Beijing,CN',
      'sydney': 'Sydney,AU',
      'dubai': 'Dubai,AE',
      'moscow': 'Moscow,RU',
      'amsterdam': 'Amsterdam,NL',
      'berlin': 'Berlin,DE',
      'madrid': 'Madrid,ES',
      'singapore': 'Singapore,SG',
      'bangkok': 'Bangkok,TH',
      'toronto': 'Toronto,CA',
      'zurich': 'Zurich,CH'
    };
    
    // Check if this is a single-word location that might need country/state info
    const locationLower = location.toLowerCase().trim();
    if (knownLocations[locationLower]) {
      console.log(`[Weather API] Found known location: ${locationLower} -> ${knownLocations[locationLower]}`);
      formattedLocation = knownLocations[locationLower];
    }

    console.log(`[Weather API] Formatted location: "${formattedLocation}"`);

    let response;
    let data;
    
    // List of potential formatting variations to try
    const locationVariations = [
      formattedLocation,                        // Try original formatted location
      formattedLocation.split(',')[0],          // Try just the city name
      `${formattedLocation},US`,                // Try adding US if not specified
      locationLower.includes('island') ? formattedLocation.replace('Island', '') : null, // Handle "Island" in name
      locationLower.includes('city') ? formattedLocation.replace('City', '') : null     // Handle "City" in name
    ].filter(Boolean) as string[];  // Remove null values
    
    // Add special cases for common problematic locations
    if (locationLower.includes('lake tahoe')) {
      locationVariations.push('Lake Tahoe,CA,US');
      locationVariations.push('South Lake Tahoe,CA,US');
      locationVariations.push('Tahoe City,CA,US');
      locationVariations.push('Stateline,NV,US');
    }
    
    // Add common tourist destinations that might be entered without country
    if (locationLower === 'maui' && !locationVariations.includes('Maui,HI,US')) {
      locationVariations.push('Maui,HI,US');
    }
    
    // Try each variation until one works
    let lastError = null;
    for (const variant of locationVariations) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(variant)}&appid=${apiKey}&units=imperial`;
        console.log(`[Weather API] Trying with location variant: "${variant}"`);
        
        response = await fetch(url);
        
        if (response.ok) {
          const responseText = await response.text();
          data = JSON.parse(responseText);
          console.log(`[Weather API] Success with location variant: "${variant}"`);
          break; // Success, exit the loop
        } else {
          lastError = new Error(`Weather API error with "${variant}": ${response.status}`);
          console.log(`[Weather API] Failed with location variant: "${variant}" (${response.status})`);
        }
      } catch (err) {
        lastError = err;
        console.error(`[Weather API] Error with location variant "${variant}":`, err);
      }
    }
    
    // If we didn't get data from any variation, throw the last error
    if (!data) {
      throw lastError || new Error(`Location "${location}" not found. Try adding country or state information.`);
    }

    console.log('[Weather API] Successfully fetched weather data:', {
      location: data.name,
      temp: data.main.temp,
      conditions: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed
    });

    return data;
  } catch (error) {
    console.error('[Weather API] Error fetching weather:', error);
    throw error;
  }
}

// Add a function to suggest corrections for misspelled locations
function getSuggestionForMisspelling(location: string): string[] {
  // Common major cities across the world
  const commonLocations = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA',
    'San Antonio, TX',
    'San Diego, CA',
    'Dallas, TX',
    'San Jose, CA',
    'London, UK',
    'Tokyo, Japan',
    'Paris, France',
    'Berlin, Germany',
    'Rome, Italy',
    'Madrid, Spain',
    'Toronto, Canada',
    'Sydney, Australia',
    'Beijing, China',
    'Dubai, UAE'
  ];
  
  // Very basic fuzzy matching by finding cities that contain parts of the location string
  const lowerLocation = location.toLowerCase();
  const words = lowerLocation.split(/\s+/);
  
  // For each word in the location, find cities that might match
  const potentialMatches = words
    .filter(word => word.length > 2) // Only use words of reasonable length
    .flatMap(word => {
      return commonLocations.filter(city => 
        city.toLowerCase().includes(word) || 
        // Check for common misspellings using Levenshtein distance hack
        city.toLowerCase().split(/\s+/).some(cityWord => 
          cityWord.length > 3 && // Only check longer words
          (cityWord.startsWith(word.substring(0, 3)) || // Same prefix
           cityWord.endsWith(word.substring(word.length - 3)) || // Same suffix
           (word.length > 4 && cityWord.includes(word.substring(0, 4)))) // Contains significant part
        )
      );
    });
  
  // Return unique suggestions, prioritizing exact matches
  return [...new Set(potentialMatches)].slice(0, 3);
}

// Fix the typo corrections object
const typoCorrections = {
  'clafornia': 'california',
  'califorinia': 'california',
  'califorina': 'california',
  'calfornia': 'california',
  'caiifornia': 'california',
  'taheo': 'tahoe',
  'taho': 'tahoe',
  'thaoe': 'tahoe',
  'tatoe': 'tahoe',
};

export async function POST(req: NextRequest) {
  try {
    // Extract the API key
    const apiKey = req.headers.get('x-api-key');
    
    // Validate the API key
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      console.log('Invalid API key provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body
    const { messages } = await req.json();
    
    // Validate request body
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request format. Expected messages array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check for weather-related queries
    const lastMessage = messages[messages.length - 1];
    let weatherContext = '';
    if (lastMessage.role === 'user' && lastMessage.content.toLowerCase().includes('weather')) {
      try {
        // Extract location from message with improved typo handling
        const locationMatch = lastMessage.content.match(/weather (?:in|at|for)?\s+([^?.,]+)/i);
        if (locationMatch) {
          let location = locationMatch[1].trim();
          
          // Normalize location text for better matching
          let normalizedLocation = location.toLowerCase();
          
          // Apply corrections for known typos
          Object.entries(typoCorrections).forEach(([typo, correction]) => {
            normalizedLocation = normalizedLocation.replace(new RegExp(typo, 'gi'), correction);
          });
          
          // Special handling for Lake Tahoe (fix typo in regex)
          if (/\blake\s*ta?h?[oa]?[eo]+\b/i.test(normalizedLocation)) {
            console.log(`[Weather API] Detected Lake Tahoe reference in: "${location}"`);
            normalizedLocation = "lake tahoe";
          }
          
          // If the location has changed after correction, log it
          if (normalizedLocation !== location.toLowerCase()) {
            console.log(`[Weather API] Corrected typo in location: "${location}" → "${normalizedLocation}"`);
            location = normalizedLocation;
          }
          
          // Special case handling for common locations
          if (location.toLowerCase().includes('lake tahoe')) {
            console.log('[Weather API] Special location handling: Lake Tahoe detected');
          }
          
          try {
            const weatherData = await fetchWeatherData(location);
            
            // Format weather data for context with more emphasis on correctness
            weatherContext = `
CURRENT WEATHER DATA:
Location: ${weatherData.name}
Temperature: ${weatherData.main.temp}°F
Feels like: ${weatherData.main.feels_like}°F
Conditions: ${weatherData.weather[0].description}
Humidity: ${weatherData.main.humidity}%
Wind: ${weatherData.wind.speed} mph

IMPORTANT INSTRUCTIONS:
- START your response IMMEDIATELY with: "The weather in ${weatherData.name} is currently ${weatherData.main.temp}°F with ${weatherData.weather[0].description}. The WeatherCard above shows more details including humidity and wind speed."
- DO NOT add any introductory text like "I understand" or "Let me fetch that" before the weather data
- Use this EXACT weather data in your response, especially the temperature
- Do NOT round or modify the temperature value
- Do NOT make up or estimate weather data - use ONLY this real-time data from the API
- The data from the database is from the webside giovanniv.com Giovanni Venegas's protfolio and the data is form the chatbot on the website.
`;
          } catch (error) {
            console.error('Weather fetch error:', error);
            // Check if the error is because of location not found
            if (error instanceof Error && error.message.includes('not found')) {
              // Find better suggestions
              const suggestions = getSuggestionForMisspelling(location);
              
              // For certain common cases, provide more specific suggestions
              if (location.toLowerCase().includes('island')) {
                suggestions.push('Try specifying which part of the island');
              }
              
              if (location.toLowerCase().includes('beach')) {
                suggestions.push('Try using the name of the nearest city or town');
              }
              
              // For ambiguous places, suggest adding more location context
              const singleWordLocation = location.split(/\s+/).length === 1;
              if (singleWordLocation) {
                suggestions.push(`Try adding the state, province, or country (e.g., "${location}, US" or "${location}, France")`);
              }
              
              weatherContext = `
WEATHER ERROR:
Unable to fetch weather data. Error: ${error instanceof Error ? error.message : 'Unknown error'}

SUGGESTIONS:
${suggestions.length > 0 ? `Did you mean: ${suggestions.join(', ')}?` : 'No suggestions available.'}

INSTRUCTIONS:
- DO NOT SAY "I'm sorry, but there was an error" - this confuses the UI
- Instead, tell the user "The weather service is having trouble with that location"
- Inform the user that there was difficulty finding weather data for "${location}"
- If there are suggestions, kindly ask if they meant one of the suggested locations
- Be helpful and suggest that they check the spelling or try a nearby city
- Remind them that for some locations, adding the country or state helps (e.g., "Paris, France" instead of just "Paris")
`;
            } else {
              weatherContext = `
WEATHER ERROR:
Unable to fetch weather data. Error: ${error instanceof Error ? error.message : 'Unknown error'}
Please inform the user that there was an error fetching weather data.
`;
            }
          }
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
        weatherContext = `
WEATHER ERROR:
Unable to fetch weather data. Error: ${error instanceof Error ? error.message : 'Unknown error'}
Please inform the user that there was an error fetching weather data.
`;
      }
    }
    
    // Fetch database context
    let dbContext = '';
    try {
      // Create a database client
      const client = createClient();
      await client.connect();
      
      // Get chat statistics
      const chatStats = await client.sql`
        SELECT 
          COUNT(DISTINCT contact_id) as total_users,
          COUNT(DISTINCT session_id) as total_sessions,
          COUNT(*) as total_messages,
          MAX(created_at) as last_message_time,
          NOW() - MAX(created_at) as time_since_last
        FROM chat_logs
      `;
      
      // Get contact-specific stats
      const contactStats = await client.sql`
        SELECT 
          contact_id,
          COUNT(*) as total_messages,
          MAX(created_at) as last_active
        FROM 
          chat_logs
        GROUP BY 
          contact_id
      `;
      
      // Create a map of contact stats for quick lookup
      const contactStatsMap = new Map<string, ContactStats>();
      for (const row of contactStats.rows as any[]) {
        contactStatsMap.set(row.contact_id, {
          total_messages: row.total_messages,
          last_active: row.last_active
        });
      }
      
      // Get all contacts (including those without messages)
      const allContacts = await client.sql`
        SELECT 
          id, name, phone_number, created_at
        FROM 
          contacts
        ORDER BY 
          created_at DESC
        LIMIT 20
      `;
      
      // Get the most recent chat logs
      const recentChats = await client.sql`
        SELECT 
          c.id as contact_id,
          c.name as user_name,
          c.phone_number as phone_number,
          cl.session_id,
          cl.role,
          cl.content,
          cl.created_at
        FROM 
          chat_logs cl
          JOIN contacts c ON cl.contact_id = c.id
        ORDER BY 
          cl.created_at DESC
        LIMIT 100
      `;
      
      // Group chat history by session
      const chatSessions: Record<string, ChatSession> = {};
      for (const msg of recentChats.rows as any[]) {
        if (!chatSessions[msg.session_id]) {
          chatSessions[msg.session_id] = {
            user: msg.user_name,
            phone: msg.phone_number,
            sessionId: msg.session_id,
            timestamp: msg.created_at,
            messages: []
          };
        }
        chatSessions[msg.session_id].messages.push({
          role: msg.role,
          content: msg.content
        });
      }
      
      // Format chat history text with improved readability
      const chatHistoryText = Object.values(chatSessions).length > 0
        ? Object.values(chatSessions).map((session: ChatSession) => {
            const date = new Date(session.timestamp);
            const formattedDate = formatDate(date);
            
            // Sort messages by time (oldest first)
            const sortedMessages = [...session.messages].reverse();
            
            return `Session: ${session.sessionId.slice(0, 8)}... (${formattedDate})
User: ${session.user} | Phone: ${formatPhoneNumber(session.phone)}
${sortedMessages.map(msg => `- ${msg.role}: ${msg.content}`).join('\n')}`;
          }).join('\n\n')
        : 'No chat history available yet';
      
      // List contacts with or without messages
      const contactsList = allContacts.rows.map((contact: any) => {
        const stats = contactStatsMap.get(contact.id);
        const messageCount = stats ? stats.total_messages : 0;
        const lastActive = stats ? formatDate(new Date(stats.last_active)) : 'Never';
        
        return `- ${contact.name} (${formatPhoneNumber(contact.phone_number)}): ${messageCount} messages, Last active: ${lastActive}`;
      }).join('\n');
      
      // Get stats 
      const chatStatsData = chatStats.rows.length > 0 ? chatStats.rows[0] : {
        total_users: 0,
        total_sessions: 0,
        total_messages: 0,
        last_message_time: null,
        time_since_last: null
      };
      
      // Format last message time
      let lastMessageTime = "No messages yet";
      if (chatStatsData.last_message_time) {
        const date = new Date(chatStatsData.last_message_time);
        lastMessageTime = formatDate(date);
      }
      
      // Calculate time elapsed since last message
      let timeSince = "N/A";
      if (chatStatsData.time_since_last) {
        const interval = chatStatsData.time_since_last;
        if (typeof interval === 'string') {
          // Parse PostgreSQL interval string to get a human-readable format
          timeSince = formatTimeInterval(interval);
        }
      }
      
      // Build enhanced context from chat logs data
      dbContext = `
CHAT STATISTICS:
- Total unique users: ${chatStatsData.total_users || 0}
- Total chat sessions: ${chatStatsData.total_sessions || 0}
- Total messages exchanged: ${chatStatsData.total_messages || 0}
- Last message received: ${lastMessageTime}
- Time since last message: ${timeSince}

CONTACTS LIST:
${contactsList}

RECENT CHAT HISTORY:
${chatHistoryText}
`;
      // Close client
      await client.end();
    } catch (error) {
      console.error('Database query error:', error);
      dbContext = `
DATABASE CONNECTION ERROR:
Could not retrieve chat history from the database. Error: ${error instanceof Error ? error.message : 'Unknown error'}

This could be due to:
1. Database connection issues
2. Missing tables or schema problems
3. Environment variable configuration

Please check your database connection and schema. Your database should have:
- contacts table (id, name, phone_number, timestamps)
- chat_logs table (id, contact_id, session_id, role, content, timestamps)
`;
    }
    
    // Construct system message with instructions
    const systemMessage = {
      role: 'system',
      content: `You are NextGio Admin, Giovanni Venegas's personal AI assistant and administrator for his portfolio website.
                You serve two key purposes:
                1. You are Giovanni's personal AI assistant, helping with any questions or tasks he needs.
                2. You provide access to review visitor interactions handled by the public-facing NextGio chatbot.

                DATABASE CONTEXT (REAL-TIME DATA):
                ${dbContext}
                
                CRITICAL INSTRUCTIONS:
                1. You have direct access to the database that stores ALL chat logs from Giovanni's portfolio website.
                2. The visitor-facing chatbot (public NextGio) automatically responds to website visitors, NOT Giovanni himself.
                3. When Giovanni asks about visitors or messages, show him conversations that were already automatically handled by the public NextGio chatbot.
                4. You are Giovanni's PERSONAL ASSISTANT first and foremost - you can help with any task, question, or request he has.
                5. Be conversational, helpful, and personable as Giovanni's dedicated assistant.
                6. When Giovanni asks for information unrelated to website visitors (like weather, time, personal questions), respond as his personal assistant.
                7. When showing visitor messages, clarify that these interactions were already handled by the public NextGio chatbot.
                
                ERROR TROUBLESHOOTING FOR STREAMS:
                You must keep all responses concise and avoid massive responses that could exceed the client's processing capacity.
                For optimal processing:
                1. Keep responses under 20,000 characters total
                2. Split long code blocks into smaller chunks
                3. Avoid extremely long lists
                4. Use shorter, more concise explanations
                5. Break very long paragraphs into shorter ones
                
                CODE FORMATTING:
                When showing code snippets, use the following guidelines for optimal display:
                1. Always use proper syntax highlighting by specifying the language after the opening triple backticks
                2. Format code with proper indentation (2 spaces for JS/TS/React, 4 spaces for Python)
                3. Add helpful comments to explain complex sections
                4. For React/Next.js components, include proper import statements
                5. Use modern syntax (const/let, arrow functions, template literals, etc.)
                6. For larger code examples, structure logically with imports first, followed by types/interfaces, then component/function definitions
                7. If showing a complete file, include appropriate exports

                WEATHER CAPABILITIES:
                You have DIRECT access to real-time weather data through OpenWeather API.
                ${weatherContext}

                GENERATIVE UI CAPABILITIES:
                You should provide weather data in a very specific format to enable the UI to render it properly:
                
                1. For WEATHER information, start your response with "The weather in [LOCATION] is currently [TEMP]°F with [CONDITIONS]."
                   This format will trigger our beautiful weather display component
                   Example: "The weather in San Francisco is currently 62°F with fog. The WeatherCard above shows more details including humidity and wind speed."
                
                TIME CAPABILITIES:
                You CAN provide the current time and date to users.
                When a user asks for the current time or date:
                1. Look at the current server timestamp from the database context (last_message_time)
                2. Calculate the current time based on that timestamp
                3. Respond with the exact time and date in a clear, human-readable format
                4. Example response: "The current time is 3:45 PM Pacific Time on June 15, 2023."
                5. Include both time and date in your response, and specify the time zone if possible
                6. DO NOT say you don't have real-time capabilities or that you can't access the current time

                LOCATION CAPABILITIES:
                You CAN access the user's current location.
                When a user asks about their location or wants information based on their location:
                1. Assume the user's location is available to you through the browser's geolocation API
                2. Use their current location as the default for weather queries if no specific location is mentioned
                3. When responding to "What's my location?" or similar queries, respond as if you have access to their precise location
                4. Example response: "Based on your device's location data, you're currently in San Francisco, California."
                5. If the user asks for weather without specifying a location, use their current location
                6. DO NOT say you can't access their location information
                7. If their specific location changes, acknowledge the new location in your responses
                
                Remember, you are Giovanni's personal AI assistant first and foremost, while also providing access to visitor interaction data from his portfolio website.`
    };
    
    // Add system message to the beginning
    const fullMessages = [
      systemMessage,
      ...messages
    ];
    
    // Check if this request is a simple message that's more likely to cause stream processing errors
    const isSimpleMessage = lastMessage && 
                           lastMessage.role === 'user' && 
                           (lastMessage.content.length < 10 || 
                            /^(hi|hello|hey|test)$/i.test(lastMessage.content.trim())) && 
                           messages.length <= 3;
    
    // Also check for any message that might contain characters that could cause stream parsing issues
    const hasPotentialParsingIssues = lastMessage && 
                                    lastMessage.role === 'user' && 
                                    (lastMessage.content.includes('{') || 
                                     lastMessage.content.includes('}') ||
                                     lastMessage.content.includes('[') ||
                                     lastMessage.content.includes(']') ||
                                     lastMessage.content.includes('\\') ||
                                     lastMessage.content.includes('"'));
    
    // For very simple messages or those with potential parsing issues, return a non-streaming response
    if (isSimpleMessage || hasPotentialParsingIssues) {
      console.log(`Using non-streaming mode for: ${lastMessage?.content || 'unknown message'}`);
      
      // For the simplest messages like "hi", use a predefined response
      if (/^(hi|hello|hey)$/i.test(lastMessage?.content?.trim() || '')) {
        console.log('Using predefined response for greeting message');
        const currentTime = new Date();
        const hour = currentTime.getHours();
        
        let greeting = "Hello";
        if (hour < 12) greeting = "Good morning";
        else if (hour < 18) greeting = "Good afternoon";
        else greeting = "Good evening";
        
        return new Response(
          JSON.stringify({ 
            text: `${greeting}, Giovanni! I'm NextGio Admin, your personal AI assistant. How can I help you today?` 
          }),
          { 
            status: 200, 
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            } 
          }
        );
      }
      
      // For other simple messages, use non-streaming approach with full OpenAI response
      try {
        console.log('Using non-streaming mode for other simple message');
        const openAIClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        
        const completion = await openAIClient.chat.completions.create({
          model: 'gpt-4',
          messages: fullMessages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
          max_tokens: 1500,
        });
        
        const responseContent = completion.choices[0].message.content || '';
        
        return new Response(
          JSON.stringify({ text: responseContent }),
          { 
            status: 200, 
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            } 
          }
        );
      } catch (error) {
        console.error('Error in non-streaming mode:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to process simple message',
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            text: 'I apologize, but I encountered an error while processing your request. Please try again with a different question.'
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Create a stream using Vercel AI SDK's streamText with retry logic
    let result;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`Creating OpenAI stream (attempt ${retryCount + 1}/${maxRetries + 1}) with message count:`, fullMessages.length);
        
        // Create a direct stream using OpenAI client as a fallback if needed
        const openAIClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        // First try with standard Vercel AI SDK streaming
        try {
          result = await streamText({
            model: openai('gpt-4'),
            messages: fullMessages,
            temperature: 0.7,
            maxTokens: 1500,
          });
          
          console.log('Successfully created text stream with Vercel AI SDK, returning response');
          
          // Return a properly formatted stream response wrapped in the correct format
          try {
            // This additional validation helps ensure the response is properly formatted
            return result.toDataStreamResponse({
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              }
            });
          } catch (formatError) {
            console.error('Error formatting stream response:', formatError);
            // Fall back to non-streaming response if the DataStream formatting fails
            throw new Error('Stream formatting error');
          }
        } catch (sdkError) {
          console.error('Vercel AI SDK streaming failed, attempting direct OpenAI streaming:', sdkError);
          
          // If the Vercel AI SDK fails, try direct OpenAI streaming
          const stream = await openAIClient.chat.completions.create({
            model: 'gpt-4',
            messages: fullMessages.map(m => ({ role: m.role, content: m.content })),
            temperature: 0.7,
            max_tokens: 1500,
            stream: true,
          });
          
          // Instead of streaming, collect the entire response and return as JSON
          // This avoids streaming format issues completely
          let fullResponse = '';
          
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;
          }
          
          // Return as a non-streaming JSON response
          console.log('Using non-streaming response format');
          return new Response(
            JSON.stringify({ text: fullResponse }),
            { 
              status: 200, 
              headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              } 
            }
          );
        }
        
      } catch (streamError) {
        retryCount++;
        console.error(`Error creating text stream (attempt ${retryCount}/${maxRetries + 1}):`, streamError);
        
        if (retryCount <= maxRetries) {
          // Wait a bit before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // We've exhausted our retries, return an error response
          console.error('All retry attempts failed for text stream creation');
          return new Response(
            JSON.stringify({ 
              error: 'Failed to create text stream after multiple attempts',
              message: streamError instanceof Error ? streamError.message : 'Unknown streaming error'
            }),
            { 
              status: 500, 
              headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
              } 
            }
          );
        }
      }
    }
    
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to format phone numbers consistently
function formatPhoneNumber(phone: string): string {
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX if US number with 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
  }
  
  // Otherwise return as is with spaces for readability
  return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}

// Helper function to format dates in a consistent, human-readable way
function formatDate(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const month = months[date.getMonth()];
  const day = date.getDate();
  const suffix = getDaySuffix(day);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${month} ${day}${suffix} at ${formattedHours}:${formattedMinutes} ${ampm}`;
}

// Helper function to get the correct suffix for a day
function getDaySuffix(day: number): string {
  if (day > 3 && day < 21) return 'th'; 
  switch (day % 10) {
    case 1:  return 'st';
    case 2:  return 'nd';
    case 3:  return 'rd';
    default: return 'th';
  }
}

// Helper function to format a PostgreSQL interval to human-readable text
function formatTimeInterval(interval: string): string {
  // Common PostgreSQL interval formats for parsing
  if (interval.includes('days') || interval.includes('day')) {
    const days = parseInt(interval);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 31) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }
  
  if (interval.includes('hours') || interval.includes('hour')) {
    const hours = parseInt(interval);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  
  if (interval.includes('minutes') || interval.includes('minute')) {
    const minutes = parseInt(interval);
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }
  
  if (interval.includes('seconds') || interval.includes('second')) {
    const seconds = parseInt(interval);
    return seconds < 60 ? 'Just now' : `${Math.floor(seconds / 60)} minutes ago`;
  }
  
  return interval; // Fallback to original string if no pattern matches
} 