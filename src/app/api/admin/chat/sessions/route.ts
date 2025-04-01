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
    
    // Skip database query and return empty history
    console.log(`[Admin Chat] Sessions list requested (storage disabled)`);
    
    // Return empty sessions array
    return createApiResponse({ 
      sessions: [] 
    });
    
    /*
    // This database code is commented out for Edge runtime compatibility
    // Create a database client
    const client = createClient();
    await client.connect();
    
    // Get the latest 100 sessions
    const result = await client.sql`
      SELECT session_id, title, updated_at
      FROM admin_chat_sessions
      ORDER BY updated_at DESC
      LIMIT 100
    `;
    
    await client.end();
    
    // Format the results
    const sessions = result.rows.map(row => ({
      id: row.session_id,
      title: row.title,
      updated_at: row.updated_at
    }));
    
    // Return the sessions
    return createApiResponse({ 
      sessions 
    });
    */
  } catch (error) {
    console.error('Error retrieving chat sessions:', error);
    return createApiError('An error occurred while retrieving chat sessions', 500);
  }
} 