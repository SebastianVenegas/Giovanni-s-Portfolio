import { NextResponse } from 'next/server';
import { saveContact, initializeDatabase } from '@/lib/db';

// Initialize the database when the API is first loaded
try {
  initializeDatabase().catch(error => {
    console.error('Failed to initialize database:', error);
  });
} catch (error) {
  console.error('Error during database initialization:', error);
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, phoneNumber, sessionId } = body;
    
    // Validate the input
    if (!name || !phoneNumber) {
      return NextResponse.json(
        { error: 'Name and phone number are required' },
        { status: 400 }
      );
    }
    
    // Basic phone number validation
    const phoneRegex = /^[\d\+\-\(\) ]{7,20}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    
    // Save the contact information to the database
    const result = await saveContact(name, phoneNumber);
    
    // Return the contact ID for chat logging
    return NextResponse.json({ 
      success: true, 
      id: result.id,
      contactId: result.id // Explicitly include contactId for clarity
    });
  } catch (error) {
    console.error('Error saving contact:', error);
    
    // Return a more specific error message if possible
    let errorMessage = 'Failed to save contact information';
    if (error instanceof Error) {
      errorMessage = `Database error: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 