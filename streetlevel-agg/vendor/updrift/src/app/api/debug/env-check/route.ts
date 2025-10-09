import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables without exposing sensitive values
    const envCheck = {
      // API credentials
      hasAdzunaAppId: !!process.env.ADZUNA_APP_ID,
      hasAdzunaAppKey: !!process.env.ADZUNA_APP_KEY,
      hasJSearchApiKey: !!process.env.JSEARCH_API_KEY,
      hasRapidApiKey: !!process.env.RAPIDAPI_KEY,
      
      // Database
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      
      // Auth
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      
      // Other
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      
      // Length checks (to verify they're not empty strings)
      adzunaAppIdLength: process.env.ADZUNA_APP_ID?.length || 0,
      adzunaAppKeyLength: process.env.ADZUNA_APP_KEY?.length || 0,
      jsearchApiKeyLength: process.env.JSEARCH_API_KEY?.length || 0,
      rapidApiKeyLength: process.env.RAPIDAPI_KEY?.length || 0,
    };
    
    console.log('🔍 Environment check:', envCheck);
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Environment check error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 