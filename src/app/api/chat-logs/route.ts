import { NextRequest, NextResponse } from 'next/server';
import { saveChatMessage } from '@/lib/db';

// This is a regular API route, NOT an Edge function
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contactId, sessionId, role, content } = body;
    
    if (!contactId || !sessionId || !role || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Save message to database
    const result = await saveChatMessage(contactId, sessionId, role, content);
    
    return NextResponse.json({ 
      success: true,
      messageId: result.id
    });
  } catch (error: any) {
    console.error('Error saving chat log:', error);
    return NextResponse.json({ 
      error: 'Failed to save chat log',
      details: error.message 
    }, { status: 500 });
  }
} 