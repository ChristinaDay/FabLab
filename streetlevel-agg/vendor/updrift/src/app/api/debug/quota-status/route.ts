import { NextRequest, NextResponse } from 'next/server';
import { quotaTracker } from '@/lib/quotaTracker';
import { withRateLimit } from '@/lib/rateLimiter';

async function getQuotaStatusHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiName = searchParams.get('api');
    
    if (apiName) {
      // Get quota for specific API
      const quota = quotaTracker.getMonthlyQuota(apiName);
      const estimate = quotaTracker.getUsageEstimate(apiName);
      
      return NextResponse.json({
        success: true,
        api: apiName,
        quota,
        estimate
      });
    } else {
      // Get quota for all APIs
      const adzunaQuota = quotaTracker.getMonthlyQuota('adzuna');
      const jsearchQuota = quotaTracker.getMonthlyQuota('jsearch');
      const adzunaEstimate = quotaTracker.getUsageEstimate('adzuna');
      const jsearchEstimate = quotaTracker.getUsageEstimate('jsearch');
      
      return NextResponse.json({
        success: true,
        quotas: {
          adzuna: { quota: adzunaQuota, estimate: adzunaEstimate },
          jsearch: { quota: jsearchQuota, estimate: jsearchEstimate }
        }
      });
    }
  } catch (error) {
    console.error('Error getting quota status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the rate-limited handler
export const GET = withRateLimit('quota-status')(getQuotaStatusHandler); 