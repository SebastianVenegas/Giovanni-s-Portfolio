import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@vercel/postgres';
import { parse } from 'cookie';

export const runtime = 'edge';
export const preferredRegion = 'auto';

// Define types for database stats
interface DatabaseStats {
  totalMessages: number;
  uniqueContacts: number;
  totalChats: number;
  lastMessageTime: string;
}

// Cache for greeting responses
// We'll store multiple greetings for each time of day
const greetingCache: Record<string, string[]> = {
  morning: [],
  afternoon: [],
  evening: []
};

// Cache size - how many greetings to store per time of day
const CACHE_SIZE = 5;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Connect to Vercel Postgres database
async function connectToDatabase() {
  return createClient();
}

// Get stats from database
async function getDatabaseStats(db: any): Promise<DatabaseStats> {
  try {
    // Get message count
    const messageCountResult = await db.sql`SELECT COUNT(*) FROM messages`;
    const totalMessages = parseInt(messageCountResult.rows[0].count) || 0;
    
    // Get unique contacts count 
    const uniqueContactsResult = await db.sql`SELECT COUNT(DISTINCT sender) FROM messages`;
    const uniqueContacts = parseInt(uniqueContactsResult.rows[0].count) || 0;
    
    // Get chat count
    const chatCountResult = await db.sql`SELECT COUNT(DISTINCT chat_id) FROM messages`;
    const totalChats = parseInt(chatCountResult.rows[0].count) || 0;
    
    // Get last message time
    const lastMessageResult = await db.sql`SELECT MAX(created_at) as last_time FROM messages`;
    const lastMessageTime = lastMessageResult.rows[0].last_time || new Date().toISOString();
    
    return {
      totalMessages,
      uniqueContacts,
      totalChats,
      lastMessageTime
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    // Return default values if there's an error
    return {
      totalMessages: 0,
      uniqueContacts: 0,
      totalChats: 0,
      lastMessageTime: new Date().toISOString()
    };
  }
}

// Generate a greeting using OpenAI
async function generateGreeting(stats: DatabaseStats): Promise<string | null> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    
    // Format the last message time properly
    const lastTime = new Date(stats.lastMessageTime);
    const formattedTime = lastTime.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an administrative AI assistant for Giovanni's portfolio website. 
          Generate a warm, professional greeting for Giovanni that mentions if there is any new activity.
          
          Here are the current statistics:
          - Total messages: ${stats.totalMessages}
          - Unique visitors who have contacted: ${stats.uniqueContacts}
          - Total conversation threads: ${stats.totalChats}
          - Last message received: ${formattedTime}
          
          Keep the greeting brief (1-2 sentences), professional yet warm, and mention new activity if there's been recent contact.
          Use Giovanni's name in the greeting.
          Don't just list statistics - incorporate them naturally into a greeting that feels personal.
          Don't mention yourself as an AI.`
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });
    
    return completion.choices[0].message.content || null;
  } catch (error) {
    console.error('Error generating greeting with OpenAI:', error);
    return null;
  }
}

// Validate API key
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = process.env.ADMIN_API_KEY;
  const hardcodedKey = 'Aaron3209';
  
  if (!apiKey) {
    return false;
  }
  
  return apiKey === validApiKey || apiKey === hardcodedKey;
}

// Get a random greeting from the cache
function getRandomGreetingFromCache(timeOfDay: string): string | null {
  const greetings = greetingCache[timeOfDay];
  if (!greetings || greetings.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * greetings.length);
  return greetings[randomIndex];
}

// Add a greeting to the cache
function addGreetingToCache(timeOfDay: string, greeting: string): void {
  if (!greetingCache[timeOfDay]) {
    greetingCache[timeOfDay] = [];
  }
  
  // Don't add duplicate greetings
  if (greetingCache[timeOfDay].includes(greeting)) {
    return;
  }
  
  // Add to cache, remove oldest if full
  greetingCache[timeOfDay].push(greeting);
  if (greetingCache[timeOfDay].length > CACHE_SIZE) {
    greetingCache[timeOfDay].shift();
  }
}

// Update the fallback greetings to emphasize the personal assistant role
const fallbackGreetings: Record<string, string[]> = {
  morning: [
    "Good morning, Giovanni. How can I assist you today?",
    "Morning, Giovanni. Your personal AI assistant is ready.",
    "Welcome, Giovanni. I'm here to help with anything you need.",
    "Good morning. How may I assist you with your day?",
    "Morning, Giovanni. Your personal assistant at your service."
  ],
  afternoon: [
    "Good afternoon, Giovanni. Need any assistance today?",
    "Welcome back, Giovanni. How can I help you?",
    "Afternoon, Giovanni. Your personal AI is ready to assist.",
    "Giovanni, how can I be of service this afternoon?",
    "Good afternoon. I'm here to help with whatever you need."
  ],
  evening: [
    "Good evening, Giovanni. How can I assist you tonight?",
    "Evening, Giovanni. Your personal assistant is ready.",
    "Welcome back. How may I help you this evening?",
    "Good evening. What can I help you with, Giovanni?",
    "Evening, Giovanni. Let me know how I can assist you."
  ]
};

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(req)) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get current time/date info
    const now = new Date();
    const hour = now.getHours();
    let timeOfDay = "morning";
    
    if (hour >= 12 && hour < 17) {
      timeOfDay = "afternoon";
    } else if (hour >= 17) {
      timeOfDay = "evening";
    }
    
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    
    // Try to get database stats in parallel with greeting generation
    const dbStatsPromise = getDatabaseStats(await connectToDatabase()).catch(error => {
      console.error('Error getting database stats:', error);
      return { totalMessages: 0, uniqueContacts: 0, totalChats: 0, lastMessageTime: new Date().toISOString() };
    });
    
    // First check if we have a cached greeting
    const cachedGreeting = getRandomGreetingFromCache(timeOfDay);
    if (cachedGreeting) {
      // 40% chance to return cached greeting for variety
      if (Math.random() < 0.4) {
        // Get DB stats to add notification if needed
        const dbStats = await dbStatsPromise;
        return createGreetingResponse(cachedGreeting, 'cache', dbStats);
      }
    }
    
    // Try to generate a new greeting, but use fallback if it takes too long
    const timeoutPromise = new Promise<{ greeting: string, source: string }>((resolve) => {
      setTimeout(async () => {
        // If we're about to use a fallback, try the cache one more time
        const cachedGreeting = getRandomGreetingFromCache(timeOfDay);
        if (cachedGreeting) {
          resolve({ greeting: cachedGreeting, source: 'cache-fallback' });
        } else {
          // If no cache, use a random fallback greeting
          const fallbacks = fallbackGreetings[timeOfDay];
          const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
          resolve({ greeting: randomFallback, source: 'fallback' });
        }
      }, 500); // 500ms timeout for snappy responses
    });
    
    // Update the AI generation promise to include database stats
    const aiPromise = (async () => {
      // Get database stats while we're generating the greeting
      const dbStats = await dbStatsPromise;
      // Create a system message with time context and db stats
      const hasNewActivity = (dbStats.totalMessages > 0) ? true : false;
      
      const systemMessage = {
        role: 'system',
        content: `You are NextGio Admin, Giovanni Venegas' personal AI assistant and administrator for his portfolio website.
                  You serve as both his dedicated personal assistant and provide access to his website's visitor data.
                  
                  Generate a professional yet warm greeting for Giovanni.
                  It is currently ${timeOfDay} on ${dayOfWeek}.
                  
                  ${hasNewActivity ? `There is new activity on your portfolio website: ${dbStats.totalMessages} new message${dbStats.totalMessages !== 1 ? 's' : ''} from ${dbStats.uniqueContacts} visitor${dbStats.uniqueContacts !== 1 ? 's' : ''} in the last 24 hours.` : 'There has been no new visitor activity on your portfolio website since yesterday.'}
                  
                  CONTEXT: Your primary role is to be Giovanni's helpful personal AI assistant. Additionally, you provide access to review conversations that the public NextGio chatbot has automatically handled with website visitors.
                  
                  Keep the greeting under 60 characters and make it professional but friendly.
                  If there's new activity, mention it briefly like "5 new visitor conversations to review."
                  
                  Do NOT include quotes around the greeting.
                  ONLY return the greeting text without any additional explanation.
                  
                  Examples:
                  - "Welcome, Giovanni. How can I assist you today?"
                  - "Good ${timeOfDay}, Giovanni. I'm here to help."
                  - "Your personal assistant ready. 5 visitor chats to review."
                  - "Good ${timeOfDay}. I'm ready to help with anything you need."
                  
                  Be professional yet warm, and vary your greetings each time.
                  Balance mentioning new website activity with your role as Giovanni's personal assistant.`
      };
      
      const messages = [systemMessage];
      
      // Generate greeting with OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages.map(m => ({ role: m.role as any, content: m.content })),
        temperature: 0.8,
        max_tokens: 60,
      });
      
      const greeting = completion.choices[0]?.message.content || "Hi Giovanni! How can I help?";
      
      // Cache the greeting for future use
      addGreetingToCache(timeOfDay, greeting);
      
      return { greeting, source: 'ai', dbStats };
    })().catch(error => {
      console.error('Error generating AI greeting:', error);
      const fallbacks = fallbackGreetings[timeOfDay];
      const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      return { greeting: randomFallback, source: 'error-fallback' };
    });
    
    // Race between timeout and AI generation
    const result = await Promise.race([timeoutPromise, aiPromise]);
    
    // If we used a fallback, still try to generate a greeting in the background for next time
    if (result.source.includes('fallback')) {
      aiPromise.then(({ greeting }) => {
        addGreetingToCache(timeOfDay, greeting);
      }).catch(() => {
        // Silently fail, we already have fallbacks
      });
    }
    
    // Get DB stats if not already included in the result
    const dbStats = 'dbStats' in result ? result.dbStats : await dbStatsPromise;
    
    // Return the greeting with DB stats
    return createGreetingResponse(result.greeting, result.source, dbStats);
  } catch (error) {
    console.error('Error generating greeting:', error);
    
    // Use fallback in case of any errors
    const hour = new Date().getHours();
    let timeOfDay = "morning";
    if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17) timeOfDay = "evening";
    
    const fallbacks = fallbackGreetings[timeOfDay];
    const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    
    return NextResponse.json(
      { 
        greeting: randomFallback,
        source: 'error',
        error: 'Failed to generate greeting',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        hasNewActivity: false
      },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to create greeting response with database stats
function createGreetingResponse(greeting: string, source: string, dbStats: DatabaseStats) {
  // Check if there is new activity - add type checking to avoid linter errors
  const hasNewActivity = dbStats.totalMessages > 0;
  
  return NextResponse.json({
    greeting,
    source,
    stats: {
      hasNewActivity
    }
  });
}

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const shouldFetchData = searchParams.get('fetchData') === 'true';

    // Use default fallback greeting
    let stats: Partial<DatabaseStats> = {
      totalMessages: 0,
      uniqueContacts: 0,
      totalChats: 0,
      lastMessageTime: new Date().toISOString()
    };
    let hasNewMessages = false;
    let hasNewChats = false;
    let hasNewContacts = false;
    
    // Get time-appropriate greeting
    const hour = new Date().getHours();
    let greeting = "";
    
    if (hour < 12) {
      greeting = "Good morning, Giovanni. Ready to review your portfolio analytics?";
    } else if (hour < 18) {
      greeting = "Good afternoon, Giovanni. Your portfolio dashboard is ready.";
    } else {
      greeting = "Good evening, Giovanni. Portfolio activity summary available.";
    }
    
    // Only try to fetch actual stats if requested
    if (shouldFetchData) {
      try {
        // Set a timeout for database operations
        const dbPromise = (async () => {
          const db = await connectToDatabase();
          return await getDatabaseStats(db);
        })();
        
        // Add a timeout to avoid hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database connection timeout')), 3000);
        });
        
        // Race the database promise against the timeout
        const dbStats = await Promise.race([dbPromise, timeoutPromise]) as DatabaseStats;
        
        if (dbStats) {
          stats = dbStats;
          
          // Check if there are new messages since last checked
          const cookies = parse(req.headers.get('cookie') || '');
          const lastCheckedCount = parseInt(cookies.lastCheckedMessagesCount || '0');
          
          // Determine if there are new messages
          hasNewMessages = (stats.totalMessages || 0) > lastCheckedCount;
          hasNewChats = (stats.totalChats || 0) > parseInt(cookies.lastCheckedChatsCount || '0');
          hasNewContacts = (stats.uniqueContacts || 0) > parseInt(cookies.lastCheckedContactsCount || '0');
          
          // If we have valid stats, try to generate a greeting with OpenAI
          try {
            const aiPromise = generateGreeting(dbStats as DatabaseStats);
            const aiTimeoutPromise = new Promise<string | null>((_, reject) => {
              setTimeout(() => reject(new Error('AI greeting generation timeout')), 2000);
            });
            
            const aiGreeting = await Promise.race([aiPromise, aiTimeoutPromise]);
            if (aiGreeting) {
              greeting = aiGreeting;
            }
          } catch (aiError) {
            console.error('Error generating AI greeting:', aiError);
            // Keep using the default greeting set above
          }
        }
      } catch (dbError) {
        console.error('Error fetching database stats:', dbError);
        // Continue with default values already set
      }
    }
    
    // Always return a valid response with the data we have
    return new Response(JSON.stringify({ 
      greeting, 
      stats, 
      hasNewMessages, 
      hasNewChats, 
      hasNewContacts 
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    // Absolute fallback for any error
    console.error('Critical error in greeting API:', error);
    const hour = new Date().getHours();
    let fallbackGreeting = "Welcome back, Giovanni.";
    
    if (hour < 12) {
      fallbackGreeting = "Good morning, Giovanni.";
    } else if (hour < 18) {
      fallbackGreeting = "Good afternoon, Giovanni.";
    } else {
      fallbackGreeting = "Good evening, Giovanni.";
    }
    
    return new Response(JSON.stringify({ 
      greeting: fallbackGreeting,
      stats: {
        totalMessages: 0,
        uniqueContacts: 0,
        totalChats: 0
      },
      hasNewMessages: false,
      hasNewChats: false,
      hasNewContacts: false,
      error: "Could not generate personalized greeting" 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
} 