import { NextRequest } from 'next/server';
// Remove PostgreSQL import for Edge runtime
// import { createClient } from '@vercel/postgres';
import { setCorsHeaders, createApiError, createApiResponse, validateApiKey, handleOptionsRequest } from '@/lib/api';

export const runtime = 'edge';
export const preferredRegion = 'auto';

// Handle preflight requests
export async function OPTIONS() {
  return handleOptionsRequest();
}

/**
 * Handles GET requests to retrieve chat sessions
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
      title: "Session Data Unavailable in Edge Runtime",
      messages: [] 
    });
    
    /*
    // This database code is commented out for Edge runtime compatibility
    // Create a database client
    const client = createClient();
    await client.connect();
    
    // Check if the session exists
    const sessionCheck = await client.sql`
      SELECT title FROM admin_chat_sessions WHERE session_id = ${sessionId}
    `;
    
    if (sessionCheck.rowCount === 0) {
      await client.end();
      return createApiError('Session not found', 404);
    }
    
    // Get the messages for this session
    const result = await client.sql`
      SELECT session_id, role, content, created_at
      FROM admin_chat_messages
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC
    `;
    
    await client.end();
    
    // Return the session with its messages
    return createApiResponse({
      sessionId,
      title: sessionCheck.rows[0].title,
      messages: result.rows.map(row => ({
        role: row.role,
        content: row.content,
        created_at: row.created_at
      }))
    });
    */
  } catch (error) {
    console.error('Error retrieving chat session:', error);
    return createApiError('An error occurred while retrieving chat session', 500);
  }
}

/**
 * Handles DELETE requests to delete chat sessions
 */
export async function DELETE(req: NextRequest) {
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
    
    // Skip database query in Edge runtime
    console.log(`[Admin Chat] Session deletion requested (storage disabled): ${sessionId}`);
    
    // Return success response
    return createApiResponse({ 
      success: true,
      message: "Operation not supported in Edge runtime"
    });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return createApiError('An error occurred while deleting chat session', 500);
  }
} 