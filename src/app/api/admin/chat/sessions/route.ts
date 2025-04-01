import { NextRequest } from 'next/server';
import { createClient } from '@vercel/postgres';

export const runtime = 'edge';
export const preferredRegion = 'auto';

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
    
    // Create a database client
    const client = createClient();
    await client.connect();
    
    // Get all admin chat sessions, ordered by updated_at (most recent first)
    const result = await client.sql`
      SELECT id, session_id, title, created_at, updated_at 
      FROM admin_chat_sessions
      ORDER BY updated_at DESC
    `;
    
    await client.end();
    
    // Return the list of sessions
    return new Response(
      JSON.stringify(result.rows),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error getting admin chat sessions:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to retrieve chat sessions',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 