// Simple test for rate limiter functionality
// This can be run in the browser console for testing

import { rateLimiter, RateLimiter } from './rateLimiter';

export function testRateLimiter() {
  console.log('🧪 Testing Rate Limiter...');
  
  // Test basic rate limiting
  const testIdentifier = 'test-user-123';
  const testEndpoint = 'jobs-search';
  
  console.log('📊 Testing rate limit for jobs-search endpoint...');
  
  // Simulate multiple requests
  for (let i = 1; i <= 105; i++) {
    const result = rateLimiter.checkRateLimit(testIdentifier, testEndpoint);
    
    if (i <= 100) {
      console.log(`✅ Request ${i}: Allowed (${result.remaining} remaining)`);
    } else {
      console.log(`❌ Request ${i}: Blocked - ${result.message}`);
      console.log(`⏰ Retry after: ${result.retryAfter} seconds`);
      break;
    }
  }
  
  // Test rate limit info
  const info = rateLimiter.getRateLimitInfo(testIdentifier, testEndpoint);
  console.log('📈 Rate limit info:', info);
  
  // Test reset
  rateLimiter.resetRateLimit(testIdentifier, testEndpoint);
  const resetInfo = rateLimiter.getRateLimitInfo(testIdentifier, testEndpoint);
  console.log('🔄 After reset:', resetInfo);
  
  console.log('✅ Rate limiter test completed!');
}

// Make it available globally for browser testing
if (typeof window !== 'undefined') {
  (window as any).testRateLimiter = testRateLimiter;
}

export function testRateLimitConfigurations() {
  console.log('🔧 Testing Rate Limit Configurations...');
  
  const configs = rateLimiter.getConfigurations();
  console.log('📋 Available configurations:');
  
  configs.forEach((config, endpoint) => {
    console.log(`  ${endpoint}: ${config.maxRequests} requests per ${config.windowMs / 1000 / 60} minutes`);
  });
  
  console.log('✅ Configuration test completed!');
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testRateLimiter, testRateLimitConfigurations };
} 