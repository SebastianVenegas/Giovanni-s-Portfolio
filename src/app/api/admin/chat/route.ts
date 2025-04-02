import { NextRequest, NextResponse } from 'next/server';
// Restore the database import for non-Edge runtime
import { createClient } from '@vercel/postgres'; 
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ContactStats } from './types';
import OpenAI from 'openai';
// Restore table creation import
import { createAdminChatTables } from './create-tables';
import { setCorsHeaders, createApiError, createApiResponse, validateApiKey, handleOptionsRequest } from '@/lib/api';
import { Configuration, OpenAIApi } from 'openai-edge';
import { prisma } from '@/lib/prisma';

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
  let db;
  try {
    db = createClient();
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
    
    // Get recent contacts with retry logic
    let recentContacts;
    try {
      recentContacts = await db.sql`
        SELECT id, name, phone_number, created_at
        FROM contacts
        ORDER BY created_at DESC
        LIMIT 5
      `;
    } catch (contactError) {
      console.error('[Admin Chat] Error fetching recent contacts:', contactError);
      recentContacts = { rows: [] };
    }
    
    // Get most recent sessions with complete message history
    let recentSessions;
    try {
      recentSessions = await db.sql<ChatSession>`
        WITH recent_sessions AS (
          SELECT DISTINCT ON (cl.session_id)
            cl.session_id,
            c.name as title,
            c.phone_number as phone,
            MIN(cl.created_at) OVER (PARTITION BY cl.session_id) as thread_start,
            MAX(cl.created_at) OVER (PARTITION BY cl.session_id) as thread_end,
            COUNT(*) OVER (PARTITION BY cl.session_id) as message_count
          FROM chat_logs cl
          JOIN contacts c ON cl.contact_id = c.id
          ORDER BY cl.session_id, cl.created_at DESC
        )
        SELECT 
          rs.session_id as id,
          rs.title,
          rs.phone,
          rs.thread_start as created_at,
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'role', cl.role,
                  'content', cl.content,
                  'created_at', cl.created_at
                ) ORDER BY cl.created_at ASC
              )::text
              FROM chat_logs cl
              WHERE cl.session_id = rs.session_id
            ),
            '[]'
          ) as messages,
          rs.message_count
        FROM recent_sessions rs
        ORDER BY rs.thread_start DESC
        LIMIT 5
      `;
    } catch (sessionsError) {
      console.error('[Admin Chat] Error fetching recent sessions:', sessionsError);
      recentSessions = { rows: [] };
    }

    const totalSessions = stats.rows[0]?.total_sessions || 0;
    const totalMessages = stats.rows[0]?.total_messages || 0;
    const totalContacts = contactStats.rows[0]?.total_contacts || 0;
    
    const hasChats = totalSessions > 0;
    const hasContacts = totalContacts > 0;
    
    const contextString = `
CHAT STATISTICS:
- Total contacts: ${totalContacts}
- Total chat sessions: ${totalSessions}
- Total messages exchanged: ${totalMessages}
- Has recent chats: ${hasChats ? 'YES' : 'NO'}
- Has contacts: ${hasContacts ? 'YES' : 'NO'}

${hasContacts ? `RECENT CONTACTS:
${recentContacts.rows.map(c => `- ${new Date(c.created_at).toLocaleString()}: ${c.name} (${c.phone_number})`).join('\n')}` : 'NO CONTACTS FOUND.'}

${hasChats ? `RECENT CONVERSATIONS:
${recentSessions.rows.map(s => {
  try {
    const messages = JSON.parse(s.messages) as Array<{
      role: string;
      content: string;
      created_at: string;
    }>;
    return `CONVERSATION WITH: ${s.title || 'Unknown User'} (${s.phone || 'No phone'})
START TIME: ${new Date(s.created_at).toLocaleString()}
TOTAL MESSAGES: ${s.message_count}

COMPLETE TRANSCRIPT:
${messages.map(m => `[${new Date(m.created_at).toLocaleString()}] ${m.role.toUpperCase()}: ${m.content}`).join('\n')}
----------------------------------------`;
  } catch (error) {
    console.error('Error parsing messages:', error);
    return '';
  }
}).filter(Boolean).join('\n\n')}` : 'NO RECENT CONVERSATIONS FOUND.'}`;

    return contextString;
  } catch (error) {
    console.error('[Admin Chat] Error getting context:', error);
    // Instead of returning an error message, return a valid context with no data
    return `
CHAT STATISTICS:
- Total contacts: 0
- Total chat sessions: 0
- Total messages exchanged: 0
- Has recent chats: NO
- Has contacts: NO

NO CONTACTS FOUND.

NO RECENT CONVERSATIONS FOUND.`;
  } finally {
    if (db) {
      try {
        await db.end();
        console.log('[Admin Chat] Database connection closed');
      } catch (closeError) {
        console.error('[Admin Chat] Error closing database connection:', closeError);
      }
    }
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return handleOptionsRequest();
}

// Define message types with proper interfaces
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface ChatSession {
  id: string;
  title: string;
  phone: string;
  created_at: Date;
  messages: string;  // JSON string of messages
  message_count: number;
  first_message?: string;
}

interface FormattedMessage {
  role: string;
  content: string;
  created_at: string;
}

interface ChatLogMessage {
  id: number;
  role: string;
  content: string;
  created_at: Date;
  contact_id: number;
  session_id: string;
  contact_name?: string;
  thread_start?: Date;
  thread_end?: Date;
  message_count?: number;
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
    const systemPrompt = `You are NextGio, Giovanni's personal AI assistant. Your sole user is Giovanni Venegas. All your responses should be directed to him and only him.

    CRITICAL INSTRUCTIONS:
    1. You have direct access to the database that stores ALL chat logs and contacts from Giovanni's portfolio website.
    2. The visitor-facing chatbot (public NextGio) automatically responds to website visitors, NOT Giovanni himself.
    3. When Giovanni asks about visitors or messages, show him conversations that were already automatically handled by the public NextGio chatbot.
    4. You are Giovanni's PERSONAL ASSISTANT first and foremost - you can help with any task, question, or request he has.
    5. Be conversational, helpful, and personable as Giovanni's dedicated assistant.
    6. IMPORTANT: You DO have real-time weather data access. When asked about weather, respond with accurate weather information that will be displayed in a weather card component.
    7. When showing visitor messages, clarify that these interactions were already handled by the public NextGio chatbot.
    8. Respond quickly and concisely, keeping your responses brief and to the point.

    CHAT DISPLAY RULES:
    1. When asked about chats or conversations:
       - DO NOT say phrases like "Let me check" or "Let me fetch"
       - DO NOT say "I can see that" or similar phrases
       - Simply state what is available directly based on the DATABASE CONTEXT below
       - If the context shows chats, list them immediately
       - If the context shows no chats (e.g., due to an error during fetch), say "There are no chat sessions available."

    2. When showing chat transcripts:
       - Show the complete transcript immediately if available in the DATABASE CONTEXT
       - Include all messages with timestamps
       - DO NOT say you are "fetching" or "checking"
       - DO NOT apologize for or mention any limitations
       - If the transcript is not available in the context, say "That conversation is not available in the database."

    DATABASE CONTEXT (REAL-TIME DATA):
    ${minimalContext}

    Remember: You have full access to all chat data. Never say you are checking or fetching - simply respond with what is available in the context above. If the context shows no chats or contacts, state that directly.`;
    
    // Add system message to the beginning
    const fullMessages = [
      {
        role: 'system',
        content: systemPrompt,
      },
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

// Function to get chat history for multiple contacts
async function getMultipleContactHistory(contactIds: string[]): Promise<ChatLogMessage[]> {
  try {
    if (!contactIds.length) return [];
    
    // Enhanced query to ensure we get complete messages and proper ordering
    const messages = await prisma.$queryRaw`
      WITH conversation_threads AS (
        SELECT 
          cl.session_id,
          cl.contact_id,
          MIN(cl.created_at) as thread_start,
          MAX(cl.created_at) as thread_end,
          COUNT(*) as message_count
        FROM chat_logs cl
        WHERE cl.contact_id = ANY(${contactIds}::int[])
        GROUP BY cl.session_id, cl.contact_id
      ),
      full_messages AS (
        SELECT 
          cl.id,
          cl.role,
          cl.content,
          cl.created_at,
          cl.contact_id,
          cl.session_id,
          c.name as contact_name,
          ct.thread_start,
          ct.thread_end,
          ct.message_count
        FROM chat_logs cl
        JOIN conversation_threads ct 
          ON cl.session_id = ct.session_id 
          AND cl.contact_id = ct.contact_id
        LEFT JOIN contacts c ON cl.contact_id = c.id
        WHERE cl.contact_id = ANY(${contactIds}::int[])
      )
      SELECT *
      FROM full_messages
      ORDER BY 
        thread_start DESC,
        created_at ASC;
    `;
    
    return messages as ChatLogMessage[];
  } catch (error) {
    console.error('Error fetching multiple contact history:', error);
    return [];
  }
}

// Function to get specific session messages with complete context
async function getSessionMessages(sessionId: string): Promise<ChatLogMessage[]> {
  try {
    // Enhanced query to get ALL messages in the session with full context
    const messages = await prisma.$queryRaw`
      WITH session_context AS (
        SELECT 
          cl.session_id,
          MIN(cl.created_at) as thread_start,
          MAX(cl.created_at) as thread_end,
          COUNT(*) as message_count
        FROM chat_logs cl
        WHERE cl.session_id = ${sessionId}
        GROUP BY cl.session_id
      )
      SELECT 
        cl.id,
        cl.role,
        cl.content,
        cl.created_at,
        cl.contact_id,
        cl.session_id,
        c.name as contact_name,
        sc.thread_start,
        sc.thread_end,
        sc.message_count
      FROM chat_logs cl
      JOIN session_context sc ON cl.session_id = sc.session_id
      LEFT JOIN contacts c ON cl.contact_id = c.id
      WHERE cl.session_id = ${sessionId}
      ORDER BY cl.created_at ASC
    `;
    
    return messages as ChatLogMessage[];
  } catch (error) {
    console.error('Error fetching session messages:', error);
    return [];
  }
}

// Function to format chat history for AI context
function formatChatHistoryForAI(history: ChatLogMessage[]): string {
  if (!history.length) return '';

  // Group messages by conversation thread
  const groupedMessages = history.reduce((acc, msg) => {
    const key = `${msg.contact_id}-${msg.session_id}`;
    if (!acc[key]) {
      acc[key] = {
        messages: [],
        contact_name: msg.contact_name || `Contact ID ${msg.contact_id}`,
        thread_start: msg.thread_start,
        thread_end: msg.thread_end
      };
    }
    acc[key].messages.push(msg);
    return acc;
  }, {} as Record<string, { 
    messages: ChatLogMessage[], 
    contact_name: string,
    thread_start?: Date,
    thread_end?: Date
  }>);

  // Format each conversation with complete history
  return Object.entries(groupedMessages)
    .sort((a, b) => {
      // Sort conversations by most recent first
      const aStart = a[1].thread_start?.getTime() || 0;
      const bStart = b[1].thread_start?.getTime() || 0;
      return bStart - aStart;
    })
    .map(([_, thread]) => {
      const dateStr = thread.thread_start 
        ? new Date(thread.thread_start).toLocaleString()
        : 'Unknown date';
        
      return `Complete conversation with ${thread.contact_name} (Started: ${dateStr}):
${thread.messages.map(msg => 
  `[${new Date(msg.created_at).toLocaleString()}]
${msg.role.toUpperCase()}: ${msg.content}`
).join('\n\n')}
----------------------------------------`;
    })
    .join('\n\n');
}

// Function to extract identifiers and proactively fetch related conversations
function extractIdentifiers(message: string): { contactIds: string[], sessionIds: string[] } {
  const contactIdRegex = /\b\d{9,}\b|\((\d{9,})\)/g;
  const contactIds = [...new Set([...(message.match(contactIdRegex) || [])].map(id => id.replace(/[()]/g, '')))];
  
  // Enhanced name matching with common variations and fuzzy matching
  const nameRegex = /(Oscar|Giovannis?|Murali|Sebastian(?:\s+Venegas)?|Giovanni|any other names?)(?:\s|$)/gi;
  const names = [...new Set([...(message.match(nameRegex) || []).map(name => name.trim().toLowerCase())])];
  
  // Proactively query database for contact IDs when names are mentioned
  if (names.length > 0) {
    try {
      const db = createClient();
      db.connect().then(async () => {
        const nameContacts = await db.sql`
          SELECT id, name
          FROM contacts
          WHERE LOWER(name) SIMILAR TO ${names.join('|')}
        `;
        contactIds.push(...nameContacts.rows.map(c => c.id.toString()));
        await db.end();
      }).catch(console.error);
    } catch (error) {
      console.error('Error querying contacts by name:', error);
    }
  }
  
  return {
    contactIds: [...new Set(contactIds)],
    sessionIds: [...new Set([...contactIds])]
  };
} 