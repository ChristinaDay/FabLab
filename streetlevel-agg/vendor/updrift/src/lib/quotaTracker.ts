import { APIQuota } from './api';

export interface MonthlyQuota {
  apiName: string;
  monthlyLimit: number;
  currentUsage: number;
  remainingQuota: number;
  usagePercentage: number;
  resetDate: Date;
  lastUpdated: Date;
}

export interface QuotaEstimate {
  dailyUsage: number;
  weeklyUsage: number;
  monthlyUsage: number;
  estimatedMonthlyTotal: number;
  daysUntilReset: number;
}

class QuotaTracker {
  private static instance: QuotaTracker;
  private monthlyQuotas: Map<string, MonthlyQuota> = new Map();
  private usageHistory: Map<string, Array<{ timestamp: Date; requests: number }>> = new Map();

  static getInstance(): QuotaTracker {
    if (!QuotaTracker.instance) {
      QuotaTracker.instance = new QuotaTracker();
    }
    return QuotaTracker.instance;
  }

  // Initialize known API quotas
  initializeQuotas() {
    // Adzuna API - typically 1000 requests per month
    this.setMonthlyQuota('adzuna', {
      apiName: 'adzuna',
      monthlyLimit: 1000,
      currentUsage: 0,
      remainingQuota: 1000,
      usagePercentage: 0,
      resetDate: this.getNextMonthReset(),
      lastUpdated: new Date()
    });

    // JSearch API - typically 500 requests per month (RapidAPI)
    this.setMonthlyQuota('jsearch', {
      apiName: 'jsearch',
      monthlyLimit: 500,
      currentUsage: 0,
      remainingQuota: 500,
      usagePercentage: 0,
      resetDate: this.getNextMonthReset(),
      lastUpdated: new Date()
    });
  }

  private getNextMonthReset(): Date {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth;
  }

  setMonthlyQuota(apiName: string, quota: MonthlyQuota) {
    this.monthlyQuotas.set(apiName, quota);
  }

  getMonthlyQuota(apiName: string): MonthlyQuota | undefined {
    return this.monthlyQuotas.get(apiName);
  }

  getAllMonthlyQuotas(): MonthlyQuota[] {
    return Array.from(this.monthlyQuotas.values());
  }

  // Record API usage
  recordUsage(apiName: string, requests: number = 1) {
    const quota = this.monthlyQuotas.get(apiName);
    if (quota) {
      quota.currentUsage += requests;
      quota.remainingQuota = Math.max(0, quota.monthlyLimit - quota.currentUsage);
      quota.usagePercentage = (quota.currentUsage / quota.monthlyLimit) * 100;
      quota.lastUpdated = new Date();
    }

    // Record in usage history
    if (!this.usageHistory.has(apiName)) {
      this.usageHistory.set(apiName, []);
    }
    this.usageHistory.get(apiName)!.push({
      timestamp: new Date(),
      requests
    });

    // Clean up old history (keep last 30 days)
    this.cleanupOldHistory(apiName);
  }

  private cleanupOldHistory(apiName: string) {
    const history = this.usageHistory.get(apiName);
    if (history) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const filteredHistory = history.filter(entry => entry.timestamp > thirtyDaysAgo);
      this.usageHistory.set(apiName, filteredHistory);
    }
  }

  // Get usage estimates
  getUsageEstimate(apiName: string): QuotaEstimate {
    const history = this.usageHistory.get(apiName) || [];
    const now = new Date();
    
    // Calculate daily usage (last 7 days average)
    const last7Days = history.filter(entry => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return entry.timestamp > sevenDaysAgo;
    });
    
    const dailyUsage = last7Days.length > 0 
      ? last7Days.reduce((sum, entry) => sum + entry.requests, 0) / 7 
      : 0;

    // Calculate weekly usage
    const lastWeek = history.filter(entry => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entry.timestamp > weekAgo;
    });
    
    const weeklyUsage = lastWeek.reduce((sum, entry) => sum + entry.requests, 0);

    // Calculate monthly usage
    const lastMonth = history.filter(entry => {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return entry.timestamp > monthAgo;
    });
    
    const monthlyUsage = lastMonth.reduce((sum, entry) => sum + entry.requests, 0);

    // Estimate monthly total based on current daily average
    const estimatedMonthlyTotal = dailyUsage * 30;

    // Calculate days until reset
    const quota = this.monthlyQuotas.get(apiName);
    const daysUntilReset = quota 
      ? Math.ceil((quota.resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      dailyUsage: Math.round(dailyUsage * 100) / 100,
      weeklyUsage,
      monthlyUsage,
      estimatedMonthlyTotal: Math.round(estimatedMonthlyTotal),
      daysUntilReset
    };
  }

  // Update quota from API response
  updateFromAPIResponse(apiName: string, apiQuota?: APIQuota) {
    const quota = this.monthlyQuotas.get(apiName);
    if (quota && apiQuota) {
      // If we get actual quota info from API, update our tracking
      if (apiQuota.remaining >= 0) {
        quota.remainingQuota = apiQuota.remaining;
        quota.currentUsage = apiQuota.limit - apiQuota.remaining;
        quota.usagePercentage = apiQuota.usagePercentage;
      }
      
      if (apiQuota.resetDate) {
        quota.resetDate = apiQuota.resetDate;
      }
      
      quota.lastUpdated = new Date();
    }
  }

  // Get quota status for display
  getQuotaStatus(apiName: string) {
    const quota = this.monthlyQuotas.get(apiName);
    const estimate = this.getUsageEstimate(apiName);
    
    if (!quota) {
      return {
        status: 'unknown',
        message: 'No quota information available',
        remaining: 0,
        usagePercentage: 0,
        estimate
      };
    }

    let status = 'good';
    let message = '';

    if (quota.usagePercentage >= 90) {
      status = 'critical';
      message = 'Quota nearly exhausted';
    } else if (quota.usagePercentage >= 75) {
      status = 'warning';
      message = 'High usage - monitor closely';
    } else if (quota.usagePercentage >= 50) {
      status = 'moderate';
      message = 'Moderate usage';
    } else {
      status = 'good';
      message = 'Low usage';
    }

    return {
      status,
      message,
      remaining: quota.remainingQuota,
      usagePercentage: quota.usagePercentage,
      estimate,
      resetDate: quota.resetDate
    };
  }

  // Reset monthly quotas (called when month changes)
  resetMonthlyQuotas() {
    for (const [apiName, quota] of Array.from(this.monthlyQuotas.entries())) {
      quota.currentUsage = 0;
      quota.remainingQuota = quota.monthlyLimit;
      quota.usagePercentage = 0;
      quota.resetDate = this.getNextMonthReset();
      quota.lastUpdated = new Date();
    }
  }
}

export const quotaTracker = QuotaTracker.getInstance();

// Initialize quotas on module load
quotaTracker.initializeQuotas(); 