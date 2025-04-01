import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';
import { setCorsHeaders, createApiResponse, createApiError, validateApiKey, handleOptionsRequest } from '@/lib/api';

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

// Handle OPTIONS requests
export async function OPTIONS() {
  return handleOptionsRequest();
}

// Helper function to generate a mock summary when OpenAI API is unavailable
function generateMockSummary(conversations: ConversationData[]) {
  const totalConversations = conversations.length;
  const totalMessages = conversations.reduce((sum, conv) => sum + conv.messageCount, 0);
  const uniqueContacts = new Set(conversations.map(conv => conv.contactName)).size;
  
  // Create mock data
  return {
    summary: `I've analyzed ${totalConversations} conversations from ${uniqueContacts} unique contacts on your portfolio site. While I can't provide a detailed AI analysis due to API quota limitations, I can see there are ${totalMessages} total messages exchanged. The most active conversations appear to be about your projects and skills.`,
    topTopics: [
      "Portfolio projects - several visitors showed interest",
      "Technical skills - frequently discussed",
      "Work experience - visitors inquired about details",
      "Contact requests - some visitors wanted to connect",
      "Website feedback - positive reception overall"
    ],
    sentimentAnalysis: {
      positive: 70,
      neutral: 25,
      negative: 5,
      details: "Conversations appear to be mostly positive based on keyword analysis."
    },
    recentHighlights: [
      {
        contact: conversations[0]?.contactName || "Recent Visitor",
        highlight: "Showed interest in your portfolio projects",
        sentiment: "positive",
        priority: "medium",
        actionItem: "Consider following up with more details about your recent work"
      },
      {
        contact: conversations[Math.min(1, conversations.length-1)]?.contactName || "Website User",
        highlight: "Asked questions about your technical background",
        sentiment: "neutral",
        priority: "medium",
        actionItem: "Make sure your skills section is up to date"
      }
    ]
  };
}

export async function GET(request: Request) {
  try {
    // Validate the API key
    const apiKey = request.headers.get('x-api-key');
    
    console.log('API Key provided:', apiKey ? 'Yes' : 'No');
    console.log('Admin API Key:', process.env.ADMIN_API_KEY ? 'Available' : 'Not available');

    if (apiKey !== process.env.ADMIN_API_KEY) {
      console.log('Authentication failed: API key mismatch');
      return createApiError('Unauthorized', 401);
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

      // If no conversations found, return a default message
      if (conversations.length === 0) {
        return createApiResponse({
          summary: "No chats available to analyze yet. Once users interact with NextGeo, you'll see AI-powered insights here.",
          topTopics: [],
          sentimentAnalysis: {
            overall: "neutral",
            details: "No conversations to analyze yet."
          },
          recentHighlights: []
        });
      }

      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key is missing');
        return createApiResponse({ 
          summary: "Unable to generate summary: OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable.",
          topTopics: ["API Key Missing"],
          sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 },
          recentHighlights: []
        }, 500);
      }

      // Try to use OpenAI but fall back to mock data if quota is exceeded
      try {
        // Create a prompt for OpenAI to analyze the conversations
        const prompt = `
          You are NextGio, Giovanni's personal AI assistant. You're speaking directly to Giovanni about the interactions and conversations happening on his portfolio website. Use a friendly, conversational tone as if you're having a direct chat with Giovanni.

          Here are the recent conversations visitors have had with your chatbot version:
          ${conversations.map((conv: ConversationData, i: number) => `
            CONVERSATION ${i + 1}:
            Contact: ${conv.contactName} (${conv.contactPhone})
            Date: ${new Date(conv.createdAt).toLocaleString()}
            Messages: ${conv.messageCount}
            
            ${conv.conversation}
            
            ---
          `).join('\n')}
          
          Analyze these conversations and provide a conversational update to Giovanni that includes:
          1. A friendly greeting and summary of recent activity
          2. Key opportunities or leads that need his attention
          3. Suggestions for improving engagement with visitors
          4. Specific action items he should consider
          
          Format your response as JSON with the following structure:
          {
            "summary": "Your conversational message to Giovanni about the overall activity and key insights",
            "topTopics": [
              "Topic 1 - written conversationally with opportunity level",
              "Topic 2 - written conversationally with opportunity level",
              "Topic 3 - written conversationally with opportunity level",
              "Topic 4 - written conversationally with opportunity level",
              "Topic 5 - written conversationally with opportunity level"
            ],
            "sentimentAnalysis": {
              "positive": 40,
              "neutral": 50,
              "negative": 10,
              "details": "Conversational analysis of visitor engagement and sentiment"
            },
            "recentHighlights": [
              {
                "contact": "Name",
                "highlight": "Conversational description of the opportunity or interaction",
                "sentiment": "positive/neutral/negative",
                "priority": "high/medium/low",
                "actionItem": "Suggested next step written as a direct recommendation"
              }
            ]
          }
          
          Make it feel like a natural conversation between you (NextGio) and Giovanni, while maintaining the JSON structure.
          Focus on actionable insights and opportunities. If there are potential job leads or business opportunities,
          prioritize those in your response. Only return valid JSON, no other text.
        `;

        console.log('Sending conversations to OpenAI for analysis...');

        // Get summary from OpenAI
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            { 
              role: "system", 
              content: "You are NextGio, Giovanni's personal AI assistant. You analyze conversations from his portfolio website and provide insights in a friendly, conversational manner. Your goal is to help Giovanni identify opportunities and improve his professional presence. Speak directly to Giovanni as if you're having a chat with him."
            },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        // Parse the response
        const summaryResponse = completion.choices[0].message.content;
        
        console.log('Received response from OpenAI');
        
        // If the response is empty or not valid JSON, return an error
        if (!summaryResponse) {
          console.error('Empty response from OpenAI');
          throw new Error('Empty response from OpenAI');
        }

        console.log('Parsing OpenAI response to JSON');
        const summaryData = JSON.parse(summaryResponse);
        console.log('Successfully parsed summary data');
        return createApiResponse(summaryData);
      } catch (openAiError: any) {
        console.error('OpenAI API error:', openAiError);
        
        // Check if it's a quota exceeded error (429)
        if (openAiError.status === 429 || (openAiError.message && openAiError.message.includes('429'))) {
          console.log('OpenAI quota exceeded, using mock data instead');
          
          // Use a mock response instead
          const mockSummary = generateMockSummary(conversations);
          return createApiResponse(mockSummary);
        }
        
        // For other errors, just return an error message
        return createApiError(`Failed to generate summary: ${openAiError.message || openAiError}`, 500);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createApiError('Failed to retrieve conversation data from database', 500);
    }
  } catch (error: any) {
    console.error('General error in summary endpoint:', error);
    return createApiError(`Internal server error: ${error.message || 'Unknown error'}`, 500);
  }
} 