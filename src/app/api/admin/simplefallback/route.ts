import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';
export const preferredRegion = 'auto';

export async function POST(req: NextRequest) {
  try {
    // Extract the API key
    const apiKey = req.headers.get('x-api-key');
    
    // Validate the API key
    if (!apiKey || apiKey !== "Aaron3209") {
      console.log('Invalid API key provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body
    const { messages } = await req.json();
    
    // Validate request body
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request format. Expected messages array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize OpenAI
    const openAIClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Get response from OpenAI (non-streamed)
    const completion = await openAIClient.chat.completions.create({
      model: 'gpt-4',
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
      temperature: 0.7,
      max_tokens: 1500,
    });
    
    const responseContent = completion.choices[0].message.content || '';
    
    // Return as a JSON response
    return new Response(
      JSON.stringify({ text: responseContent }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        } 
      }
    );
  } catch (error) {
    console.error('Error in admin simple fallback API:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process message',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        text: 'I apologize, but I encountered an error while processing your request. Please try again with a different question.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 