import { NextRequest } from 'next/server';
import { createAdminChatTables } from '../create-tables';

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
    
    console.log('Creating admin chat database tables via API endpoint...');
    const result = await createAdminChatTables();
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating database tables:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create database tables',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 