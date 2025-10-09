import { searchCache } from './searchCache';

// Simple test to verify caching functionality
export function testSearchCache() {
  console.log('🧪 Testing search cache functionality...');
  
  // Test 1: Cache should be empty initially
  const initialStats = searchCache.getCacheStats();
  console.log('Initial cache stats:', initialStats);
  
  // Test 2: Should allow API call when cache is empty
  const shouldCall1 = searchCache.shouldMakeApiCall('developer', 'New York', 25);
  console.log('Should make API call (empty cache):', shouldCall1);
  
  // Test 3: Should cache results
  const mockData = {
    status: 'success',
    data: [{ job_id: '1', title: 'Developer' }],
    original_data: [{ job_id: '1', title: 'Developer' }]
  };
  searchCache.setCachedResult('developer', 'New York', 25, mockData);
  
  // Test 4: Should not make API call for cached result
  const shouldCall2 = searchCache.shouldMakeApiCall('developer', 'New York', 25);
  console.log('Should make API call (cached):', shouldCall2);
  
  // Test 5: Should return cached result
  const cachedResult = searchCache.getCachedResult('developer', 'New York', 25);
  console.log('Cached result:', cachedResult);
  
  // Test 6: Cache stats should show 1 entry
  const statsAfterCache = searchCache.getCacheStats();
  console.log('Cache stats after caching:', statsAfterCache);
  
  // Test 7: Should clear cache
  searchCache.clearCache();
  const statsAfterClear = searchCache.getCacheStats();
  console.log('Cache stats after clear:', statsAfterClear);
  
  console.log('✅ Search cache tests completed!');
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Only run in browser environment
  (window as any).testSearchCache = testSearchCache;
} 