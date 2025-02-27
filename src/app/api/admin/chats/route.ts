import { NextResponse } from 'next/server';
import { getChatHistory, getContacts } from '@/lib/db';

// Simple API key authentication
const validateApiKey = (request: Request) => {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = process.env.ADMIN_API_KEY;
  
  if (!apiKey || apiKey !== validApiKey) {
    return false;
  }
  
  return true;
};

export async function GET(request: Request) {
  try {
    // Validate API key for security
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get all contacts
    const contacts = await getContacts();
    
    // Get chat history for each contact
    const chats = [];
    
    for (const contact of contacts) {
      // Get all sessions for this contact
      const url = new URL(request.url);
      const sessionId = url.searchParams.get('sessionId');
      
      // If sessionId is provided, only get that specific session
      if (sessionId) {
        const chatHistory = await getChatHistory(contact.id, sessionId);
        if (chatHistory.length > 0) {
          chats.push({
            contact,
            sessions: [{
              sessionId,
              messages: chatHistory
            }]
          });
        }
      } else {
        // Get all chat messages for this contact
        const chatHistory = await getChatHistory(contact.id, null);
        
        // Group messages by session
        interface SessionMap {
          [key: string]: {
            sessionId: string;
            messages: any[];
          }
        }
        const sessions: SessionMap = {};
        for (const message of chatHistory) {
          if (!sessions[message.session_id]) {
            sessions[message.session_id] = {
              sessionId: message.session_id,
              messages: []
            };
          }
          sessions[message.session_id].messages.push(message);
        }
        
        // Add to chats array if there are messages
        if (Object.keys(sessions).length > 0) {
          chats.push({
            contact,
            sessions: Object.values(sessions)
          });
        }
      }
    }
    
    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching chat logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat logs' },
      { status: 500 }
    );
  }
} 