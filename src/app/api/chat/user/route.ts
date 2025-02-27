import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, saveContact, getPoolClient } from '@/lib/db';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('User info submission started');
  
  try {
    // Parse request body
    const body = await req.json();
    const { name, phoneNumber, sessionId } = body;
    
    // Validate required fields
    if (!name || !phoneNumber) {
      return NextResponse.json(
        { error: 'Name and phone number are required' },
        { status: 400 }
      );
    }
    
    // Basic phone validation
    const phoneRegex = /^[\d\+\-\(\) ]{7,20}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number' },
        { status: 400 }
      );
    }
    
    // Store contact in database using the pool client
    const contactResult = await saveContact(name, phoneNumber);
    
    const endTime = Date.now();
    console.log(`User info submission completed in ${endTime - startTime}ms`);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'User information saved successfully',
        contactId: contactResult.id
      },
      { status: 200 }
    );
  } catch (error: any) {
    const endTime = Date.now();
    console.error(`API route error (${endTime - startTime}ms):`, error);
    
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
} 