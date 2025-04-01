import { NextRequest } from 'next/server';
import { createClient } from '@vercel/postgres';
import OpenAI from 'openai';

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
    const { sessionId, messages } = await req.json();
    
    // Validate request body
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Invalid request format. Expected sessionId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    let title = 'New Conversation';
    
    if (messages && messages.length > 0) {
      try {
        // Create OpenAI client
        const openaiClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY as string
        });
        
        // Get the first few user messages to base the title on
        const userMessages = messages
          .filter((msg: any) => msg.role === 'user')
          .slice(0, 2)
          .map((msg: any) => msg.content)
          .join(' ');
        
        if (userMessages) {
          // Use AI to generate a concise title
          const response = await openaiClient.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'Create a very short title (max 5 words) for a conversation based on these messages. Return ONLY the title, nothing more.'
              },
              {
                role: 'user',
                content: userMessages.substring(0, 200) // Limit to first 200 chars
              }
            ],
            temperature: 0.7,
            max_tokens: 20
          });
          
          title = response.choices[0]?.message?.content?.trim() || 'New Conversation';
          
          // Ensure title isn't too long
          if (title.length > 50) {
            title = title.substring(0, 47) + '...';
          }
        }
      } catch (aiError) {
        console.error('Error generating title with AI:', aiError);
        
        // Fallback to using the first message
        if (messages[0].role === 'user') {
          const content = messages[0].content;
          title = content.length > 30 ? content.substring(0, 27) + '...' : content;
        }
      }
    }
    
    // Create a database client
    const client = createClient();
    await client.connect();
    
    // Update the session title
    const result = await client.sql`
      UPDATE admin_chat_sessions 
      SET title = ${title} 
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
      JSON.stringify({ success: true, title, session: result.rows[0] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error generating title:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate title',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 