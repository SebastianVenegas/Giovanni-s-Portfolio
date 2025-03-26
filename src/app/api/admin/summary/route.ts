import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';

// Define types for our data based on the actual SQL schema
interface ChatLog {
  id: number;
  contact_id: number;
  session_id: string;
  role: string;
  content: string;
  created_at: Date;
}

interface Contact {
  id: number;
  name: string;
  phone_number: string;
  created_at: Date;
  updated_at: Date;
}

interface ConversationData {
  contactName: string;
  contactPhone: string;
  sessionId: string;
  createdAt: Date;
  messageCount: number;
  conversation: string;
}

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
  try {
    // Verify the admin API key from headers
    const apiKey = request.headers.get('x-api-key');
    
    console.log('API Key provided:', apiKey ? 'Yes' : 'No');
    console.log('ENV API Key:', process.env.OPENAI_API_KEY ? 'Available' : 'Not available');

    if (apiKey !== process.env.OPENAI_API_KEY) {
      console.log('Authentication failed: API key mismatch');
      return NextResponse.json({ 
        error: 'Unauthorized',
        summary: "Authentication failed. Please provide a valid API key.",
        topTopics: [],
        sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 },
        recentHighlights: []
      }, { status: 401 });
    }

    // Log OpenAI API key availability (don't log the key itself)
    console.log('OpenAI API Key available:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
    
    try {
      // Use raw SQL query to fetch contacts and chat logs directly
      console.log('Querying database using raw SQL...');
      
      // First get all contacts
      const contacts = await prisma.$queryRaw`
        SELECT * FROM contacts ORDER BY created_at DESC
      `;
      console.log('Fetched contacts:', Array.isArray(contacts) ? contacts.length : 0);

      // Now we need to organize conversations by session
      const sessionMessages = new Map();
      const contactMap = new Map();
      
      // Create a map of contacts for easy lookup
      (contacts as Contact[]).forEach(contact => {
        contactMap.set(contact.id, contact);
      });
      
      // Get all chat logs
      const chatLogs = await prisma.$queryRaw`
        SELECT * FROM chat_logs ORDER BY created_at ASC
      `;
      console.log('Fetched chat logs:', Array.isArray(chatLogs) ? chatLogs.length : 0);
      
      // Group messages by session_id
      (chatLogs as ChatLog[]).forEach(log => {
        if (!sessionMessages.has(log.session_id)) {
          sessionMessages.set(log.session_id, {
            sessionId: log.session_id,
            contactId: log.contact_id,
            messages: [],
            createdAt: log.created_at
          });
        }
        sessionMessages.get(log.session_id).messages.push(log);
      });
      
      // Format all conversations for analysis
      const conversations: ConversationData[] = [];
      
      sessionMessages.forEach(session => {
        if (session.messages.length > 0) {
          const contact = contactMap.get(session.contactId);
          
          if (contact) {
            // Format the conversation for this session
            const conversationText = session.messages
              .map((msg: ChatLog) => `${msg.role.toUpperCase()}: ${msg.content}`)
              .join('\n');
            
            conversations.push({
              contactName: contact.name || 'Unknown',
              contactPhone: contact.phone_number || 'No Phone',
              sessionId: session.sessionId,
              createdAt: session.createdAt,
              messageCount: session.messages.length,
              conversation: conversationText
            });
          }
        }
      });

      console.log(`Processed ${conversations.length} conversations for analysis`);

      // If no conversations, return empty summary
      if (conversations.length === 0) {
        console.log('No conversations found in database, returning empty summary');
        return NextResponse.json({ 
          summary: "No conversations to analyze yet. When users interact with NextGio, Giovanni's portfolio AI chatbot, the summary will appear here.",
          topTopics: [],
          sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 },
          recentHighlights: []
        });
      }

      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key is missing');
        return NextResponse.json({ 
          summary: "Unable to generate summary: OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable.",
          topTopics: ["API Key Missing"],
          sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 },
          recentHighlights: []
        }, { status: 500 });
      }

      // Create a prompt for OpenAI to analyze the conversations
      const prompt = `
        You are an AI assistant tasked with analyzing chat conversations from Giovanni's portfolio website. 
        
        Context:
        NextGio is an AI chatbot built for Giovanni Venegas' portfolio website. NextGio's purpose is to engage 
        with visitors, tell them about Giovanni's skills, experience, and accomplishments, and ultimately help 
        market Giovanni to potential employers or clients. The chatbot should effectively "sell" Giovanni by 
        highlighting his strengths and capabilities.
        
        Here are the conversations that visitors have had with NextGio:
        ${conversations.map((conv: ConversationData, i: number) => `
          CONVERSATION ${i + 1}:
          Contact: ${conv.contactName} (${conv.contactPhone})
          Date: ${new Date(conv.createdAt).toLocaleString()}
          Messages: ${conv.messageCount}
          
          ${conv.conversation}
          
          ---
        `).join('\n')}
        
        Please provide:
        1. A concise summary of the overall themes and patterns in these conversations, focusing on what visitors are asking about Giovanni and how effective NextGio has been in presenting Giovanni's qualifications (max 3 paragraphs)
        2. Top 5 topics or questions users are asking about Giovanni
        3. Sentiment analysis (percentage of positive, neutral, and negative interactions)
        4. 3 highlighted interesting or important conversations that need attention, especially those that might represent good opportunities for Giovanni
        
        Format your response as JSON with the following structure:
        {
          "summary": "Overall summary text here",
          "topTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"],
          "sentimentAnalysis": {"positive": 40, "neutral": 50, "negative": 10},
          "recentHighlights": [
            {"contact": "Name", "highlight": "Brief description of the interesting conversation", "sentiment": "positive/neutral/negative"}
          ]
        }
        
        Only return valid JSON, no other text.
      `;

      console.log('Sending conversations to OpenAI for analysis...');

      // Get summary from OpenAI
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            { role: "system", content: "You are an expert data analyst specializing in career development and personal branding. You analyze conversations to help professionals improve their market positioning and identify opportunities. Always respond with valid JSON only." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        // Parse the response
        const summaryResponse = completion.choices[0].message.content;
        
        console.log('Received response from OpenAI');
        
        // If the response is empty or not valid JSON, return an error
        if (!summaryResponse) {
          console.error('Empty response from OpenAI');
          return NextResponse.json({ 
            error: 'Failed to generate summary: Empty response from OpenAI',
            summary: "Unable to generate summary due to an error with the OpenAI API response.",
            topTopics: ["API Error"],
            sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 },
            recentHighlights: []
          }, { status: 500 });
        }

        try {
          console.log('Parsing OpenAI response to JSON');
          const summaryData = JSON.parse(summaryResponse);
          console.log('Successfully parsed summary data');
          return NextResponse.json(summaryData);
        } catch (e) {
          console.error('Error parsing OpenAI response:', e);
          return NextResponse.json({ 
            error: 'Failed to parse summary data',
            summary: "Unable to generate summary due to an error parsing the OpenAI API response.",
            topTopics: ["API Error"],
            sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 },
            recentHighlights: []
          }, { status: 500 });
        }
      } catch (openAiError: any) {
        console.error('OpenAI API error:', openAiError);
        return NextResponse.json({ 
          error: `Failed to generate summary: ${openAiError.message || 'Unknown OpenAI error'}`,
          summary: "Unable to generate summary due to an error with the OpenAI API.",
          topTopics: ["API Error"],
          sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 },
          recentHighlights: []
        }, { status: 500 });
      }
      
    } catch (dbError: any) {
      console.error('Database query error:', dbError);
      
      // For database errors, return a specific error message
      const errorMessage = dbError.message || 'Unknown database error';
      return NextResponse.json({ 
        error: `Database query failed: ${errorMessage}`,
        summary: "Unable to generate summary due to a database error. Please check your database connection and schema.",
        topTopics: ["Database Error"],
        sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 },
        recentHighlights: []
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error generating AI summary:', error);
    
    // Ensure we're returning a valid object payload with all expected fields
    const errorMessage = error?.message || 'Unknown error';
    return NextResponse.json({ 
      error: `Failed to generate summary: ${errorMessage}`,
      summary: "An unexpected error occurred while generating the summary.",
      topTopics: ["Error Occurred"],
      sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 },
      recentHighlights: []
    }, { status: 500 });
  }
} 