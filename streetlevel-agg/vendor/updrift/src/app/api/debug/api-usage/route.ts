import { NextRequest, NextResponse } from 'next/server';
import { apiUsageTracker } from '@/lib/apiUsageTracker';
import { withRateLimit } from '@/lib/rateLimiter';

async function getAPIUsageStatsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiName = searchParams.get('api');
    
    if (apiName) {
      // Get stats for specific API
      const stats = apiUsageTracker.getAPIUsageStats(apiName);
      return NextResponse.json({
        success: true,
        api: apiName,
        stats
      });
    } else {
      // Get stats for all APIs
      const allStats = apiUsageTracker.getAllAPIUsageStats();
      return NextResponse.json({
        success: true,
        stats: allStats
      });
    }
  } catch (error) {
    console.error('Error getting API usage stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the rate-limited handler
export const GET = withRateLimit('api-test')(getAPIUsageStatsHandler); 