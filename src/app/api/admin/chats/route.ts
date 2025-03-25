import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getChatHistory, getContacts, getPoolClient } from '@/lib/db';

// Simple API key authentication
function validateApiKey(request: NextRequest): boolean {
  // For development testing
  const apiKey = request.headers.get('x-api-key');
  
  // Get the valid API key from environment variables with fallback
  const validApiKey = process.env.ADMIN_API_KEY || 'admin_access_key_a987zyx654';
  
  // Special development case - allow a hardcoded key for testing
  // IMPORTANT: This is for development only and would be removed in production
  const hardcodedKey = 'Aaron3209';
  
  console.log(`API Key validation: 
    - API key present: ${apiKey ? 'Yes' : 'No'}
    - API key length: ${apiKey?.length || 0}
    - Environment variable set: ${process.env.ADMIN_API_KEY ? 'Yes' : 'No'}
    - Using fallback: ${!process.env.ADMIN_API_KEY ? 'Yes' : 'No'}
    - Key matches .env: ${apiKey === process.env.ADMIN_API_KEY ? 'Yes' : 'No'}
    - Key matches hardcoded: ${apiKey === hardcodedKey ? 'Yes' : 'No'}`);

  if (!apiKey) {
    console.log('API Key validation failed: No API key provided');
    return false;
  }

  // Check against all valid options
  const isValidEnvKey = apiKey === validApiKey;
  const isValidHardcodedKey = apiKey === hardcodedKey;
  
  if (isValidEnvKey || isValidHardcodedKey) {
    if (isValidHardcodedKey && !isValidEnvKey) {
      console.log('API Key validation: Using hardcoded development key');
    }
    return true;
  }
  
  console.log('API Key validation failed: Invalid API key');
  return false;
}

// Helper to get quick statistics
async function getStats() {
  try {
    const pool = await getPoolClient();
    if (!pool) {
      throw new Error('Failed to connect to database');
    }
    
    // Get total users
    const usersResult = await pool.query('SELECT COUNT(*) as total FROM contacts');
    const totalUsers = parseInt(usersResult.rows[0].total, 10);
    
    // Get total chat messages
    const messagesResult = await pool.query('SELECT COUNT(*) as total FROM chat_logs');
    const totalMessages = parseInt(messagesResult.rows[0].total, 10);
    
    // Get count of unique session IDs
    const sessionsResult = await pool.query('SELECT COUNT(DISTINCT session_id) as total FROM chat_logs');
    const totalSessions = parseInt(sessionsResult.rows[0].total, 10);
    
    // Get count of users active today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayFormatted = today.toISOString();
    
    const activeTodayResult = await pool.query(
      'SELECT COUNT(DISTINCT contact_id) as total FROM chat_logs WHERE created_at >= $1',
      [todayFormatted]
    );
    const activeToday = parseInt(activeTodayResult.rows[0].total, 10);
    
    // Get most recent activity
    const lastActivityResult = await pool.query(
      'SELECT created_at FROM chat_logs ORDER BY created_at DESC LIMIT 1'
    );
    const lastActivity = lastActivityResult.rows[0]?.created_at || null;
    
    return {
      totalUsers,
      totalMessages,
      totalSessions,
      activeToday,
      lastActivity
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return null;
  }
}

// GET request handler
export async function GET(request: NextRequest) {
  try {
    // Check API key
    if (!validateApiKey(request)) {
      console.log('Invalid API key for admin API')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    const url = new URL(request.url);
    
    // Check if this is a stats-only request
    if (url.searchParams.get('stats') === 'true') {
      const stats = await getStats();
      if (!stats) {
        throw new Error('Failed to get statistics');
      }
      return NextResponse.json({ stats });
    }
    
    // Get all contacts
    const contacts = await getContacts();
    
    // Get chat history for each contact
    const chats = [];
    
    for (const contact of contacts) {
      // Get all sessions for this contact
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
    
    // Calculate statistics as well
    const stats = await getStats();
    
    return NextResponse.json({ chats, stats });
  } catch (error) {
    console.error('Error fetching chat logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat logs' },
      { status: 500 }
    );
  }
} 