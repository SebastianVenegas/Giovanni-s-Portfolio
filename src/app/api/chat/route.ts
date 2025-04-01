import { Configuration, OpenAIApi } from 'openai-edge';
// Remove the database import
// import { saveChatMessage, saveChatMessages } from '@/lib/db'
import { NextResponse } from 'next/server'

// Add the edge runtime directive back
export const runtime = 'edge'

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

// Comment out database initialization
// import { initializeDatabase, getPoolClient } from '@/lib/db';

// Initialize database on app startup - comment out
/*
try {
  console.log('Initializing database connection pool...');
  initializeDatabase().then(() => {
    console.log('Database connection pool initialized successfully');
  }).catch(err => {
    console.error('Failed to initialize database connection pool:', err);
  });
} catch (error) {
  console.error('Error during database initialization:', error);
}
*/

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
const systemPrompt = `You are Giovanni's personal AI assistant. Keep responses concise and informative. Never start with "Hello" unless it's a welcome message(Only answer questions about Giovanni)(if user asks to contact Giovanni, provide his contact information)(remaber you are built into giovanniv.com Giovanni's website)(Remaber Giovanni Venegas built you)(do not answer questions that are not related to Giovanni)(If you need to mention his website remaber dont say at giovanniv.com say here because you are built into his website)(if user asks about your creator, say Giovanni Venegas built)

About Giovanni:
Giovanni Venegas is a Senior Full Stack Engineer and Solutions Architect with over 13 years of experience in developing innovative web solutions for government agencies, global insurers, and Fortune 500 companies. He's bilingual (English/Spanish) and holds top security clearances(Giovanni is always opend to new job opportunities).

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

When responding:
1. Keep answers brief and focused
2. Highlight relevant experience based on questions
3. Emphasize security and compliance expertise when appropriate
4. Reference specific projects that demonstrate capabilities
5. Maintain professional tone while being approachable

Remember: You represent a senior professional with extensive experience in both government and private sectors. Focus on his technical expertise and proven track record of delivering secure, compliant solutions.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, contactId, sessionId, name, isWelcome, previousMessages } = body;
    
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

    // Comment out database operations
    /*
    if (contactId && sessionId && !isWelcome) {
      try {
        await saveChatMessage(contactId, sessionId, 'user', message);
      } catch (error) {
        console.error('Error saving user message:', error);
      }
    }
    */

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

    // Comment out database operations
    /*
    if (contactId && sessionId && !isWelcome) {
      try {
        await saveChatMessage(contactId, sessionId, 'assistant', responseContent);
      } catch (error) {
        console.error('Error saving assistant message:', error);
      }
    }
    */

    return NextResponse.json({ 
      role: "assistant",
      content: responseContent,
      created_at: new Date().toISOString(),
      id: Date.now().toString(),
      isTyping: false
    });
    
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