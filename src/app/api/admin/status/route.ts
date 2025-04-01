import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * GET handler for the admin status endpoint
 * This endpoint provides information about the API key configuration
 * without revealing the actual key
 */
export async function GET(req: NextRequest) {
  try {
    // Check environment configuration
    const hasAdminApiKey = !!process.env.ADMIN_API_KEY;
    const hasOpenAIApiKey = !!process.env.OPENAI_API_KEY;
    const adminKeyLength = process.env.ADMIN_API_KEY?.length || 0;
    const openAIKeyLength = process.env.OPENAI_API_KEY?.length || 0;
    const environment = process.env.NODE_ENV || 'development';
    
    // Create a masked version of the key for debugging (first and last char only)
    let maskedAdminKey = '';
    if (process.env.ADMIN_API_KEY && process.env.ADMIN_API_KEY.length > 2) {
      maskedAdminKey = `${process.env.ADMIN_API_KEY.slice(0, 1)}***${process.env.ADMIN_API_KEY.slice(-1)}`;
    }
    
    // Check for the hardcoded key
    const hardcodedKey = 'Aaron3209';
    const matchesHardcoded = process.env.ADMIN_API_KEY === hardcodedKey;
    
    // Check API key from headers if provided
    const providedApiKey = req.headers.get('x-api-key');
    const isKeyValid = providedApiKey === process.env.ADMIN_API_KEY;
    
    return NextResponse.json({
      status: 'ok',
      environment,
      config: {
        hasAdminApiKey,
        hasOpenAIApiKey,
        adminKeyLength,
        openAIKeyLength,
        maskedAdminKey,
        matchesHardcodedKey: matchesHardcoded
      },
      auth: {
        keyProvided: !!providedApiKey,
        keyValid: isKeyValid
      },
      message: 'API status check successful'
    });
  } catch (error) {
    console.error('Error in admin status API:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * This endpoint validates the API key for specific requests
 */
export async function POST(req: NextRequest) {
  try {
    // Extract the API key
    const providedApiKey = req.headers.get('x-api-key');
    const validApiKey = process.env.ADMIN_API_KEY;
    
    // Check if key is present and valid
    if (!providedApiKey) {
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 401 }
      );
    }
    
    if (providedApiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    // Check OpenAI key
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    
    return NextResponse.json({
      status: 'authenticated',
      openAI: hasOpenAIKey ? 'configured' : 'missing',
      message: 'API key validated successfully'
    });
  } catch (error) {
    console.error('Error validating API key:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'An error occurred during validation'
      },
      { status: 500 }
    );
  }
} 