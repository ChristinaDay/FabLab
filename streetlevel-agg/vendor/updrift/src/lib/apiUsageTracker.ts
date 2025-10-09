interface APIUsageRecord {
  timestamp: Date;
  apiName: string;
  success: boolean;
  responseTime: number;
  errorMessage?: string;
}

interface APIUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastUsed: string;
  todayRequests: number;
  thisWeekRequests: number;
  thisMonthRequests: number;
}

class APIUsageTracker {
  private static instance: APIUsageTracker;
  private usageHistory: APIUsageRecord[] = [];
  private readonly MAX_HISTORY_SIZE = 10000; // Keep last 10k records

  static getInstance(): APIUsageTracker {
    if (!APIUsageTracker.instance) {
      APIUsageTracker.instance = new APIUsageTracker();
    }
    return APIUsageTracker.instance;
  }

  // Record an API call
  recordAPICall(apiName: string, success: boolean, responseTime: number, errorMessage?: string): void {
    const record: APIUsageRecord = {
      timestamp: new Date(),
      apiName,
      success,
      responseTime,
      errorMessage
    };

    this.usageHistory.push(record);

    // Clean up old records if we exceed the limit
    if (this.usageHistory.length > this.MAX_HISTORY_SIZE) {
      this.usageHistory = this.usageHistory.slice(-this.MAX_HISTORY_SIZE);
    }
  }

  // Get usage statistics for a specific API
  getAPIUsageStats(apiName: string): APIUsageStats {
    const apiRecords = this.usageHistory.filter(record => record.apiName === apiName);
    
    if (apiRecords.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        lastUsed: 'Never',
        todayRequests: 0,
        thisWeekRequests: 0,
        thisMonthRequests: 0
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const successfulRequests = apiRecords.filter(record => record.success).length;
    const failedRequests = apiRecords.filter(record => !record.success).length;
    const totalResponseTime = apiRecords.reduce((sum, record) => sum + record.responseTime, 0);
    const averageResponseTime = totalResponseTime / apiRecords.length;

    const todayRecords = apiRecords.filter(record => record.timestamp >= today);
    const weekRecords = apiRecords.filter(record => record.timestamp >= weekAgo);
    const monthRecords = apiRecords.filter(record => record.timestamp >= monthAgo);

    const lastUsed = apiRecords.length > 0 
      ? apiRecords[apiRecords.length - 1].timestamp.toLocaleString()
      : 'Never';

    return {
      totalRequests: apiRecords.length,
      successfulRequests,
      failedRequests,
      averageResponseTime: Math.round(averageResponseTime),
      lastUsed,
      todayRequests: todayRecords.length,
      thisWeekRequests: weekRecords.length,
      thisMonthRequests: monthRecords.length
    };
  }

  // Get usage statistics for all APIs
  getAllAPIUsageStats(): Record<string, APIUsageStats> {
    const apiNames = Array.from(new Set(this.usageHistory.map(record => record.apiName)));
    const stats: Record<string, APIUsageStats> = {};

    apiNames.forEach(apiName => {
      stats[apiName] = this.getAPIUsageStats(apiName);
    });

    return stats;
  }

  // Clear old records (older than 30 days)
  cleanupOldRecords(): void {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.usageHistory = this.usageHistory.filter(record => record.timestamp > thirtyDaysAgo);
  }

  // Get recent errors for an API
  getRecentErrors(apiName: string, hours: number = 24): APIUsageRecord[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.usageHistory
      .filter(record => record.apiName === apiName && !record.success && record.timestamp > cutoff)
      .slice(-10); // Last 10 errors
  }
}

export const apiUsageTracker = APIUsageTracker.getInstance();

// Helper function to track API calls
export function trackAPICall(apiName: string, success: boolean, responseTime: number, errorMessage?: string): void {
  apiUsageTracker.recordAPICall(apiName, success, responseTime, errorMessage);
} 