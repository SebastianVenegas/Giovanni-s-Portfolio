import { NextRequest } from 'next/server';
import { createClient } from '@vercel/postgres';

export const runtime = 'edge';
export const preferredRegion = 'auto';

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
    const { sessionId, title } = await req.json();
    
    // Validate request body
    if (!sessionId || !title) {
      return new Response(
        JSON.stringify({ error: 'Invalid request format. Expected sessionId and title' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a database client
    const client = createClient();
    await client.connect();
    
    // Update the session title
    const result = await client.sql`
      UPDATE admin_chat_sessions 
      SET title = ${title}, updated_at = NOW() 
      WHERE session_id = ${sessionId}
      RETURNING *
    `;
    
    await client.end();
    
    // Check if the update was successful
    if (result.rowCount === 0) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Return the updated session
    return new Response(
      JSON.stringify({ success: true, session: result.rows[0] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error updating session title:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to update session title',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 