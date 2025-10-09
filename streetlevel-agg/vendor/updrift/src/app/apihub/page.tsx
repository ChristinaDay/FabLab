'use client';

import { useAuthSession } from '@/hooks/useAuthSession';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  MagnifyingGlassIcon, 
  BookmarkIcon, 
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  InformationCircleIcon,
  CalendarIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon
} from '@heroicons/react/24/solid';
import Header from '@/components/Header';

// Import quota tracker with error handling
import { quotaTracker } from '@/lib/quotaTracker';
let quotaTrackerInstance = quotaTracker;

interface APIUsage {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastUsed: string;
  rateLimitRemaining?: number;
  rateLimitReset?: string;
}

interface MonthlyQuota {
  apiName: string;
  monthlyLimit: number;
  currentUsage: number;
  remainingQuota: number;
  usagePercentage: number;
  resetDate: Date;
  lastUpdated: Date;
}

interface QuotaEstimate {
  dailyUsage: number;
  weeklyUsage: number;
  monthlyUsage: number;
  estimatedMonthlyTotal: number;
  daysUntilReset: number;
}

interface APIStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  logoUrl?: string;
  description: string;
  usage: APIUsage;
  configStatus: 'configured' | 'missing-key' | 'not-configured';
  features: string[];
  rateLimits?: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  monthlyQuota?: MonthlyQuota;
  quotaEstimate?: QuotaEstimate;
}

export default function APIhubPage() {
  console.log('🚀 APIhubPage component loading...');
  
  const { data: session } = useAuthSession();
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [testData, setTestData] = useState<any>({});
  const [usageData, setUsageData] = useState<any>({});

  useEffect(() => {
    loadAPIStatuses();
    
    // Auto-refresh every 30 seconds to show updated usage
    const interval = setInterval(() => {
      loadAPIStatuses();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAPIStatuses = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading API statuses...');
      
      // Get rate limit information
      const rateLimitResponse = await fetch('/api/debug/rate-limits');
      console.log('📊 Rate limit response status:', rateLimitResponse.status);
      const rateLimitData = rateLimitResponse.ok ? await rateLimitResponse.json() : {};
      console.log('📊 Rate limit data:', rateLimitData);
      
      // Get API test results
      const testResponse = await fetch('/api/jobs/test');
      console.log('🧪 Test response status:', testResponse.status);
      const testData = testResponse.ok ? await testResponse.json() : {};
      console.log('🧪 Test data:', testData);
      setTestData(testData);

      // Get real usage statistics
      const usageResponse = await fetch('/api/debug/api-usage');
      console.log('📈 Usage response status:', usageResponse.status);
      const usageData = usageResponse.ok ? await usageResponse.json() : {};
      console.log('📈 Usage data:', usageData);
      setUsageData(usageData);

      // Get quota information from server
      const quotaResponse = await fetch('/api/debug/quota-status');
      const quotaData = quotaResponse.ok ? await quotaResponse.json() : {};
      console.log('📈 Quota data from server:', quotaData);
      
      const adzunaQuota = quotaData.quotas?.adzuna?.quota;
      const jsearchQuota = quotaData.quotas?.jsearch?.quota;
      const adzunaEstimate = quotaData.quotas?.adzuna?.estimate;
      const jsearchEstimate = quotaData.quotas?.jsearch?.estimate;

      // Update last updated timestamp
      setLastUpdated(new Date().toLocaleTimeString());

      const statuses: APIStatus[] = [
        {
          id: 'adzuna',
          name: 'Adzuna',
          status: testData.apis?.adzuna?.status === 'success' ? 'active' : 'error',
          logoUrl: '/logos/Adzuna.png',
          description: 'Comprehensive job search API with detailed job information, salary data, and company details.',
          usage: {
            totalRequests: usageData.stats?.adzuna?.totalRequests || 0,
            successfulRequests: usageData.stats?.adzuna?.successfulRequests || 0,
            failedRequests: usageData.stats?.adzuna?.failedRequests || 0,
            averageResponseTime: usageData.stats?.adzuna?.averageResponseTime || 0,
            lastUsed: usageData.stats?.adzuna?.lastUsed || 'Never',
            rateLimitRemaining: rateLimitData.adzuna?.remaining,
            rateLimitReset: rateLimitData.adzuna?.resetTime
          },
          configStatus: testData.apis?.adzuna?.configured ? 'configured' : 'missing-key',
          features: [
            'Job search with location filtering',
            'Salary information',
            'Company details and logos',
            'Remote job filtering',
            'Job descriptions and requirements'
          ],
          rateLimits: {
            requestsPerMinute: 60,
            requestsPerHour: 1000,
            requestsPerDay: 10000
          },
          monthlyQuota: adzunaQuota,
          quotaEstimate: adzunaEstimate
        },
        {
          id: 'jsearch',
          name: 'JSearch',
          status: testData.apis?.jsearch?.status === 'success' ? 'active' : 
                  testData.apis?.jsearch?.status === 'quota-exceeded' ? 'error' : 'error',
          logoUrl: '/logos/jsearch-rapidapi.jpeg',
          description: 'RapidAPI-powered job search with real-time job listings and comprehensive search capabilities.',
          usage: {
            totalRequests: usageData.stats?.jsearch?.totalRequests || 0,
            successfulRequests: usageData.stats?.jsearch?.successfulRequests || 0,
            failedRequests: usageData.stats?.jsearch?.failedRequests || 0,
            averageResponseTime: usageData.stats?.jsearch?.averageResponseTime || 0,
            lastUsed: usageData.stats?.jsearch?.lastUsed || 'Never',
            rateLimitRemaining: rateLimitData.jsearch?.remaining,
            rateLimitReset: rateLimitData.jsearch?.resetTime
          },
          configStatus: testData.apis?.jsearch?.configured ? 'configured' : 'missing-key',
          features: [
            'Real-time job listings',
            'Advanced search filters',
            'Job categorization',
            'Company information',
            'Application tracking'
          ],
          rateLimits: {
            requestsPerMinute: 30,
            requestsPerHour: 500,
            requestsPerDay: 5000
          },
          monthlyQuota: jsearchQuota,
          quotaEstimate: jsearchEstimate
        }
      ];

      console.log('✅ API statuses loaded:', statuses);
      setApiStatuses(statuses);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error('❌ Error loading API statuses:', error);
      // Set some default statuses if there's an error
      setApiStatuses([
        {
          id: 'adzuna',
          name: 'Adzuna',
          status: 'error',
          logoUrl: '/logos/Adzuna.png',
          description: 'Comprehensive job search API with detailed job information, salary data, and company details.',
          usage: {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastUsed: 'Never'
          },
          configStatus: 'not-configured',
          features: [
            'Job search with location filtering',
            'Salary information',
            'Company details and logos',
            'Remote job filtering',
            'Job descriptions and requirements'
          ],
          rateLimits: {
            requestsPerMinute: 60,
            requestsPerHour: 1000,
            requestsPerDay: 10000
          }
        },
        {
          id: 'jsearch',
          name: 'JSearch',
          status: 'error',
          logoUrl: '/logos/jsearch-rapidapi.jpeg',
          description: 'RapidAPI-powered job search with real-time job listings and comprehensive search capabilities.',
          usage: {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastUsed: 'Never'
          },
          configStatus: 'not-configured',
          features: [
            'Real-time job listings',
            'Advanced search filters',
            'Job categorization',
            'Company information',
            'Application tracking'
          ],
          rateLimits: {
            requestsPerMinute: 30,
            requestsPerHour: 500,
            requestsPerDay: 5000
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleSolidIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleSolidIcon className="h-5 w-5 text-red-500" />;
      case 'inactive':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'testing':
        return <CogIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'error':
        return 'Error';
      case 'inactive':
        return 'Inactive';
      case 'testing':
        return 'Testing';
      default:
        return 'Unknown';
    }
  };

  const getConfigStatusText = (status: string) => {
    switch (status) {
      case 'configured':
        return 'API Key Present';
      case 'missing-key':
        return 'API Key Missing';
      case 'not-configured':
        return 'Not Configured';
      default:
        return 'Unknown';
    }
  };

  const getConfigStatusColor = (status: string) => {
    switch (status) {
      case 'configured':
        return 'text-primary';
      case 'missing-key':
        return 'text-warning';
      case 'not-configured':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getQuotaStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-warning';
    if (percentage >= 50) return 'text-accent';
    return 'text-primary';
  };

  const getQuotaStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <ExclamationTriangleSolidIcon className="h-4 w-4 text-destructive" />;
    if (percentage >= 75) return <ExclamationTriangleIcon className="h-4 w-4 text-warning" />;
    if (percentage >= 50) return <ClockIcon className="h-4 w-4 text-accent" />;
    return <CheckCircleIcon className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
    
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">APIhub</h1>
          <p className="text-lg text-muted-foreground mb-4">All connected job API sources powering your UpDrift search. More sources = better results!</p>
          
          {/* Quota Status Banner */}
          {apiStatuses.some(api => api.monthlyQuota && api.monthlyQuota.usagePercentage >= 75) && (
            <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-warning mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-warning">Monthly Quota Alert</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Some APIs are approaching or have exceeded their monthly limits. This may affect search results.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* API Health Summary */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active APIs</p>
                  <p className="text-2xl font-bold text-foreground">
                    {apiStatuses.filter(api => api.status === 'active').length}
                  </p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quota Issues</p>
                  <p className="text-2xl font-bold text-foreground">
                    {apiStatuses.filter(api => api.monthlyQuota && api.monthlyQuota.usagePercentage >= 75).length}
                  </p>
                </div>
                <ExclamationTriangleIcon className="h-8 w-8 text-warning" />
              </div>
            </div>
            
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total APIs</p>
                  <p className="text-2xl font-bold text-foreground">{apiStatuses.length}</p>
                </div>
                <ServerIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow"
            >
              ← Return to Dashboard
            </Link>
            <div className="flex items-center space-x-4">
              <button 
                onClick={loadAPIStatuses}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    Refresh Status
                  </>
                )}
              </button>
              {lastUpdated && (
                <span className="text-sm text-muted-foreground">
                  Last updated: {lastUpdated}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* API Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {apiStatuses.map((api) => (
            <div key={api.id} className="bg-card rounded-lg shadow border border-border p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {api.logoUrl && (
                    <img 
                      src={api.logoUrl} 
                      alt={`${api.name} logo`} 
                      className="w-12 h-12 rounded bg-muted object-contain" 
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{api.name}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(api.status)}
                      <span className="text-sm font-medium">{getStatusText(api.status)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${getConfigStatusColor(api.configStatus)}`}>
                    {getConfigStatusText(api.configStatus)}
                  </span>
                  {/* Show more detailed status info */}
                  {api.configStatus === 'configured' && api.status === 'error' && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Key present but API failing
                    </div>
                  )}
                  {api.configStatus === 'missing-key' && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Check environment variables
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-4">{api.description}</p>

              {/* Monthly Quota Section */}
              {api.monthlyQuota && (
                <div className={`mb-4 p-4 rounded-lg border ${
                  api.monthlyQuota.usagePercentage >= 90 ? 'bg-destructive/10 border-destructive/20' :
                  api.monthlyQuota.usagePercentage >= 75 ? 'bg-warning/10 border-warning/20' :
                  api.monthlyQuota.usagePercentage >= 50 ? 'bg-accent/10 border-accent/20' :
                  'bg-muted border-border'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-foreground">Monthly Quota</h4>
                    {getQuotaStatusIcon(api.monthlyQuota.usagePercentage)}
                  </div>
                  
                  {/* Quota Status Message */}
                  {api.monthlyQuota && api.monthlyQuota.usagePercentage >= 90 && (
                    <div className="mb-3 p-2 bg-destructive/10 rounded text-xs text-destructive">
                      ⚠️ Monthly quota exceeded! API calls will fail until quota resets.
                    </div>
                  )}
                  {api.monthlyQuota && api.monthlyQuota.usagePercentage >= 75 && api.monthlyQuota.usagePercentage < 90 && (
                    <div className="mb-3 p-2 bg-warning/10 rounded text-xs text-warning">
                      ⚠️ Approaching monthly quota limit. Consider upgrading plan.
                    </div>
                  )}
                  
                  {/* Special message for JSearch quota exceeded */}
                  {api.id === 'jsearch' && testData.apis?.jsearch?.status === 'quota-exceeded' && (
                    <div className="mb-3 p-2 bg-destructive/10 rounded text-xs text-destructive">
                      🚫 JSearch API: Monthly quota exceeded. API calls will fail until quota resets on {api.monthlyQuota?.resetDate ? new Date(api.monthlyQuota.resetDate).toLocaleDateString() : 'unknown date'}.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Used</p>
                      <p className="text-lg font-semibold text-foreground">
                        {api.monthlyQuota.currentUsage} / {api.monthlyQuota.monthlyLimit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className={`text-lg font-semibold ${getQuotaStatusColor(api.monthlyQuota.usagePercentage)}`}>
                        {api.monthlyQuota.remainingQuota}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        api.monthlyQuota.usagePercentage >= 90 ? 'bg-destructive' :
                        api.monthlyQuota.usagePercentage >= 75 ? 'bg-warning' :
                        api.monthlyQuota.usagePercentage >= 50 ? 'bg-accent' :
                        'bg-primary'
                      }`}
                      style={{ width: `${Math.min(api.monthlyQuota.usagePercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.round(api.monthlyQuota.usagePercentage)}% used</span>
                    <span className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Resets {new Date(api.monthlyQuota.resetDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Usage Estimates */}
              {api.quotaEstimate && (
                <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-foreground mb-2">Usage Estimates</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Daily Average</p>
                      <p className="font-medium">{api.quotaEstimate.dailyUsage} requests</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Weekly Total</p>
                      <p className="font-medium">{api.quotaEstimate.weeklyUsage} requests</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Total</p>
                      <p className="font-medium">{api.quotaEstimate.monthlyUsage} requests</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Projected Monthly</p>
                      <p className="font-medium">{api.quotaEstimate.estimatedMonthlyTotal} requests</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Usage Statistics */}
              <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-3">Usage Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">Total Requests</p>
                    <p className="text-lg font-semibold text-foreground">{api.usage.totalRequests}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success Rate</p>
                    <p className="text-lg font-semibold text-foreground">
                      {api.usage.totalRequests > 0 
                        ? `${Math.round((api.usage.successfulRequests / api.usage.totalRequests) * 100)}%`
                        : '0%'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Response Time</p>
                    <p className="text-lg font-semibold text-foreground">{api.usage.averageResponseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Used</p>
                    <p className="text-lg font-semibold text-foreground">{api.usage.lastUsed}</p>
                  </div>
                </div>
                
                {/* Recent Usage Breakdown */}
                {usageData.stats?.[api.id] && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Today</p>
                        <p className="font-medium">{usageData.stats[api.id].todayRequests}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">This Week</p>
                        <p className="font-medium">{usageData.stats[api.id].thisWeekRequests}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">This Month</p>
                        <p className="font-medium">{usageData.stats[api.id].thisMonthRequests}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rate Limits */}
              {api.rateLimits && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Rate Limits</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-muted p-2 rounded">
                      <p className="text-foreground font-medium">{api.rateLimits.requestsPerMinute}/min</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-foreground font-medium">{api.rateLimits.requestsPerHour}/hour</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-foreground font-medium">{api.rateLimits.requestsPerDay}/day</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Features</h4>
                <div className="flex flex-wrap gap-1">
                  {api.features.map((feature, index) => (
                    <span 
                      key={index}
                      className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Debug Info - Show actual test response */}
              {testData.apis?.[api.id] && (
                <div className="p-3 bg-muted/30 rounded text-xs">
                  <h5 className="font-medium text-foreground mb-1">Debug Info:</h5>
                  <div className="space-y-1 text-muted-foreground">
                    <div>Status: {testData.apis[api.id].status}</div>
                    <div>Configured: {testData.apis[api.id].configured ? 'true' : 'false'}</div>
                    <div>Message: {testData.apis[api.id].message}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="bg-card rounded-lg shadow border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">API Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {apiStatuses.filter(api => api.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground">Active APIs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {apiStatuses.reduce((total, api) => total + api.usage.totalRequests, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {apiStatuses.filter(api => api.configStatus === 'configured').length}
              </p>
              <p className="text-sm text-muted-foreground">Configured</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {apiStatuses.filter(api => api.configStatus === 'missing-key').length}
              </p>
              <p className="text-sm text-muted-foreground">Need Setup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 