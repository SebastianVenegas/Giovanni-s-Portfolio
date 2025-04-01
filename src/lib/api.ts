import { NextRequest, NextResponse } from 'next/server';

// Helper function to set CORS headers for API responses
export function setCorsHeaders(response: Response | NextResponse): Response | NextResponse {
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', '*'); // In production, restrict to specific origins
  response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.headers.set('Access-Control-Allow-Headers', 
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key');
  
  return response;
}

// Create API response with proper CORS headers
export function createApiResponse(data: any, status: number = 200, headers: Record<string, string> = {}) {
  const response = NextResponse.json(data, { status });
  
  // Add custom headers if provided
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return setCorsHeaders(response);
}

// Handle API errors with proper CORS headers
export function createApiError(message: string, status: number = 500) {
  const response = NextResponse.json({ error: message }, { status });
  return setCorsHeaders(response);
}

// Handle OPTIONS preflight requests
export function handleOptionsRequest() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// Utility function to validate API keys
export function validateApiKey(req: NextRequest, envKeyName: string = 'ADMIN_API_KEY') {
  const apiKey = req.headers.get('x-api-key');
  const envKey = process.env[envKeyName];
  
  if (!apiKey || apiKey !== envKey) {
    return false;
  }
  
  return true;
} 