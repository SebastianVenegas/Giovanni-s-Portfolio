import { NextRequest } from 'next/server';
import { createClient } from '@vercel/postgres';

export const runtime = 'edge';
export const preferredRegion = 'auto';

export async function DELETE(req: NextRequest) {
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
    
    // Get the session ID from the URL
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Deleting chat session: ${sessionId}`);
    
    // Delete from database
    const client = createClient();
    await client.connect();
    
    // First delete messages (due to foreign key constraint)
    await client.sql`
      DELETE FROM admin_chat_messages
      WHERE session_id = ${sessionId}
    `;
    
    // Then delete the session
    const result = await client.sql`
      DELETE FROM admin_chat_sessions
      WHERE session_id = ${sessionId}
      RETURNING *
    `;
    
    await client.end();
    
    if (result.rowCount === 0) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Session deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to delete chat session',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 