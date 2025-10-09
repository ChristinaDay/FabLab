import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rateLimiter';
import { withRateLimit } from '@/lib/rateLimiter';

async function getRateLimitStatsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    if (endpoint) {
      // Get stats for specific endpoint
      const stats = rateLimiter.getEndpointStats(endpoint);
      return NextResponse.json({
        success: true,
        endpoint,
        stats
      });
    } else {
      // Get overall monitoring data
      const monitoringData = rateLimiter.getMonitoringData();
      return NextResponse.json({
        success: true,
        monitoring: monitoringData
      });
    }
  } catch (error) {
    console.error('Error getting rate limit stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the rate-limited handler
export const GET = withRateLimit('api-test')(getRateLimitStatsHandler); 