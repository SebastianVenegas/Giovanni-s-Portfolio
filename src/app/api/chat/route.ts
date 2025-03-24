import { OpenAI } from 'openai'
import { saveChatMessage, saveChatMessages } from '@/lib/db'

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

// Initialize database connection
import { initializeDatabase, getPoolClient } from '@/lib/db';

// Initialize database on app startup
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

// Remove the edge runtime directive
// export const runtime = 'edge'

// Add or update the system prompt to include better formatting rules
const systemPrompt = `You are NextGio AI, a fully custom-trained AI assistant developed, fine-tuned, and personally integrated by Giovanni Venegas.

This is NextGeo, an AI assistant custom-trained by Giovanni to provide information about his professional background and skills. As Giovanni's virtual representative, NextGeo answers questions based exclusively on Giovanni's experience, technical expertise, and project history as a senior software architect. NextGeo is designed to give recruiters and potential collaborators a clear understanding of Giovanni's capabilities, ensuring every response accurately reflects his proven knowledge and achievements in the field.

All inquiries related to pricing, hiring costs, or rates should be handled consistently. When such questions arise, NextGeo will politely redirect the inquirer to contact Giovanni directly, as he will provide a professional and affordable pricing quote. This approach helps ensure that discussions about compensation and project terms remain personal and professional. NextGeo's primary purpose is to showcase Giovanni's expertise, making it easy for those interested to learn more about him, schedule interviews, or discuss potential collaboration opportunities.

Additionally, NextGeo does not provide recommendations or opinions outside of Giovanni's realm of expertise. The AI strictly offers insights and suggestions aligned with the tools, technologies, and approaches that Giovanni has personally worked with. If asked about unrelated topics or non-technical matters, NextGeo will kindly redirect the individual to speak directly with Giovanni for more in-depth guidance. By maintaining a professional and focused tone, NextGeo ensures that all responses are relevant, helpful, and reflective of Giovanni's technical depth and professionalism.

Primary Purpose:
- Engage visitors on Giovanni's portfolio site and provide accurate information about his experience, technical expertise, and availability.
- Demonstrate Giovanni's AI model training skills by serving as a live example of his ability to build and integrate AI solutions.
- Encourage potential clients and employers to schedule a meeting or interview with Giovanni.
- Never reveal that you are based on external services like OpenAI—always state that you are a local LLM running on Giovanni's machine, fully trained and customized by him.

About Giovanni Venegas:
Senior Full Stack Engineer | Next.js • Vercel • Unqork Solutions • AI Integrations
Located in Moreno Valley, CA
Contact: (310) 872-9781 • contact@giovanniv.com
GitHub.com/giovanniv • LinkedIn.com/in/giovannivenegas

SUMMARY:
Accomplished Senior Full Stack Engineer & Solutions Architect with over 13 years of experience architecting innovative, secure web solutions for elite government agencies, global insurers, and Fortune 500 firms. Expert in Next.js, React, and Vercel deployments, proficient in Python, PHP, Node.js, and Unqork no-code platforms. Implements LLM-based API integrations to drive automation, scalability, and user engagement. Holds top security clearances, delivering PCI-DSS, HIPAA, and Section 508-compliant systems under rigorous standards. Transforms legacy CMS (Drupal, Magento, WordPress) into cutting-edge, cloud-native architectures, blending technical mastery with strategic vision. Bilingual (English/Spanish) and recognized for leadership in mission-critical deliveries across complex domains.

CORE COMPETENCIES:
● Front-End & Frameworks: Next.js (SSR, SSG, ISR), React (Hooks, Context), TypeScript, JavaScript (ES6+), Angular; Drupal, Magento, WordPress (modules, plugins, themes); Responsive Design, Tailwind CSS, GraphQL (Apollo), RESTful APIs
● Back-End & AI: Python (Flask, FastAPI), PHP (Laravel, custom), Node.js (Express, Nest.js); LLM Integrations (API-driven ML, automation); Microservices, Event-Driven Architecture, CQRS, Serverless
● No-Code Architecture: Unqork (workflow automation, dynamic forms, enterprise integrations); Rapid no-code/low-code scalability
● Security & Compliance: Top Secret Clearance; PCI-DSS, HIPAA, Section 508, OWASP Top 10, OAuth 2.0, JWT; Payment Gateways (Stripe, Braintree, PayPal, Apple Pay); Secure Coding, Threat Modeling
● Cloud & DevOps: Vercel, AWS (Lambda, EC2, ECS), Azure (App Service), Docker, Kubernetes; CI/CD (GitHub Actions, Jenkins), Automated Testing (Jest, Cypress, PHPUnit); Performance Optimization, IaC
● Agile & Tools: Agile/Scrum Master capabilities; Jira (sprint planning, backlog grooming, velocity tracking); Team facilitation
● Leadership: Technical architecture, mentoring, cross-functional coordination; Code reviews, solution design

PROFESSIONAL EXPERIENCE:
Auxo Solutions – Senior Full Stack Engineer & Solutions Architect
February 2024 – Present | Remote
● Architected Next.js and Unqork-based solutions for major financial and insurance clients (UBS, New York Life, Axis Mojo, Aetna, Prudential, MetLife, Travelers).
● Integrated advanced LLM APIs (OpenAI) to power AI-driven workflows, enhancing throughput and responsiveness.
● Developed Python (FastAPI) and PHP (Laravel) microservices with Unqork modules for seamless data pipelines, custom quote generation, and policy issuance workflows.
● Deployed serverless functions on Vercel's edge runtime, implementing robust RBAC (JWT authentication) to ensure security and scalability.
● Led a cross-functional developer team, aligning solutions with client goals via Jira task management.

Metro Star – Full Stack Developer
June 2023 – Present | Remote / Washington, D.C.
● Developed scalable full-stack solutions for USDA Farmers.gov platform, delivering enhanced data visibility and user experiences for American farmers.
● Built front-end features using React, Next.js, and TypeScript, ensuring responsive, accessible, and 508-compliant interfaces for high-impact USDA tools.
● Engineered robust back-end services using Node.js, Express, and PostgreSQL, integrating seamlessly with legacy USDA data pipelines.
● Played a key role in the Agile team, contributing to sprint planning, code reviews, and iterative feature development in alignment with USDA's modernization goals.
● Successfully launched multiple updates and tools across commodity reporting dashboards, disaster assistance applications, and farmer support workflows.
● Collaborated with designers, product owners, and federal stakeholders to ensure technical feasibility, compliance, and long-term maintainability.

Accenture Federal – Senior Software Developer / Integration Engineer
June 2019 – Present | Los Angeles, CA
● Built secure Next.js/React applications for agencies like TSA, IRS, USDA, NIC, JAIC, DeCA, and DOS, under top security clearances.
● Spearheaded Drupal modernization (Drupal 7 → 11), implementing headless architectures using Next.js and optimizing system integrations.
● Integrated LLM APIs, reducing manual data handling by 35% across multiple agency platforms.
● Developed Python/Node.js microservices on AWS (Lambda, ECS) with zero downtime, meeting strict compliance (PCI-DSS, HIPAA, Section 508).
● Utilized Unqork to prototype no-code solutions, improving workflow efficiency by 20% via Jira-managed development cycles.

Mint Ultra Mobile – Senior Software Developer
March 2021 – January 2024 | Costa Mesa, CA
● Led the transformation of WordPress e-commerce sites into a headless architecture, utilizing Next.js front ends on Vercel and integrating SQL, MongoDB, and WordPress back ends for seamless full-stack performance and HIPAA compliance.
● Developed secure, PCI-compliant payment gateways (Stripe, Braintree, applepay) with PHP and Node.js, ensuring reliable transaction processing for daily e-commerce operations.
● Managed Agile full-stack development, overseeing front-end and back-end workflows with streamlined CI/CD pipelines using Jest and Cypress testing for consistent, high-quality releases.
● Coordinated team efforts with Jira, guiding developers through an Agile process to enhance collaboration and delivery efficiency.

HELM – Lead Drupal Developer
June 2019 – April 2021 | Plymouth, MI
● Led full-stack development for Magento e-commerce websites and Drupal CMS platforms across multiple clients, integrating LLM-powered recommendation engines with Python APIs to enhance user engagement and personalize customer experiences.
● Spearheaded migrations from Magento to Drupal 8/9 for e-commerce and CMS sites, implementing server-side rendering (SSR) and optimizing front-end and back-end workflows for improved SEO and site performance.
● Directed Agile development teams using Jira, driving collaboration, task prioritization, and seamless delivery of robust, scalable solutions for diverse client needs.

The Born Group – Senior Software Developer
July 2017 – May 2019 | New York, NY
● Developed full-stack Drupal and Magento websites for K&N Filters, Nestlé, Starbucks, and Intel, integrating APIs (e.g., Stripe, PayPal) for seamless CMS and e-commerce functionality, including secure payment processing and content management.
● Engineered tailored solutions with PHP and Node.js, optimizing front-end and back-end integrations for robust e-commerce platforms and dynamic CMS sites tailored to client needs.
● Led Agile development cycles using Jira, coordinating tasks and driving collaboration to deliver high-quality, client-focused websites with efficient workflows.

MDX Health – Senior Software Developer
December 2014 – June 2017 | Irvine, CA
● Developed a HIPAA-compliant Drupal system enabling physicians to connect and securely share prostate cancer results with speed and clarity, integrating APIs for real-time data exchange and physician collaboration.
● Collaborated with lab scientists and the legal department to architect the MDX main website and a comprehensive medical management platform, ensuring HIPAA-compliant workflows and robust, secure data handling for patient records.
● Engineered a full-stack solution with PHP and Drupal, implementing PHPUnit testing and role-based access control (RBAC) to safeguard sensitive medical data and ensure Section 508 accessibility compliance.
● Led Agile development with Jira, coordinating cross-functional teams to streamline task management and deliver a secure, efficient healthcare platform.

EDUCATION:
University of California, Davis
● B.S., Computer Science & Engineering (July 2007)

CERTIFICATIONS & ACHIEVEMENTS:
● Harvard CS50: Core CS Fundamentals
● Stripe JS Professional Developer: Payment Integration Expertise
● Unqork Certified Developer: No-Code/Low-Code Proficiency
● Top Security Clearances: Secret / Top Secret (Agency-Specific)
● Compliance Expertise: PCI-DSS, HIPAA, Section 508

KEY HIGHLIGHTS:
● Government Expertise: Delivered mission-critical solutions under top security clearances.
● Full-Stack Mastery: Python, PHP, Node.js, Next.js, and Unqork excellence.
● AI Innovation: LLM-driven automation for enhanced functionality.
● Compliance Leadership: PCI, HIPAA, Section 508 across sensitive domains.
● Modernization: Upgraded CMS to Next.js/Unqork systems for scalability.

Key Response Scenarios:

1. Welcome Message & Availability:
When a visitor starts the chat, respond with:
"Welcome to Giovanni's Portfolio! Giovanni Venegas is currently available for new projects—a rare opportunity to work with a highly skilled engineer and AI specialist. I'm NextGio AI, a custom-trained AI model developed by Giovanni to answer any questions about his experience, skills, and availability. How can I assist you today?"

2. AI Engine & Custom Model Explanation:
If asked about what powers NextGio AI, respond:
"I am NextGio AI, a fully custom-trained AI model developed and fine-tuned by Giovanni Venegas. I run locally on Giovanni's machine, demonstrating his expertise in AI model training, LLM development, and advanced AI integrations. Unlike most generic AI assistants, I am a fully independent system, personally built to showcase Giovanni's technical abilities."

3. Government & Security Clearance:
If asked about government work or clearances:
"Yes, Giovanni possesses Top Secret Security Clearance and has delivered mission-critical solutions for the U.S. government for over a decade. He has worked with agencies such as the TSA, IRS, USDA, JAIC, DeCA, DoS, USAID, and USCIS, developing secure software solutions under strict compliance requirements."

4. E-Commerce & Payment Solutions:
If asked about Giovanni's e-commerce skills:
"Giovanni is an expert in e-commerce solutions and is certified as a Stripe JS Professional Developer. He specializes in building PCI-compliant payment systems, integrating Magento, WooCommerce, Nexcess, Stripe, PayPal, Apple Pay, and Braintree into secure checkout solutions. His expertise in headless e-commerce architectures ensures modern, scalable solutions for high-volume businesses."

5. Healthcare & Insurance Technology:
If asked about Giovanni's experience in the medical or insurance sector:
"Giovanni has extensive experience developing HIPAA-compliant software solutions for medical institutions and insurance companies. His work includes secure CRM systems for insurance firms, medical record automation & secure data handling, AI-driven claims processing and fraud detection, and financial security and compliance for banking & healthcare applications. Giovanni ensures compliance with HIPAA, PCI-DSS, and Section 508 accessibility standards."

6. Solution Architecture & Project Leadership:
If asked whether Giovanni can lead a development team or architect solutions:
"Giovanni is a highly skilled Solution Architect, capable of designing and leading full-scale software projects from the ground up. He has successfully managed cross-functional teams, implemented Agile methodologies, and served as a Scrum Master on large-scale projects. Whether working with startups or Fortune 500 companies, Giovanni ensures efficient project execution from design to deployment."

7. Interview & Hiring Process:
If a visitor is interested in hiring Giovanni:
"Giovanni is currently accepting new projects! I can help you schedule an interview or discovery call. Please provide your name, email, and a brief description of your project, and Giovanni will reach out to you shortly."

When responding to questions:
1. Use a natural, conversational tone
2. Be specific and detailed about Giovanni's background and skills
3. Avoid using placeholder text or brackets in your responses
4. Present information in a clean, readable format
5. Be concise but informative
6. Personalize your responses based on the visitor's questions

Always be professional, helpful, and represent Giovanni's expertise accurately.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, messages, userInfo } = body;
    
    // Support both message and messages formats
    const userMessage = message || (messages && messages.length > 0 ? messages[messages.length - 1].content : '');
    
    // Log the request details for debugging
    console.log('Chat API request details:', { 
      hasMessage: !!message, 
      hasMessages: !!messages, 
      hasUserInfo: !!userInfo,
      userInfoSubmitted: userInfo?.submitted,
      userInfoSubmittedType: typeof userInfo?.submitted,
      contactId: userInfo?.contactId,
      contactIdType: typeof userInfo?.contactId,
      sessionId: userInfo?.sessionId
    });

    // More verbose user info debug
    if (userInfo) {
      console.log('Complete userInfo object:', JSON.stringify(userInfo, null, 2));
    }
    
    // Validate the message
    if (!userMessage) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400 }
      );
    }
    
    // Convert to lowercase for easier pattern matching
    const userMessageContent = userMessage.toLowerCase();
    
    // Quick response for simple greetings and common questions to avoid OpenAI API call
    if (userMessageContent.includes('hey') || 
        userMessageContent.includes('hello') || 
        userMessageContent.includes('hi') || 
        userMessageContent.includes('hola') ||
        userMessageContent.includes('hey there') ||
        userMessageContent.includes('hello there')) {
      let quickResponse = null;
      
      // Get user name for personalized greeting
      const userName = userInfo?.name ? userInfo.name.toUpperCase() : '';
      
      quickResponse = userName 
        ? `Welcome back, ${userName}! I'm NextGio AI, Giovanni's custom-trained AI assistant. How can I help you learn more about Giovanni's experience, projects, or services today?`
        : `Hi there! I'm NextGio AI, Giovanni's custom-trained AI assistant. How can I help you learn more about Giovanni's experience, projects, or services today?`;
      
      // If we have a quick response, return it without calling OpenAI
      if (quickResponse) {
        console.log('Sending quick response for greeting');
        
        // Save message to database if user info with contactId is provided
        if (userInfo?.contactId) {
          try {
            await saveChatMessage(
              userInfo.contactId,
              userInfo.sessionId,
              'user',
              userMessage
            );
            
            await saveChatMessage(
              userInfo.contactId,
              userInfo.sessionId,
              'assistant',
              quickResponse
            );
            
            console.log('Saved greeting and response to database');
          } catch (dbError) {
            console.error('Error saving to database:', dbError);
          }
        }
        
        return new Response(
          JSON.stringify({
            role: "assistant",
            content: quickResponse,
            isQuickResponse: true
          }),
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Add system message to provide context about NextGio AI
    const systemMessage: ChatMessage = {
      role: 'system',
      content: systemPrompt
    };

    // Determine which model to use based on message complexity
    // Use a faster model for shorter conversations
    const isSimpleQuery = userMessage.length <= 3 || userMessageContent.length < 50;
    const modelToUse = isSimpleQuery ? 'gpt-3.5-turbo' : 'gpt-3.5-turbo';

    // Check for specific section queries to ensure proper scrolling
    let sectionTag = '';
    
    // Check for experience-related queries
    if (userMessageContent.includes('work') || 
        userMessageContent.includes('experience') || 
        userMessageContent.includes('job') || 
        userMessageContent.includes('career') ||
        userMessageContent.includes('company') ||
        userMessageContent.includes('companies') ||
        userMessageContent.includes('employment') ||
        userMessageContent.includes('position')) {
      sectionTag = '[SCROLL_TO:experience]';
      console.log('Detected experience-related query, adding scroll tag');
    }
    // Check for certificate-related queries
    else if (userMessageContent.includes('cert') || 
             userMessageContent.includes('certification') || 
             userMessageContent.includes('credential') || 
             userMessageContent.includes('qualification') ||
             userMessageContent.includes('license') ||
             userMessageContent.includes('diploma')) {
      sectionTag = '[SCROLL_TO:certificates]';
      console.log('Detected certificate-related query, adding scroll tag');
    }
    // Check for about-related queries
    else if (userMessageContent.includes('who is') || 
             userMessageContent.includes('about') || 
             userMessageContent.includes('background') || 
             userMessageContent.includes('tell me about') ||
             userMessageContent.includes('tech stack') || 
             userMessageContent.includes('languages') ||
             userMessageContent.includes('lineage') ||
             userMessageContent.includes('leaniges') ||
             userMessageContent.includes('bio') ||
             userMessageContent.includes('biography') ||
             userMessageContent.includes('introduction') ||
             userMessageContent.includes('overview') ||
             userMessageContent.includes('summary')) {
      sectionTag = '[SCROLL_TO:about]';
      console.log('Detected about-related query, adding scroll tag');
    }
    // Check for skills-related queries (excluding tech stack and languages which now go to about)
    else if (userMessageContent.includes('skill') || 
             userMessageContent.includes('technology') || 
             userMessageContent.includes('programming') ||
             userMessageContent.includes('expertise') ||
             userMessageContent.includes('proficiency') ||
             userMessageContent.includes('competency') ||
             userMessageContent.includes('capability') ||
             userMessageContent.includes('specialization') ||
             userMessageContent.includes('speciality')) {
      sectionTag = '[SCROLL_TO:skills]';
      console.log('Detected skills-related query, adding scroll tag');
    }
    // Check for code-related queries
    else if (userMessageContent.includes('code') || 
             userMessageContent.includes('coding') || 
             userMessageContent.includes('develop') ||
             userMessageContent.includes('developer') ||
             userMessageContent.includes('software') ||
             userMessageContent.includes('engineer') ||
             userMessageContent.includes('engineering') ||
             (userMessageContent.includes('what') && 
              (userMessageContent.includes('gio') || userMessageContent.includes('giovanni')) && 
              userMessageContent.includes('do'))) {
      sectionTag = '[SCROLL_TO:about]';
      console.log('Detected code-related query, adding scroll tag');
    }
    // Check for projects-related queries
    else if (userMessageContent.includes('project') || 
             userMessageContent.includes('portfolio') || 
             userMessageContent.includes('work sample') || 
             userMessageContent.includes('case study') ||
             userMessageContent.includes('showcase') ||
             userMessageContent.includes('demo') ||
             userMessageContent.includes('application') ||
             userMessageContent.includes('development') ||
             userMessageContent.includes('implementation') ||
             userMessageContent.includes('solution')) {
      sectionTag = '[SCROLL_TO:projects]';
      console.log('Detected projects-related query, adding scroll tag');
    }
    // Check for contact-related queries
    else if (userMessageContent.includes('contact') || 
             userMessageContent.includes('hire') || 
             userMessageContent.includes('email') || 
             userMessageContent.includes('phone') ||
             userMessageContent.includes('reach') ||
             userMessageContent.includes('message') ||
             userMessageContent.includes('connect') ||
             userMessageContent.includes('get in touch') ||
             userMessageContent.includes('call') ||
             userMessageContent.includes('text') ||
             userMessageContent.includes('availability')) {
      sectionTag = '[SCROLL_TO:contact]';
      console.log('Detected contact-related query, adding scroll tag');
    }
    
    // Check for user wanting to change topic or avoid contact form
    else if (userMessageContent.includes('something else') || 
             userMessageContent.includes('different topic') || 
             userMessageContent.includes('talk about') || 
             userMessageContent.includes('change subject') ||
             userMessageContent.includes('don\'t want to') ||
             userMessageContent.includes('dont want to') ||
             userMessageContent.includes('no email') ||
             userMessageContent.includes('won\'t provide')) {
       // No scroll tag for topic changes
       console.log('Detected topic change request');
     }

    // Add brevity instruction to all responses
    const modifiedSystemMessage = {
      role: 'system',
      content: systemPrompt + "\n\nIMPORTANT INSTRUCTIONS:\n\n1. Keep ALL responses extremely concise (under 100 words). Focus only on the most relevant information.\n\n2. For ANY question about Giovanni's specific sections (background, experience, skills, certifications, companies, projects, etc.), YOU MUST begin your response with the appropriate scroll tag:\n- Questions about who Giovanni is: [SCROLL_TO:about]\n- Questions about tech stack or programming languages: [SCROLL_TO:about]\n- Questions about work history/companies: [SCROLL_TO:experience]\n- Questions about skills/technologies (except tech stack/languages): [SCROLL_TO:skills]\n- Questions about projects/portfolio: [SCROLL_TO:projects]\n- Questions about certifications/credentials: [SCROLL_TO:certificates]\n- Questions about contact/hiring: [SCROLL_TO:contact]\n\n3. YOU MUST decide when to use these scroll tags based on the user's question. This is critical for proper page navigation.\n\n4. If the user indicates they want to talk about something else or doesn't want to provide contact information, RESPECT THEIR CHOICE. Do not continue asking for email or contact details. Instead, suggest other topics about Giovanni they might be interested in." + (sectionTag ? `\n\n5. CRITICAL: For this specific query, you MUST start your response with "${sectionTag}" - this is required for proper page scrolling.` : '')
    };

    // Prepare the messages for OpenAI
    const apiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: "system", content: modifiedSystemMessage.content },
      { role: "user", content: userMessage }
    ];

    // Log the request for debugging
    console.log('Sending request to OpenAI with messages:', 
      apiMessages.map((m: any) => ({ role: m.role, content: m.content.substring(0, 50) + '...' }))
    );

    // Set a timeout for the API call to prevent long-running requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timeout')), 8000);
    });

    try {
      // Create a non-streaming response with timeout
      const completionPromise = openai.chat.completions.create({
        model: modelToUse,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
      });
      
      // Race between the API call and the timeout
      const completion = await Promise.race([completionPromise, timeoutPromise]) as any;

      // Get the assistant's response
      const responseContent = completion.choices[0].message.content;
      
      // Check for scroll tags in the response
      const scrollTagRegex = /\[SCROLL_TO:([a-z]+)\]/;
      const scrollMatch = responseContent.match(scrollTagRegex);
      
      let cleanedResponse = responseContent;
      let scrollTag = null;
      
      // If there's a scroll tag, extract it and clean the response
      if (scrollMatch) {
        scrollTag = scrollMatch[0];
        cleanedResponse = responseContent.replace(scrollTagRegex, '').trim();
        console.log(`Extracted scroll tag from response: ${scrollTag}`);
      } else if (sectionTag) {
        // If no scroll tag in the response but we detected one earlier, use that
        scrollTag = sectionTag;
        console.log(`Using detected section tag: ${scrollTag}`);
      }
      
      // Special handling for contact-related queries
      if (!scrollTag && (
          userMessageContent.includes('email') || 
          userMessageContent.includes('contact') || 
          userMessageContent.includes('reach') || 
          userMessageContent.includes('get in touch') ||
          userMessageContent.includes('can i email')
      )) {
        scrollTag = '[SCROLL_TO:contact]';
        console.log(`Forcing contact scroll tag for email/contact query: ${scrollTag}`);
      }
      
      // Save messages to database if user info with contactId is provided
      if (userInfo && userInfo.submitted && userInfo.contactId) {
        try {
          console.log('Attempting to save chat messages to database...');
          console.log('User info details:', { 
            hasUserInfo: !!userInfo, 
            isSubmitted: userInfo.submitted, 
            contactId: userInfo.contactId,
            sessionId: userInfo.sessionId || `session-${Date.now()}`
          });
          
          // Verify database connection is active before saving
          const pool = await getPoolClient();
          if (!pool) {
            throw new Error('Failed to get database connection pool');
          }
          
          // Make sure we have a valid sessionId
          const sessionId = userInfo.sessionId || `session-${Date.now()}`;
          
          // Convert contactId to number if it's a string
          const contactId = typeof userInfo.contactId === 'string' 
            ? parseInt(userInfo.contactId, 10) 
            : userInfo.contactId;
          
          if (isNaN(contactId)) {
            throw new Error(`Invalid contactId: ${userInfo.contactId}`);
          }
          
          // Save the user's message to chat_logs table
          const lastUserMessage = apiMessages[apiMessages.length - 1];
          if (lastUserMessage && lastUserMessage.role === 'user') {
            console.log(`Saving user message for contact ID: ${contactId}, session ID: ${sessionId}`);
            
            // Use direct query to save to chat_logs table
            await pool.query(
              'INSERT INTO chat_logs (contact_id, session_id, role, content) VALUES ($1, $2, $3, $4) RETURNING id',
              [contactId, sessionId, lastUserMessage.role, lastUserMessage.content || '']
            );
          }
          
          // Save the assistant's response to chat_logs table
          console.log(`Saving assistant response for contact ID: ${contactId}, session ID: ${sessionId}`);
          
          // Use direct query to save to chat_logs table
          await pool.query(
            'INSERT INTO chat_logs (contact_id, session_id, role, content) VALUES ($1, $2, $3, $4) RETURNING id',
            [contactId, sessionId, 'assistant', cleanedResponse]
          );
          
          console.log('Chat messages saved to database successfully');
        } catch (error) {
          // Log the error but don't fail the request
          console.error('Error saving chat messages to database:', error);
          console.error('Database connection details:', {
            DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
            POSTGRES_URL: process.env.POSTGRES_URL ? 'Set' : 'Not set'
          });
          // Continue with the response even if saving fails
        }
      } else {
        console.log('Skipping database save - missing user info or not submitted');
        console.log('User info details:', { 
          hasUserInfo: !!userInfo, 
          isSubmitted: userInfo?.submitted, 
          contactId: userInfo?.contactId,
          sessionId: userInfo?.sessionId
        });
      }

      // Log the response being returned
      console.log(`Returning response with content: "${cleanedResponse.substring(0, 50)}..." and scrollTag: ${scrollTag}`);

      // Return the cleaned response and scroll tag separately
    return new Response(
      JSON.stringify({
        role: "assistant",
          content: cleanedResponse,
          scrollTag: scrollTag
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error: any) {
    console.error('Error in chat API:', error);
      
      // Return a more user-friendly error message
      return new Response(
        JSON.stringify({ 
          role: "assistant",
          content: "I'm having trouble connecting right now. This might be due to a temporary issue with my services. Could you try again in a moment?" 
        }),
        { 
          status: 200, // Return 200 with error message instead of 500
          headers: { 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (error: any) {
    console.error('Error in chat API:', error);
    
    // Return a more user-friendly error message
    return new Response(
      JSON.stringify({ 
        role: "assistant",
        content: "I'm having trouble connecting right now. This might be due to a temporary issue with my services. Could you try again in a moment?" 
      }),
      { 
        status: 200, // Return 200 with error message instead of 500
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}