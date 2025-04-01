import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@vercel/postgres';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ContactStats, ChatSession } from './types';
import OpenAI from 'openai';
import { createAdminChatTables } from './create-tables';
import { setCorsHeaders, createApiError, createApiResponse, validateApiKey, handleOptionsRequest } from '@/lib/api';

export const runtime = 'edge';
export const preferredRegion = 'auto';

// Initialize OpenAI with the API key
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

// Log OpenAI API key status (safely)
if (!process.env.OPENAI_API_KEY) {
  console.error('[Admin Chat] OPENAI_API_KEY is not set in environment variables');
} else {
  const masked = process.env.OPENAI_API_KEY.substring(0, 4) + '...' + 
                 process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4);
  console.log(`[Admin Chat] OPENAI_API_KEY is configured (${masked})`);
}

// Initialize tables on startup
(async () => {
  // Skip database initialization
  console.log('[Admin Chat] Database initialization skipped - storage disabled');
})();

// Helper function to save a chat message - optimized to be async without awaiting
function saveAdminChatMessageAsync(sessionId: string, role: string, content: string, updateTitle: boolean = false) {
  console.log(`[Admin Chat] Saving message: sessionId=${sessionId}, role=${role}, content length=${content.length}`);
  
  // Save the message asynchronously without awaiting
  (async () => {
    let client;
    try {
      // Create a database client
      client = createClient();
      await client.connect();
      console.log('[Admin Chat] Database connected successfully');
      
      // Check if the session exists, if not create it
      const sessionCheck = await client.sql`
        SELECT session_id, title FROM admin_chat_sessions WHERE session_id = ${sessionId}
      `;
      
      let sessionTitle = 'New Conversation';
      
      if (sessionCheck.rowCount === 0) {
        console.log(`[Admin Chat] Creating new session: ${sessionId}`);
        
        // If this is a user message, create a title from it
        if (role === 'user' && updateTitle) {
          // Extract first 30 chars for the title
          sessionTitle = content.length > 30 
            ? content.substring(0, 30).trim() + '...' 
            : content.trim();
        }
        
        // Insert the new session
        await client.sql`
          INSERT INTO admin_chat_sessions (session_id, title, created_at, updated_at)
          VALUES (${sessionId}, ${sessionTitle}, NOW(), NOW())
        `;
      } else {
        // Update the session's updated_at timestamp
        await client.sql`
          UPDATE admin_chat_sessions 
          SET updated_at = NOW()
          WHERE session_id = ${sessionId}
        `;
      }
      
      // Insert the message
      await client.sql`
        INSERT INTO admin_chat_messages (session_id, role, content, created_at)
        VALUES (${sessionId}, ${role}, ${content}, NOW())
      `;
      
      console.log(`[Admin Chat] Message saved successfully: role=${role}`);
    } catch (error: any) {
      console.error(`[Admin Chat] Error saving message: ${error.message}`, error);
      // Don't throw - this is an async operation and we don't want to fail the main request
    } finally {
      if (client) {
        try {
          await client.end();
          console.log('[Admin Chat] Database connection closed');
        } catch (closeError: any) {
          console.error(`[Admin Chat] Error closing database connection: ${closeError.message}`);
        }
      }
    }
  })();
}

// Function to get minimal essential context for fast responses
async function getMinimalContext() {
  let client;
  try {
    // Create a database client
    client = createClient();
    await client.connect();
    console.log('[Admin Chat] Context DB connected successfully');
    
    // Get only essential statistics
    const chatStats = await client.sql`
      SELECT 
        COUNT(DISTINCT contact_id) as total_users,
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(*) as total_messages
      FROM chat_logs
      LIMIT 1
    `;
    
    const chatStatsData = chatStats.rows.length > 0 ? chatStats.rows[0] : {
      total_users: 0,
      total_sessions: 0,
      total_messages: 0
    };
    
    // Build minimal context
    return `
CHAT STATISTICS:
- Total unique users: ${chatStatsData.total_users || 0}
- Total chat sessions: ${chatStatsData.total_sessions || 0}
- Total messages exchanged: ${chatStatsData.total_messages || 0}
`;
  } catch (error: any) {
    console.error(`[Admin Chat] Database query error for context: ${error.message}`, error);
    return 'DATABASE CONNECTION ERROR: Could not retrieve chat statistics.';
  } finally {
    if (client) {
      try {
        await client.end();
        console.log('[Admin Chat] Context DB connection closed');
      } catch (closeError: any) {
        console.error(`[Admin Chat] Error closing context DB connection: ${closeError.message}`);
      }
    }
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return handleOptionsRequest();
}

/**
 * Handles POST requests to the chat endpoint
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[Admin Chat] Received chat request');
    
    // Validate the API key
    if (!validateApiKey(req)) {
      console.log('[Admin Chat] Invalid API key');
      return createApiError('Unauthorized - Invalid API key', 401);
    }
    
    // Parse request body
    const body = await req.json();
    const { messages, sessionId } = body;
    
    console.log(`[Admin Chat] Request body parsed, messages: ${messages?.length}, sessionId: ${sessionId || 'none'}`);
    
    // Validate request body
    if (!messages || !Array.isArray(messages)) {
      console.log('[Admin Chat] Invalid request format - messages missing or not an array');
      return createApiError('Invalid request format. Expected messages array', 400);
    }
    
    // Generate a session ID if not provided
    const chatSessionId = sessionId || `admin-session-${Date.now()}`;
    
    // Save the user's message to the database and update title if it's a new conversation
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
      // Skip database storage
      console.log(`[Admin Chat] User message received (storage disabled): ${lastMessage.content.substring(0, 30)}...`);
    }
    
    // Get minimal context - faster than loading full user data
    console.log('[Admin Chat] Getting minimal context');
    let minimalContext;
    try {
      // Skip database query and use static context
      minimalContext = `
CHAT STATISTICS (STATIC - DB STORAGE DISABLED):
- Total unique users: 0
- Total chat sessions: 0
- Total messages exchanged: 0
`;
    } catch (ctxError) {
      console.error('[Admin Chat] Error getting context:', ctxError);
      minimalContext = 'Error retrieving context data';
    }
    
    // Construct system message with instructions
    const systemMessage = {
      role: 'system',
      content: `You are NextGio Admin, Giovanni Venegas's personal AI assistant and administrator for his portfolio website.
                You serve two key purposes:
                1. You are Giovanni's personal AI assistant, helping with any questions or tasks he needs.
                2. You provide access to review visitor interactions handled by the public-facing NextGio chatbot.

                DATABASE CONTEXT (REAL-TIME DATA):
                ${minimalContext}
                
                CRITICAL INSTRUCTIONS:
                1. You have direct access to the database that stores ALL chat logs from Giovanni's portfolio website.
                2. The visitor-facing chatbot (public NextGio) automatically responds to website visitors, NOT Giovanni himself.
                3. When Giovanni asks about visitors or messages, show him conversations that were already automatically handled by the public NextGio chatbot.
                4. You are Giovanni's PERSONAL ASSISTANT first and foremost - you can help with any task, question, or request he has.
                5. Be conversational, helpful, and personable as Giovanni's dedicated assistant.
                6. IMPORTANT: You DO have real-time weather data access. When asked about weather, respond with accurate weather information that will be displayed in a weather card component. DO NOT claim you don't have access to weather data.
                7. When showing visitor messages, clarify that these interactions were already handled by the public NextGio chatbot.
                8. Respond quickly and concisely, keeping your responses brief and to the point.
                
                WHEN ASKED ABOUT WEATHER:
                - Respond as if you have real-time weather data
                - Mention the current weather conditions for the location
                - Include temperature and conditions (sunny, cloudy, rainy, etc.)
                - The weather information will be displayed automatically
                
                Remember, you are Giovanni's personal AI assistant first and foremost, while also providing access to visitor interaction data from his portfolio website.`
    };
    
    // Add system message to the beginning
    const fullMessages = [
      systemMessage,
      ...messages
    ];
    
    console.log('[Admin Chat] Calling OpenAI API with', fullMessages.length, 'messages');
    
    // Create a streaming response using OpenAI's streaming API directly
    let stream;
    try {
      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is not set');
      }
      
      console.log('[Admin Chat] Attempting to call OpenAI API...');
      stream = await openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo', // Fallback to a more reliable model
        messages: fullMessages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: 0.7,
        max_tokens: 1500,
        stream: true,
      });
      console.log('[Admin Chat] OpenAI stream created successfully');
    } catch (openaiError: any) {
      console.error('[Admin Chat] OpenAI API error:', openaiError);
      
      // If we're in development or testing, provide a fallback response
      if (process.env.NODE_ENV === 'development' || process.env.ENABLE_FALLBACK === 'true') {
        console.log('[Admin Chat] Using fallback response due to OpenAI API error');
        return createFallbackResponse(chatSessionId, lastMessage.content);
      }
      
      return createApiError(`OpenAI API error: ${openaiError.message || 'Unknown error'}`, 500);
    }

    // Create a TransformStream to collect the full response for saving
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    
    // Function to process the streaming response in proper SSE format
    const processStream = async () => {
      const encoder = new TextEncoder();
      let fullContent = '';
      let buffer = '';
      const chunkSizeThreshold = 40; // Increased threshold to send larger, more coherent chunks
      
      try {
        // Send initial heartbeat to keep the connection alive
        writer.write(encoder.encode(':\n\n'));
        
        // Check if the user is asking about weather
        const lastUserMessage = messages.find(m => m.role === 'user')?.content?.toLowerCase() || '';
        const isWeatherQuery = lastUserMessage.includes('weather');
        
        // If it's a weather query, try to get real weather data before responding
        if (isWeatherQuery) {
          console.log('[Admin Chat] Weather query detected, fetching real weather data');
          
          // Extract location from the user's message
          let location = 'Maui'; // Default to Maui
          
          // Try to extract a specific location from the query
          const locationPatterns = [
            /weather (?:in|at|for|of)?\s+([^?.,]+)/i,
            /(?:what|how)(?:'s| is) the weather (?:in|at|for|of)?\s+([^?.,]+)/i,
            /weather (?:conditions|forecast|like|report) (?:in|at|for|of)?\s+([^?.,]+)/i,
          ];
          
          for (const pattern of locationPatterns) {
            const match = lastUserMessage.match(pattern);
            if (match && match[1]) {
              location = match[1].trim();
              break;
            }
          }
          
          // Check for specific locations in query
          if (lastUserMessage.includes('maui') || lastUserMessage.includes('hawaii')) {
            location = 'Maui';
          } else if (lastUserMessage.includes('moreno valley')) {
            location = 'Moreno Valley';
          }
          
          console.log(`[Admin Chat] Extracted location: "${location}"`);
          
          try {
            // Fetch real weather data
            const weatherResponse = await fetch(`${req.nextUrl.origin}/api/weather?city=${encodeURIComponent(location)}`, {
              headers: {
                'User-Agent': 'Admin-Chat-Internal/1.0',
              },
            });
            
            if (weatherResponse.ok) {
              const weatherData = await weatherResponse.json();
              console.log('[Admin Chat] Received weather data:', weatherData);
              
              // Prepare a weather data message to inject into the response
              const weatherInfo = `I've checked the current weather in ${weatherData.location}. It's currently ${Math.round(weatherData.temperature)}°F with ${weatherData.description}.`;
              
              // Send this weather info as first part of the response
              const weatherChunk = `data: ${weatherInfo}\n\n`;
              writer.write(encoder.encode(weatherChunk));
              
              // Add to full content so it's saved
              fullContent += weatherInfo;
            } else {
              console.error(`[Admin Chat] Weather API error: ${weatherResponse.status}`);
            }
          } catch (weatherError) {
            console.error('[Admin Chat] Error fetching weather data:', weatherError);
          }
        }
        
        // Process the stream as chunks arrive
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            // Append to our full content storage
            fullContent += content;
            buffer += content;
            
            // Only send the chunk when we have collected a complete sentence or a significant amount of text
            const shouldSendChunk = 
              buffer.length > chunkSizeThreshold || 
              buffer.endsWith('. ') || 
              buffer.endsWith('! ') || 
              buffer.endsWith('? ') || 
              buffer.endsWith('\n');
            
            if (shouldSendChunk) {
              // Ensure proper spacing in the buffer before sending
              let formattedBuffer = buffer;
              
              // Fix any missing spaces between words (lowercase followed by uppercase)
              formattedBuffer = formattedBuffer.replace(/([a-z])([A-Z])/g, '$1 $2');
              
              // Send the accumulated buffer as a complete chunk
              const formattedChunk = `data: ${formattedBuffer}\n\n`;
              writer.write(encoder.encode(formattedChunk));
              buffer = ''; // Reset buffer after sending
            }
          }
        }
        
        // Send any remaining buffered content
        if (buffer.length > 0) {
          // Ensure proper spacing in the final buffer
          let formattedBuffer = buffer;
          
          // Fix any missing spaces between words (lowercase followed by uppercase)
          formattedBuffer = formattedBuffer.replace(/([a-z])([A-Z])/g, '$1 $2');
          
          const formattedChunk = `data: ${formattedBuffer}\n\n`;
          writer.write(encoder.encode(formattedChunk));
        }
        
        // Send the DONE message to end the stream
        writer.write(encoder.encode('data: [DONE]\n\n'));
        writer.close();
        
        // Save the full response
        if (fullContent) {
          console.log(`[Admin Chat] AI response completed (storage disabled), length: ${fullContent.length}`);
          // Skip database storage
          // saveAdminChatMessageAsync(chatSessionId, 'assistant', fullContent);
        }
      } catch (error: any) {
        console.error('[Admin Chat] Error processing stream:', error);
        
        // Try to send an error message to the client
        try {
          const errorMessage = `Error during streaming: ${error.message || 'Unknown error'}`;
          const errorChunk = `data: ${errorMessage}\n\n`;
          writer.write(encoder.encode(errorChunk));
          writer.write(encoder.encode('data: [DONE]\n\n'));
        } catch (e) {
          // If we can't even send an error, just abort
          console.error('[Admin Chat] Failed to send error to client:', e);
        }
        
        writer.close();
      }
    };
    
    // Start processing the stream without waiting for it to complete
    processStream();
    
    // Return a streaming response with headers
    console.log('[Admin Chat] Returning streaming response');
    const response = new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-SESSION-ID': chatSessionId
      }
    });
    
    // Add CORS headers
    return setCorsHeaders(response);
  } catch (error: any) {
    console.error('[Admin Chat] General error in chat endpoint:', error);
    // Return a more detailed error response
    return createApiError(`An error occurred: ${error.message || 'Unknown error'}`, 500);
  }
}

/**
 * Handles GET requests to retrieve chat history
 */
export async function GET(req: NextRequest) {
  try {
    // Validate the API key
    if (!validateApiKey(req)) {
      return createApiError('Unauthorized', 401);
    }
    
    // Extract sessionId from query parameters
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return createApiError('Missing sessionId parameter', 400);
    }
    
    // Skip database query and return empty history
    console.log(`[Admin Chat] Session history requested (storage disabled): ${sessionId}`);
    
    // Return empty message array
    return createApiResponse({ 
      sessionId,
      title: "New Conversation",
      messages: [] 
    });
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return createApiError('An error occurred while retrieving chat history', 500);
  }
}

// Function to create a fallback response when the OpenAI API fails
function createFallbackResponse(sessionId: string, userMessage: string) {
  // Create a fallback message
  const fallbackMessage = `I'm sorry, but I'm currently having trouble connecting to my knowledge base. This could be due to high demand or a temporary service interruption. Please try again in a few moments.

If you need immediate assistance, please contact Giovanni directly.`;
  
  // Save the fallback message to the database
  saveAdminChatMessageAsync(sessionId, 'assistant', fallbackMessage);
  
  // Create a JSON response (non-streaming)
  return createApiResponse({
    message: fallbackMessage,
    status: 'error',
    details: 'OpenAI API unavailable - fallback response provided'
  }, 200, {
    'X-SESSION-ID': sessionId
  });
} 