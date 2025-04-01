import { NextRequest, NextResponse } from 'next/server';
import { saveChatMessage } from '@/lib/db';

// This is a regular API route, NOT an Edge function
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    console.log('📝 Chat logs API called');
    const body = await req.json();
    const { contactId, sessionId, role, content } = body;
    
    console.log(`📝 Chat log request received: contactId=${contactId}, sessionId=${sessionId}, role=${role}, content length=${content?.length || 0}`);
    
    if (!contactId || !sessionId || !role || !content) {
      console.error('❌ Missing required fields:', { contactId, sessionId, role, contentLength: content?.length });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Save message to database
    console.log(`💾 Attempting to save chat message to database...`);
    const result = await saveChatMessage(contactId, sessionId, role, content);
    console.log(`✅ Chat message saved successfully! ID: ${result.id}`);
    
    return NextResponse.json({ 
      success: true,
      messageId: result.id
    });
  } catch (error: any) {
    console.error('❌ Error saving chat log:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to save chat log',
      details: error.message 
    }, { status: 500 });
  }
} 