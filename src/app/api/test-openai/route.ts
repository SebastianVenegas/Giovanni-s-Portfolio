import { Configuration, OpenAIApi } from 'openai-edge';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "OpenAI API key is not configured",
        envVars: Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('KEY')),
      });
    }
    
    // Mask the key for security but show enough to verify
    const maskedKey = apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);
    
    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    
    const openai = new OpenAIApi(configuration);
    
    // Make a simple API call to verify the key works
    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Say "OpenAI API is working correctly!"' }
        ],
        max_tokens: 50,
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        return NextResponse.json({
          success: false,
          error: `OpenAI API error: ${response.status} ${response.statusText}`,
          details: errorData,
          maskedKey,
        });
      }
      
      const result = await response.json();
      return NextResponse.json({
        success: true,
        message: result.choices[0].message.content,
        modelUsed: result.model,
        maskedKey,
      });
    } catch (apiError: any) {
      return NextResponse.json({
        success: false,
        error: apiError.message || "Unknown error calling OpenAI API",
        maskedKey,
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error",
    });
  }
} 