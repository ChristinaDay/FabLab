// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  statusCode?: number; // HTTP status code for rate limit exceeded
}

// Rate limit entry for tracking
interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

// Rate limit result
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  message?: string;
}

// Rate limiter class
export class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();
  private blockedRequests: Map<string, number> = new Map(); // Track blocked requests for monitoring

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  // Configure rate limits for different endpoints
  configureRateLimit(endpoint: string, config: RateLimitConfig): void {
    this.configs.set(endpoint, config);
  }

  // Check if request is allowed
  checkRateLimit(identifier: string, endpoint: string): RateLimitResult {
    const config = this.configs.get(endpoint);
    if (!config) {
      return { allowed: true, remaining: -1, resetTime: Date.now() };
    }

    const key = `${identifier}:${endpoint}`;
    const now = Date.now();
    const entry = this.limits.get(key);

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
      this.limits.delete(key);
    }

    // Create new entry if doesn't exist
    if (!entry) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + config.windowMs,
        firstRequest: now
      };
      this.limits.set(key, newEntry);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: newEntry.resetTime,
        message: config.message
      };
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      // Track blocked requests for monitoring
      const blockedKey = `${identifier}:${endpoint}`;
      this.blockedRequests.set(blockedKey, (this.blockedRequests.get(blockedKey) || 0) + 1);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter,
        message: config.message || `Rate limit exceeded. Try again in ${retryAfter} seconds.`
      };
    }

    // Increment count
    entry.count++;
    this.limits.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
      message: config.message
    };
  }

  // Get rate limit info without checking
  getRateLimitInfo(identifier: string, endpoint: string): RateLimitResult {
    const config = this.configs.get(endpoint);
    if (!config) {
      return { allowed: true, remaining: -1, resetTime: Date.now() };
    }

    const key = `${identifier}:${endpoint}`;
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs
      };
    }

    return {
      allowed: entry.count < config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }

  // Reset rate limit for a specific identifier
  resetRateLimit(identifier: string, endpoint: string): void {
    const key = `${identifier}:${endpoint}`;
    this.limits.delete(key);
  }

  // Get all rate limit configurations
  getConfigurations(): Map<string, RateLimitConfig> {
    return new Map(this.configs);
  }

  // Clear all rate limits (useful for testing)
  clearAll(): void {
    this.limits.clear();
    this.blockedRequests.clear();
  }

  // Get monitoring data
  getMonitoringData() {
    return {
      activeLimits: this.limits.size,
      blockedRequests: Object.fromEntries(this.blockedRequests),
      configurations: Object.fromEntries(this.configs)
    };
  }

  // Get rate limit statistics for an endpoint
  getEndpointStats(endpoint: string) {
    const stats = {
      totalRequests: 0,
      blockedRequests: 0,
      activeLimits: 0
    };

    // Count active limits for this endpoint
    for (const [key, entry] of Array.from(this.limits.entries())) {
      if (key.includes(`:${endpoint}`)) {
        stats.activeLimits++;
        stats.totalRequests += entry.count;
      }
    }

    // Count blocked requests for this endpoint
    for (const [key, count] of Array.from(this.blockedRequests.entries())) {
      if (key.includes(`:${endpoint}`)) {
        stats.blockedRequests += count;
      }
    }

    return stats;
  }
}

// Default rate limit configurations
export const defaultRateLimits = {
  // Job search - 100 requests per hour
  'jobs-search': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
    message: 'Job search rate limit exceeded. Please try again later.'
  },
  // User preferences - 50 requests per hour
  'user-preferences': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    message: 'Too many preference updates. Please try again later.'
  },
  // Saved jobs - 200 requests per hour
  'saved-jobs': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 200,
    message: 'Too many saved job operations. Please try again later.'
  },
  // Saved searches - 100 requests per hour
  'saved-searches': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
    message: 'Too many saved search operations. Please try again later.'
  },
  // Authentication - 10 requests per minute
  'auth': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many authentication attempts. Please try again later.'
  },
  // API test endpoints - 50 requests per hour
  'api-test': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    message: 'Too many test requests. Please try again later.'
  },
  // Quota status endpoints - 200 requests per hour (for API hub auto-refresh)
  'quota-status': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 200,
    message: 'Too many quota status requests. Please try again later.'
  }
};

// Initialize rate limiter with default configurations
export const rateLimiter = RateLimiter.getInstance();

// Set up default configurations
Object.entries(defaultRateLimits).forEach(([endpoint, config]) => {
  rateLimiter.configureRateLimit(endpoint, config);
});

// Utility function to get client identifier
export function getClientIdentifier(request: Request): string {
  // Try to get user ID from session if available
  // This provides better rate limiting for authenticated users
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.headers.get('x-session-token');
  
  // If we have session info, use user ID for rate limiting
  if (sessionToken) {
    // In a real implementation, you'd decode the session token
    // For now, we'll use the session token as identifier
    return `user:${sessionToken}`;
  }
  
  // Fallback to IP address for unauthenticated users
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

// Rate limit middleware for Next.js API routes
export function withRateLimit(endpoint: string) {
  return function(handler: Function) {
    return async function(request: Request, ...args: any[]) {
      const identifier = getClientIdentifier(request);
      const result = rateLimiter.checkRateLimit(identifier, endpoint);

      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            status: 'error',
            message: result.message,
            error: {
              type: 'RATE_LIMIT_ERROR',
              retryAfter: result.retryAfter,
              resetTime: result.resetTime
            }
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': rateLimiter.getConfigurations().get(endpoint)?.maxRequests.toString() || '0',
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toString(),
              ...(result.retryAfter && { 'Retry-After': result.retryAfter.toString() })
            }
          }
        );
      }

      // Add rate limit headers to successful responses
      const response = await handler(request, ...args);
      
      if (response instanceof Response) {
        response.headers.set('X-RateLimit-Limit', rateLimiter.getConfigurations().get(endpoint)?.maxRequests.toString() || '0');
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
        response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
      }

      return response;
    };
  };
} 