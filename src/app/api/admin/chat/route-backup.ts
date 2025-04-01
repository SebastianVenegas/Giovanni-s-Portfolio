import { NextRequest } from 'next/server';
import { createClient } from '@vercel/postgres';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ContactStats, ChatSession } from './types';
import OpenAI from 'openai';
import { createAdminChatTables } from './create-tables';

export const runtime = 'edge';
export const preferredRegion = 'auto';

// Initialize database tables
(async () => {
  try {
    console.log('Initializing admin chat database tables...');
    const result = await createAdminChatTables();
    console.log('Database initialization result:', result);
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
})();

// Helper function to save a chat message - optimized to be async without awaiting
function saveAdminChatMessageAsync(sessionId: string, role: string, content: string, updateTitle: boolean = false) {
  console.log(`[Admin Chat] Saving message: sessionId=${sessionId}, role=${role}, content length=${content.length}`);
  
  // Save the message asynchronously without awaiting
  (async () => {
    try {
      // Create a database client
      const client = createClient();
      await client.connect();
      
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
      
      await client.end();
      console.log(`[Admin Chat] Message saved successfully: role=${role}`);
    } catch (error) {
      console.error('[Admin Chat] Error saving message:', error);
    }
  })();
}

// Function to get minimal essential context for fast responses
async function getMinimalContext() {
  try {
    // Create a database client
    const client = createClient();
    await client.connect();
    
    // Get only essential statistics
    const chatStats = await client.sql`
      SELECT 
        COUNT(DISTINCT contact_id) as total_users,
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(*) as total_messages
      FROM chat_logs
      LIMIT 1
    `;
    
    await client.end();
    
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
  } catch (error) {
    console.error('Database query error:', error);
    return 'DATABASE CONNECTION ERROR: Could not retrieve chat statistics.';
  }
}

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
    const { messages, sessionId } = await req.json();
    
    // Validate request body
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request format. Expected messages array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate a session ID if not provided
    const chatSessionId = sessionId || `admin-session-${Date.now()}`;
    
    // Save the user's message to the database and update title if it's a new conversation
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
      // Check if this might be the first message in a new session to decide if we update the title
      const isNewSession = !sessionId || sessionId === chatSessionId;
      saveAdminChatMessageAsync(chatSessionId, lastMessage.role, lastMessage.content, isNewSession);
    }
    
    // Get minimal context - faster than loading full user data
    const minimalContext = await getMinimalContext();
    
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
                6. When Giovanni asks for information unrelated to website visitors (like weather, time, personal questions), respond as his personal assistant.
                7. When showing visitor messages, clarify that these interactions were already handled by the public NextGio chatbot.
                8. Respond quickly and concisely, keeping your responses brief and to the point.
                
                Remember, you are Giovanni's personal AI assistant first and foremost, while also providing access to visitor interaction data from his portfolio website.`
    };
    
    // Add system message to the beginning
    const fullMessages = [
      systemMessage,
      ...messages
    ];
    
    // Create a streaming response for immediate feedback
    const result = await streamText({
      model: openai('gpt-4'),
      messages: fullMessages,
      temperature: 0.7,
      maxTokens: 1500,
    });
    
    // Save the full response when it completes
    let fullResponse = '';
    
    // Create a streaming response
    const streamResponse = result.toDataStreamResponse();
    
    // Create a transformed stream to capture the full response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    
    // Process the stream to capture the full response
    (async () => {
      const reader = streamResponse.body?.getReader();
      if (!reader) return;
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Pass through the chunk
          await writer.write(value);
          
          // Add to full response
          const chunk = new TextDecoder().decode(value);
          fullResponse += chunk;
        }
      } catch (e) {
        console.error('Error processing stream:', e);
      } finally {
        // Close the writer
        writer.close();
        
        // Save the full response at the end
        if (fullResponse) {
          console.log(`[Admin Chat] Got final content, saving assistant response`);
          saveAdminChatMessageAsync(chatSessionId, 'assistant', fullResponse);
        }
      }
    })();
    
    // Use a Response object with the x-session-id header
    const enhancedResponse = new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Session-ID': chatSessionId
      }
    });
    
    return enhancedResponse;
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

export async function GET(req: NextRequest) {
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
    
    // Extract sessionId from query parameters
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing sessionId parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a database client
    const client = createClient();
    await client.connect();
    
    // Check if the session exists
    const sessionCheck = await client.sql`
      SELECT session_id, title FROM admin_chat_sessions WHERE session_id = ${sessionId}
    `;
    
    if (sessionCheck.rowCount === 0) {
      await client.end();
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get messages for this session
    const messages = await client.sql`
      SELECT id, session_id, role, content, created_at
      FROM admin_chat_messages
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC
    `;
    
    await client.end();
    
    // Format the response
    const formattedMessages = messages.rows.map((msg: any) => ({
      id: msg.id.toString(),
      role: msg.role,
      content: msg.content,
      created_at: msg.created_at
    }));
    
    return new Response(
      JSON.stringify({ 
        sessionId,
        title: sessionCheck.rows[0].title,
        messages: formattedMessages
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error getting chat history:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to retrieve chat history',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 