import { NextRequest, NextResponse } from 'next/server';

/**
 * GET handler for the admin status endpoint
 * This endpoint provides information about the API key configuration
 * without revealing the actual key
 */
export async function GET() {
  try {
    // Check environment configuration
    const hasApiKey = !!process.env.ADMIN_API_KEY;
    const apiKeyLength = process.env.ADMIN_API_KEY?.length || 0;
    const environment = process.env.NODE_ENV || 'development';
    
    // Create a masked version of the key for debugging (first and last char only)
    let maskedKey = '';
    if (process.env.ADMIN_API_KEY && process.env.ADMIN_API_KEY.length > 2) {
      maskedKey = `${process.env.ADMIN_API_KEY.slice(0, 1)}***${process.env.ADMIN_API_KEY.slice(-1)}`;
    }
    
    // Check for the hardcoded key
    const hardcodedKey = 'Aaron3209';
    const matchesHardcoded = process.env.ADMIN_API_KEY === hardcodedKey;
    
    return NextResponse.json({
      status: 'ok',
      environment,
      config: {
        hasApiKey,
        apiKeyLength,
        maskedKey,
        matchesHardcodedKey: matchesHardcoded
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