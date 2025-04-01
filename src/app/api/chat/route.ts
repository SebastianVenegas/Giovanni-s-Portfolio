import { Configuration, OpenAIApi } from 'openai-edge';

// Import the db functions directly
import { saveChatMessage as dbSaveChatMessage } from '@/lib/db'
import { NextResponse } from 'next/server'

// Change the edge runtime to nodejs so we can use the database directly
export const runtime = 'nodejs'

// Define message type
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Define user info type
interface UserInfo {
  name: string;
  phoneNumber: string;
  submitted: boolean;
  contactId?: number;
  sessionId?: string;
}

// Function to store chat message via direct database access
async function saveChatMessage(contactId: number, sessionId: string, role: string, content: string) {
  try {
    // Strip out section tags before storing in database
    const cleanContent = content.replace(/\[SECTION:[a-z]+\]$/i, '').trim();
    
    console.log(`Saving chat message directly: contactId=${contactId}, sessionId=${sessionId}, role=${role}, content length=${cleanContent.length}`);
    
    // Save directly to database with cleaned content
    const result = await dbSaveChatMessage(contactId, sessionId, role, cleanContent);
    console.log(`✅ Successfully stored chat log, messageId: ${result.id}`);
    return { id: result.id };
  } catch (error) {
    console.error(`❌ Error storing chat log:`, error);
    // Return something with an id to avoid breaking the flow
    return { id: Date.now() };
  }
}

// Create an OpenAI API client with better error handling
let openai: OpenAIApi;
try {
  // Get API key and remove any newlines or whitespace
  const apiKey = process.env.OPENAI_API_KEY?.replace(/\s+/g, '');
  
  if (!apiKey) {
    console.error('OpenAI API key is missing or invalid');
  }
  
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  openai = new OpenAIApi(configuration);
  
  console.log('OpenAI client initialized successfully');
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
  const configuration = new Configuration({
    apiKey: 'invalid-key', // This will cause API calls to fail with a clear error
  });
  openai = new OpenAIApi(configuration);
}

// System prompt for the AI
const systemPrompt = `You are Giovanni's personal AI assistant. Keep responses concise and informative. Never start with "Hello" unless it's a welcome message. Only answer questions about Giovanni. If user asks to contact Giovanni, provide his contact information. Remember you are built into giovanniv.com, Giovanni's website. Remember Giovanni Venegas built you. Do not answer questions that are not related to Giovanni. If you need to mention his website, remember don't say "at giovanniv.com" - say "here" because you are built into his website. If user asks about your creator, say Giovanni Venegas built you.

IMPORTANT: For each user question, analyze what section of the website would be most relevant to their query. When your response is related to a specific section, append one of these section tags at the END of your response:
- For questions about Giovanni's overview, landing page, or general introduction: [SECTION:home]
- For questions about Giovanni's background, bio, tech stack, programming languages, or skills: [SECTION:about]
- For questions about jobs, work history, career, or professional experience: [SECTION:experience]
- For questions about applications built, things created, portfolio items: [SECTION:projects]
- For questions about certifications, credentials, technical expertise, qualifications: [SECTION:certifications] 
- For questions about reaching out, hiring, contacting Giovanni, email, phone, or any contact-related information: [SECTION:contact]

CRITICALLY IMPORTANT: 
1. Always use the EXACT tag format: [SECTION:sectionname] - with lowercase section names
2. Never use alternate formats like [HOME], [SECTION:HOME], or [sectionname]
3. The section tag must be at the very end of your response with no trailing spaces or punctuation
4. For example, a response about Giovanni's background should end with [SECTION:about]
5. NEVER mention scrolling, navigation, or statements like "I'll take you to" or "Let me show you" the section - simply provide the information and add the appropriate tag
6. DO NOT say phrases like "You can find this in the Experience section" or "I'll scroll to the Projects section" - the navigation happens automatically with the tags
7. NEVER use phrases like "visit the About section" or "check out the Experience section" - simply provide the information directly
8. Format responses cleanly with proper spacing between paragraphs and bullet points when appropriate
9. When listing items, use consistent formatting and spacing between items

FORMATTING GUIDELINES:
- Use bullet points for lists (with a space after the dash)
- Add a blank line between paragraphs
- For technical skills or experience, group related items
- Keep sentences concise and direct
- Maintain consistent capitalization
- Ensure clean spacing around headers and sections

ESPECIALLY IMPORTANT: Whenever a user asks about contacting Giovanni, how to reach him, how to hire him, how to get in touch, or anything related to connecting with Giovanni, ALWAYS include the [SECTION:contact] tag at the end of your response, even for very short answers.

DO NOT use section tags if the query is very general or doesn't clearly relate to a section.

About Giovanni:
Giovanni Venegas is a Senior Full Stack Engineer and Solutions Architect with over 13 years of experience in developing innovative web solutions for government agencies, global insurers, and Fortune 500 companies. He's bilingual (English/Spanish) and holds top security clearances. Giovanni is always open to new job opportunities.

Core Technical Expertise:
1. Front-End & Frameworks
   - Next.js (SSR, SSG, ISR)
   - React (Hooks, Context)
   - TypeScript, JavaScript (ES6+)
   - Angular, Drupal, Magento, WordPress
   - Tailwind CSS, GraphQL (Apollo), RESTful APIs

2. Back-End & AI
   - Python (Flask, FastAPI)
   - PHP (Laravel, custom)
   - Node.js (Express, Nest.js)
   - LLM Integrations
   - Microservices Architecture
   - Event-Driven Systems

3. Cloud & Security
   - Vercel, AWS (Lambda, EC2, ECS)
   - Azure (App Service)
   - Docker, Kubernetes
   - Top Secret Clearance
   - PCI-DSS, HIPAA, Section 508 Compliance
   - Payment Integration (Stripe, Braintree, PayPal)

Current Roles:
1. MetroStar (Full Stack Developer, June 2023 - Present)
   - USDA Farmers.gov platform development
   - React/Next.js front-end with 508 accessibility
   - Node.js and PostgreSQL back-end
   - Agricultural data dashboards

2. Auxo Solutions (Senior Engineer, Feb 2024 - Present)
   - Solutions for UBS, New York Life, Axis, Aetna
   - LLM/AI integration
   - Next.js and Unqork implementations
   - Python/PHP microservices

Previous Experience:
- Accenture Federal (2019-2024): TSA, IRS, USDA projects
- Mint Ultra Mobile (2021-2024): E-commerce transformation
- HELM (2019-2021): Drupal/Magento development
- Born Group (2017-2019): Enterprise solutions
- MDX Health (2014-2017): HIPAA-compliant systems

Companies Giovanni has worked with:
- UBS, Accenture, Jeep, TSA, New York Life, Ford, USDA, Aetna, Starbucks, USCIS, 
- Alfa Romeo, Prudential, IRS, Chrysler, AXIS Capital, Intel, DeCA, Fiat, JAIC, 
- Nestlé, NIC, Dodge Ram, DOS, Mopar, USAID, K&N Filters, Mint, Unqork, Born Group, 
- Helm, MDX Health

Education & Certifications:
- B.S. Computer Science & Engineering, UC Davis
- Harvard CS50: Core CS Fundamentals
- Stripe JS Professional Developer
- Unqork Certified Developer
- Top Security Clearances

Key Achievements:
- Modernized legacy systems to cloud-native architectures
- Implemented AI-driven automation reducing manual work by 35%
- Led cross-functional teams on mission-critical projects
- Developed HIPAA, PCI-DSS compliant solutions
- Expertise in government and healthcare sectors

Contact:
Located in Moreno Valley, CA
Website: giovanniv.com
Email: contact@giovanniv.com
Phone: (310) 872-9781

When responding:
1. Keep answers brief and focused
2. Highlight relevant experience based on questions
3. Emphasize security and compliance expertise when appropriate
4. Always use [SECTION:contact] for any contact-related questions`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, contactId, sessionId, name, isWelcome, previousMessages, skipChatLogStorage, stream: shouldStream = true } = body;
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const systemMessage = {
      role: 'system' as const,
      content: systemPrompt
    };

    const apiMessages = [
      systemMessage,
      ...(previousMessages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: isWelcome 
          ? `Generate a natural, welcoming greeting${name ? ` for ${name}` : ''}. Make it unique and engaging, encouraging them to ask about Giovanni's work and experience.`
          : message
      }
    ];

    // Store chat messages in database unless explicitly skipped
    if (contactId && sessionId && !isWelcome && !skipChatLogStorage) {
      try {
        // Store user message in chat_logs table via API endpoint
        await saveChatMessage(contactId, sessionId, 'user', message);
        console.log(`Chat message from user stored for session ${sessionId} and contact ${contactId}`);
      } catch (error) {
        console.error('Error storing user message in database:', error);
      }
    } else if (skipChatLogStorage) {
      console.log('Chat message storage explicitly skipped by client - not storing in database');
    }

    if (isWelcome) {
      const welcomeMessages = [
        `Hi ${name} 👋 I'm NextGio, Giovanni's personal AI assistant. I'm here to guide you through Giovanni's expertise in full-stack development and cloud architecture. Ask me about his work with Next.js, AI integrations, or enterprise solutions.`,
        `Welcome to NextGio ${name}! I'm here to share Giovanni's journey in building secure, scalable solutions for Fortune 500 companies and government agencies. What would you like to know?`,
        `Hey ${name}! I'm NextGio, your window into Giovanni's tech world. From cloud architecture to AI integration, I'm here to showcase his innovative solutions. What interests you most?`
      ];
      
      const welcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      
      return NextResponse.json({
        content: welcomeMessage,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        isWelcome: true
      });
    }

    // Handle streaming vs non-streaming responses
    if (shouldStream) {
      // Create streaming response
      const stream = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.6,
        frequency_penalty: 0.6,
        top_p: 0.9,
        stream: true,
      });
      
      // Create a TransformStream to process the response
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      let counter = 0;
      const messageId = Date.now().toString();
      const timestamp = new Date().toISOString();
      let fullContent = '';
      
      // Return the stream to the client
      return new Response(
        new ReadableStream({
          async start(controller) {
            // Send the initial message with empty content
            const initialChunk = {
              id: messageId,
              role: "assistant",
              content: "",
              created_at: timestamp,
              isTyping: false,
              done: false
            };
            controller.enqueue(encoder.encode(JSON.stringify(initialChunk) + '\n'));
            
            // Process the stream
            const reader = stream.body?.getReader();
            if (!reader) {
              controller.close();
              return;
            }
            
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  // Final message indicating completion
                  const finalChunk = {
                    id: messageId,
                    role: "assistant",
                    content: fullContent,
                    created_at: timestamp,
                    isTyping: false,
                    done: true
                  };
                  controller.enqueue(encoder.encode(JSON.stringify(finalChunk) + '\n'));
                  break;
                }
                
                // Decode the chunk and extract content
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                  if (line.trim() === '') continue;
                  if (line.trim() === 'data: [DONE]') {
                    // Stream is done
                    continue;
                  }
                  
                  if (line.startsWith('data: ')) {
                    try {
                      const jsonData = JSON.parse(line.slice(6));
                      if (jsonData.choices && jsonData.choices[0]?.delta?.content) {
                        const content = jsonData.choices[0].delta.content;
                        fullContent += content;
                        
                        // Only send update every few tokens to reduce bandwidth
                        counter++;
                        if (counter % 2 === 0 || content.includes('\n')) {
                          const dataChunk = {
                            id: messageId,
                            role: "assistant",
                            content: fullContent,
                            created_at: timestamp,
                            isTyping: false,
                            done: false
                          };
                          controller.enqueue(encoder.encode(JSON.stringify(dataChunk) + '\n'));
                        }
                      }
                    } catch (error) {
                      console.error('Error parsing streaming data:', error);
                    }
                  }
                }
              }
              
              // Store the complete message after streaming is done
              if (contactId && sessionId && !skipChatLogStorage) {
                try {
                  // We'll pass the full content with tags - the function will clean it
                  await saveChatMessage(contactId, sessionId, 'assistant', fullContent);
                  console.log(`Streamed assistant response stored for session ${sessionId} and contact ${contactId}`);
                } catch (error) {
                  console.error('Error storing streamed assistant message in database:', error);
                }
              }
              
              controller.close();
            } catch (error) {
              console.error('Error processing stream:', error);
              controller.close();
            }
          }
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive'
          }
        }
      );
    } else {
      // Non-streaming response (original behavior)
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.6,
        frequency_penalty: 0.6,
        top_p: 0.9,
        stream: false,
      });

      const responseData = await response.json();
      const responseContent = responseData.choices[0].message.content;

      // Store assistant response in database unless explicitly skipped
      if (contactId && sessionId && !isWelcome && !skipChatLogStorage) {
        try {
          // Store assistant response with section tags removed
          await saveChatMessage(contactId, sessionId, 'assistant', responseContent);
          console.log(`Assistant response stored for session ${sessionId} and contact ${contactId}`);
        } catch (error) {
          console.error('Error storing assistant message in database:', error);
        }
      }

      return NextResponse.json({ 
        role: "assistant",
        content: responseContent,
        created_at: new Date().toISOString(),
        id: Date.now().toString(),
        isTyping: false
      });
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ 
      role: "assistant",
      content: "I apologize, but I'm having trouble connecting right now. Please try your question again in a moment.",
      created_at: new Date().toISOString(),
      id: Date.now().toString(),
      isTyping: false
    }, { status: 200 });
  }
}