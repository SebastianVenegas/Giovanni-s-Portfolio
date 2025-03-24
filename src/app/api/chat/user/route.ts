import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, saveContact, getPoolClient } from '@/lib/db';

// Initialize database connection on route module load
try {
  console.log('Initializing database connection in user route...');
  initializeDatabase().catch(err => {
    console.error('Failed to initialize database in user route:', err);
  });
} catch (error) {
  console.error('Error during database initialization in user route:', error);
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('User info submission started');
  
  try {
    // Parse request body
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { name, phoneNumber, sessionId: existingSessionId } = body;
    
    // Validate required fields
    if (!name || !phoneNumber) {
      console.log('Validation failed: missing name or phone number');
      return NextResponse.json(
        { error: 'Name and phone number are required' },
        { status: 400 }
      );
    }
    
    // Basic phone validation
    const phoneRegex = /^[\d\+\-\(\) ]{7,20}$/;
    if (!phoneRegex.test(phoneNumber)) {
      console.log('Validation failed: invalid phone number format');
      return NextResponse.json(
        { error: 'Please enter a valid phone number' },
        { status: 400 }
      );
    }
    
    // Use existing session ID or create a new one
    const sessionId = existingSessionId || `session-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    console.log('Using session ID:', sessionId);
    
    // Verify database connection is active
    console.log('Verifying database connection...');
    const pool = await getPoolClient();
    if (!pool) {
      console.error('Failed to get database connection pool');
      return NextResponse.json(
        { error: 'Database connection error', details: 'Unable to connect to database' },
        { status: 500 }
      );
    }
    
    // Store contact in database
    console.log('Saving contact information to database...');
    console.log('Contact data:', { name, phoneNumber });
    
    try {
      const contactResult = await saveContact(name, phoneNumber);
      console.log('Contact saved successfully:', contactResult);
      
      const endTime = Date.now();
      console.log(`User info submission completed in ${endTime - startTime}ms`);
      
      const response = {
        success: true, 
        message: 'User information saved successfully',
        contactId: contactResult.id,
        sessionId: sessionId
      };
      
      console.log('Sending response:', response);
      
      return NextResponse.json(response, { status: 200 });
    } catch (dbError: any) {
      console.error('Database error when saving contact:', dbError);
      console.error('Error details:', dbError.message);
      console.error('Error stack:', dbError.stack);
      
      return NextResponse.json(
        { error: 'Database error', details: dbError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    const endTime = Date.now();
    console.error(`API route error (${endTime - startTime}ms):`, error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Database connection details:', {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      POSTGRES_URL: process.env.POSTGRES_URL ? 'Set' : 'Not set'
    });
    
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
} 