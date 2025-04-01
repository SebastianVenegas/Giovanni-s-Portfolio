import { NextRequest, NextResponse } from 'next/server';
// Restore the database import for non-Edge runtime
import { createClient } from '@vercel/postgres'; 
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ContactStats, ChatSession } from './types';
import OpenAI from 'openai';
// Restore table creation import
import { createAdminChatTables } from './create-tables';
import { setCorsHeaders, createApiError, createApiResponse, validateApiKey, handleOptionsRequest } from '@/lib/api';

// Change from Edge runtime to Node.js
// export const runtime = 'edge';
// export const preferredRegion = 'auto';

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
console.log('[Admin Chat] Initializing database tables...');
createAdminChatTables().then(result => {
  console.log(`[Admin Chat] Table initialization result: ${result}`);
}).catch(err => {
  console.error('[Admin Chat] Database initialization error:', err);
});

// Helper function to save a chat message
async function saveAdminChatMessageAsync(sessionId: string, role: string, content: string, updateTitle: boolean = false) {
  console.log(`[Admin Chat] Message saving skipped (read-only access): sessionId=${sessionId}, role=${role}, content length=${content.length}`);
  // Skip database operations - read-only access to existing data
}

// Function to get minimal essential context for fast responses
async function getMinimalContext() {
  console.log('[Admin Chat] Starting getMinimalContext');
  try {
    const db = createClient();
    console.log('[Admin Chat] Database client created, connecting...');
    await db.connect();
    console.log('[Admin Chat] Database connected successfully');
    
    // Get basic stats for all chats and contacts
    console.log('[Admin Chat] Querying for chat and contact statistics...');
    const stats = await db.sql<ContactStats>`
      SELECT
        COUNT(DISTINCT session_id) AS total_sessions,
        COUNT(*) AS total_messages
      FROM chat_logs
    `;
    
    const contactStats = await db.sql`
      SELECT COUNT(*) AS total_contacts
      FROM contacts
    `;
    
    console.log(`[Admin Chat] Stats query result: sessions=${stats.rows[0]?.total_sessions || 0}, messages=${stats.rows[0]?.total_messages || 0}, contacts=${contactStats.rows[0]?.total_contacts || 0}`);
    
    // Get recent contacts
    const recentContacts = await db.sql`
      SELECT id, name, phone_number, created_at
      FROM contacts
      ORDER BY created_at DESC
      LIMIT 5
    `;
    console.log(`[Admin Chat] Recent contacts query returned ${recentContacts.rows.length} rows`);
    
    // Get most recent sessions with more details
    console.log('[Admin Chat] Querying for recent sessions...');
    const recentSessions = await db.sql<ChatSession>`
      SELECT 
        cl.session_id as id, 
        c.name as title, 
        c.phone_number as phone,
        MIN(cl.created_at) as created_at,
        (SELECT content FROM chat_logs 
         WHERE session_id = cl.session_id AND role = 'user' 
         ORDER BY created_at ASC LIMIT 1) as first_message
      FROM chat_logs cl
      JOIN contacts c ON cl.contact_id = c.id
      GROUP BY cl.session_id, c.name, c.phone_number
      ORDER BY MIN(cl.created_at) DESC
      LIMIT 5
    `;
    console.log(`[Admin Chat] Recent sessions query returned ${recentSessions.rows.length} rows`);
    
    await db.end();
    console.log('[Admin Chat] Database connection closed');
    
    const hasChats = stats.rows[0]?.total_sessions > 0;
    const hasContacts = (contactStats.rows[0]?.total_contacts || 0) > 0;
    console.log(`[Admin Chat] Has chats: ${hasChats}, Has contacts: ${hasContacts}`);
    
    const contextString = `
CHAT STATISTICS:
- Total contacts: ${contactStats.rows[0]?.total_contacts || 0}
- Total chat sessions: ${stats.rows[0]?.total_sessions || 0}
- Total messages exchanged: ${stats.rows[0]?.total_messages || 0}
- Has recent chats: ${hasChats ? 'YES' : 'NO'}
- Has contacts: ${hasContacts ? 'YES' : 'NO'}

${hasContacts ? `RECENT CONTACTS:
${recentContacts.rows.map(c => `- ${new Date(c.created_at).toLocaleString()}: ${c.name} (${c.phone_number})`).join('\n')}` : 'NO CONTACTS FOUND.'}

${hasChats ? `RECENT CONVERSATIONS:
${recentSessions.rows.map(s => `- ${new Date(s.created_at).toLocaleString()}: ${s.title || 'Unknown User'} (${s.phone || 'No phone'})
  First message: "${s.first_message?.substring(0, 50) ?? ''}${(s.first_message?.length ?? 0) > 50 ? '...' : ''}"`)
.join('\n')}` : 'NO RECENT CONVERSATIONS FOUND.'}
`;
    console.log('[Admin Chat] Returning context:', contextString);
    return contextString;
  } catch (error) {
    console.error('[Admin Chat] Error getting context:', error);
    // Return a more informative error message
    return `Error retrieving context data: ${error instanceof Error ? error.message : 'Unknown error'}
Debug: There might be a problem with the database connection. Please check that the tables exist and the Postgres connection is working.`;
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
      const isNewSession = !sessionId;
      await saveAdminChatMessageAsync(chatSessionId, 'user', lastMessage.content, isNewSession);
    }
    
    // Get minimal context - faster than loading full user data
    console.log('[Admin Chat] Getting minimal context');
    let minimalContext;
    try {
      minimalContext = await getMinimalContext();
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
                1. You have direct access to the database that stores ALL chat logs and contacts from Giovanni's portfolio website.
                2. The visitor-facing chatbot (public NextGio) automatically responds to website visitors, NOT Giovanni himself.
                3. When Giovanni asks about visitors or messages, show him conversations that were already automatically handled by the public NextGio chatbot.
                4. You are Giovanni's PERSONAL ASSISTANT first and foremost - you can help with any task, question, or request he has.
                5. Be conversational, helpful, and personable as Giovanni's dedicated assistant.
                6. IMPORTANT: You DO have real-time weather data access. When asked about weather, respond with accurate weather information that will be displayed in a weather card component. DO NOT claim you don't have access to weather data.
                7. When showing visitor messages, clarify that these interactions were already handled by the public NextGio chatbot.
                8. Respond quickly and concisely, keeping your responses brief and to the point.
                9. IMPORTANT: When asked about new chats or conversations:
                   - DO NOT say you are "checking" or "looking"
                   - LOOK DIRECTLY at the DATABASE CONTEXT section above
                   - If it shows "Has recent chats: YES", then report the chats listed under RECENT CONVERSATIONS
                   - If it shows "Has recent chats: NO", say "There are no chat sessions available."
                   - If it shows an error message, say "I'm having trouble connecting to the chat database. [Insert error details]"
                10. NEVER say "There are no recent chats" unless the context SPECIFICALLY says "Has recent chats: NO" or shows 0 total sessions.
                11. When asked about contacts:
                   - Look at the "Has contacts" value in the DATABASE CONTEXT
                   - If it shows "Has contacts: YES", then list the contacts from RECENT CONTACTS
                   - If it shows "Has contacts: NO", say "There are no contacts in the database."
                12. You can ONLY read data from the database, NEVER attempt to add or modify contacts or chat logs.
                
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
          console.log(`[Admin Chat] AI response completed, length: ${fullContent.length}`);
          saveAdminChatMessageAsync(chatSessionId, 'assistant', fullContent);
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
    
    console.log(`[Admin Chat] Session history requested: ${sessionId}`);
    
    // Retrieve chat history from database
    const db = createClient();
    await db.connect();
    
    // Get contact info for this session
    const contactResult = await db.sql`
      SELECT c.id, c.name
      FROM contacts c
      JOIN chat_logs cl ON c.id = cl.contact_id
      WHERE cl.session_id = ${sessionId}
      LIMIT 1
    `;
    
    const contact = contactResult.rows[0];
    
    // Get messages
    const messagesResult = await db.sql`
      SELECT role, content, created_at
      FROM chat_logs
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC
    `;
    
    await db.end();
    
    // Return chat history
    return createApiResponse({ 
      sessionId,
      title: contact?.name || "Unknown User",
      messages: messagesResult.rows.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
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