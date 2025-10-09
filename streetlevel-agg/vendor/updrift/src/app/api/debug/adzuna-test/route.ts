import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    
    console.log('🔍 Adzuna credentials check:', {
      hasAppId: !!appId,
      hasAppKey: !!appKey,
      appIdLength: appId?.length || 0,
      appKeyLength: appKey?.length || 0
    });
    
    if (!appId || !appKey) {
      return NextResponse.json({
        error: 'Adzuna API credentials not configured',
        hasAppId: !!appId,
        hasAppKey: !!appKey
      }, { status: 500 });
    }

    // Test a simple search with location
    const url = new URL('https://api.adzuna.com/v1/api/jobs/us/search/1');
    url.searchParams.set('app_id', appId);
    url.searchParams.set('app_key', appKey);
    url.searchParams.set('results_per_page', '10');
    url.searchParams.set('content-type', 'application/json');
    url.searchParams.set('what', 'software');
    url.searchParams.set('where', 'San Francisco');
    
    // Also test with no location to see if that's the issue
    const urlNoLocation = new URL('https://api.adzuna.com/v1/api/jobs/us/search/1');
    urlNoLocation.searchParams.set('app_id', appId);
    urlNoLocation.searchParams.set('app_key', appKey);
    urlNoLocation.searchParams.set('results_per_page', '10');
    urlNoLocation.searchParams.set('content-type', 'application/json');
    urlNoLocation.searchParams.set('what', 'software');
    
    console.log('🔍 Testing Adzuna API URL (with location):', url.toString());
    console.log('🔍 Testing Adzuna API URL (no location):', urlNoLocation.toString());
    
    // Test with location
    const response = await fetch(url.toString());
    console.log('🔍 Adzuna test response status (with location):', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Adzuna API test failed:', errorText);
      return NextResponse.json({
        error: `Adzuna API error: ${response.status} ${response.statusText}`,
        errorText
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('🔍 Adzuna test response (with location):', {
      hasResults: !!data.results,
      resultsLength: data.results?.length || 0,
      totalResults: data.count,
      firstJob: data.results?.[0]?.title || 'No jobs',
      requestId: data.request_id
    });
    
    // Test without location
    const responseNoLocation = await fetch(urlNoLocation.toString());
    const dataNoLocation = await responseNoLocation.json();
    
    console.log('🔍 Adzuna test response (no location):', {
      hasResults: !!dataNoLocation.results,
      resultsLength: dataNoLocation.results?.length || 0,
      totalResults: dataNoLocation.count,
      firstJob: dataNoLocation.results?.[0]?.title || 'No jobs',
      requestId: dataNoLocation.request_id
    });
    
    return NextResponse.json({
      success: true,
      credentials: {
        hasAppId: !!appId,
        hasAppKey: !!appKey
      },
      withLocation: {
        status: response.status,
        hasResults: !!data.results,
        resultsLength: data.results?.length || 0,
        totalResults: data.count,
        firstJob: data.results?.[0]?.title || 'No jobs',
        requestId: data.request_id
      },
      withoutLocation: {
        status: responseNoLocation.status,
        hasResults: !!dataNoLocation.results,
        resultsLength: dataNoLocation.results?.length || 0,
        totalResults: dataNoLocation.count,
        firstJob: dataNoLocation.results?.[0]?.title || 'No jobs',
        requestId: dataNoLocation.request_id
      }
    });
    
  } catch (error) {
    console.error('❌ Adzuna test error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 