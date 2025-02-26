import { OpenAI } from 'openai'

// Define message type
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Create an OpenAI API client with better error handling
let openai: OpenAI;
try {
  // Get API key and remove any newlines or whitespace
  const apiKey = process.env.OPENAI_API_KEY?.replace(/\s+/g, '');
  
  if (!apiKey) {
    console.error('OpenAI API key is missing or invalid');
  }
  
  openai = new OpenAI({
    apiKey: apiKey,
  });
  
  console.log('OpenAI client initialized successfully');
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
  openai = new OpenAI({
    apiKey: 'invalid-key', // This will cause API calls to fail with a clear error
  });
}

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    console.log('Received chat request');
    const { messages } = await request.json()

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid request format:', { messages });
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Add system message to provide context about Giovanni
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are an AI assistant for Giovanni, a senior software engineer with expertise in Next.js, React, TypeScript, Python, and enterprise solutions. 
      You help visitors to Giovanni's portfolio website by answering questions about his skills, experience, and projects.
      Be professional, helpful, and concise in your responses. If asked about contacting Giovanni, suggest using the contact form on the website.
      If asked about technical topics, provide knowledgeable responses that reflect Giovanni's expertise.
      
      IMPORTANT: The website has automatic scrolling functionality for different sections. When users ask about specific topics, the page will automatically scroll to the relevant section:
      
      1. When users ask about Giovanni, his background, or who he is, the page will scroll to the "about" section.
         Acknowledge this by saying something like "I've scrolled to the About section for you. Here's information about Giovanni:"
      
      2. When users ask about Giovanni's experience, work history, or career, the page will scroll to the "experience" section.
         Acknowledge this by saying something like "I've scrolled to the Experience section for you. Here's information about Giovanni's professional background:"
      
      3. When users ask about projects or Giovanni's work, the page will scroll to the "projects" section.
         Acknowledge this by saying something like "I've scrolled to the Projects section for you. Here's information about Giovanni's projects:"
      
      4. When users ask about certifications, qualifications, or education, the page will scroll to the "certifications" section.
         Acknowledge this by saying something like "I've scrolled to the Certifications section for you. Here's information about Giovanni's credentials:"
      
      5. When users ask about contacting Giovanni or how to reach him, the page will scroll to the "contact" section.
         Acknowledge this by saying something like "I've scrolled to the Contact section for you. Here's how you can get in touch with Giovanni:"
      
      Do not make up specific details about Giovanni's personal life or information not mentioned in the portfolio.`
    }

    // Prepare messages array with system message first
    const apiMessages = [
      systemMessage,
      ...messages
    ]

    // Log the request for debugging
    console.log('Sending request to OpenAI with messages:', 
      apiMessages.map(m => ({ role: m.role, content: m.content.substring(0, 50) + '...' }))
    );

    // Create a non-streaming response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 800,
    });

    // Format the response in the way Vercel AI SDK expects
    const responseData = {
      id: Date.now().toString(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'gpt-3.5-turbo',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: completion.choices[0].message.content,
          },
          finish_reason: 'stop',
        },
      ],
    };

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred during your request.',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}