import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rateLimiter';

async function testHandler() {
  try {
    // Test Adzuna API
    let adzunaStatus = 'error';
    let adzunaConfigured = false;
    
    if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) {
      adzunaConfigured = true;
      try {
        // Simple test call to Adzuna
        const testUrl = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&results_per_page=1&what=test`;
        const response = await fetch(testUrl);
        if (response.ok) {
          adzunaStatus = 'success';
        }
      } catch (error) {
        console.warn('Adzuna API test failed:', error);
      }
    }

    // Test JSearch API
    let jsearchStatus = 'error';
    let jsearchConfigured = false;
    
    if (process.env.RAPIDAPI_KEY) {
      jsearchConfigured = true;
      try {
        // Simple test call to JSearch
        const testUrl = 'https://jsearch.p.rapidapi.com/search?query=test&num_pages=1';
        const response = await fetch(testUrl, {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
          },
        });
        if (response.ok) {
          jsearchStatus = 'success';
        } else if (response.status === 429) {
          // Quota exceeded - API is configured but hitting limits
          jsearchStatus = 'quota-exceeded';
        }
      } catch (error) {
        console.warn('JSearch API test failed:', error);
      }
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      apis: {
        adzuna: {
          status: adzunaStatus,
          configured: adzunaConfigured,
          message: adzunaConfigured 
            ? (adzunaStatus === 'success' ? 'API working correctly' : 'API test failed')
            : 'API key not configured'
        },
        jsearch: {
          status: jsearchStatus,
          configured: jsearchConfigured,
          message: jsearchConfigured 
            ? (jsearchStatus === 'success' ? 'API working correctly' : 
               jsearchStatus === 'quota-exceeded' ? 'API configured but monthly quota exceeded' : 'API test failed')
            : 'API key not configured'
        }
      }
    });
  } catch (error) {
    console.error('API test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test APIs',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Export the rate-limited handler
export const GET = withRateLimit('api-test')(testHandler); 