import { useState, useEffect, useCallback } from 'react';
import { Job } from '@/types/job';
import { searchCache, debounce } from './searchCache';
import { errorHandler } from './errorHandling';
import { formatTimestamp } from '@/lib/utils';

interface UseSearchJobsReturn {
  jobs: Job[];
  filteredJobs: Job[];
  loading: boolean;
  dataSource: 'loading' | 'real' | 'mock' | 'error';
  locationFilterResults: {
    applied: boolean;
    originalCount: number;
    filteredCount: number;
  } | null;
  searchJobs: (query: string, location: string, radius: number) => void;
  loadMoreJobs: () => Promise<void>;
  hasMorePages: boolean;
  totalCount: number;
  clearCache: () => void;
  cacheStats: { size: number; keys: string[] };
  isUserIdle: boolean;
  currentCacheEntry: { timestamp: number; searchParams: string } | null;
  allCacheEntries: { timestamp: number; searchParams: string; formattedTime: string }[];
}

export function useSearchJobs(): UseSearchJobsReturn {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'loading' | 'real' | 'mock' | 'error'>('loading');
  const [locationFilterResults, setLocationFilterResults] = useState<{
    applied: boolean;
    originalCount: number;
    filteredCount: number;
  } | null>(null);
  const [lastSearchParams, setLastSearchParams] = useState<{
    query: string;
    location: string;
    radius: number;
  } | null>(null);
  const [currentCacheEntry, setCurrentCacheEntry] = useState<{ timestamp: number; searchParams: string } | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMorePages, setHasMorePages] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Track user activity
  useEffect(() => {
    const handleUserActivity = () => {
      searchCache.recordUserActivity();
    };

    // Track various user activities
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Record initial activity
    handleUserActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, []);

  const searchJobs = useCallback(async (query: string, location: string, radius: number) => {
    // Don't search if both query and location are empty
    if (!query && !location) {
      setJobs([]);
      setFilteredJobs([]);
      setLoading(false);
      setLastSearchParams(null);
      return;
    }

    // Reset pagination for new searches
    setCurrentPage(1);
    setHasMorePages(false);

    // Normalize location text for consistent caching
    const normalizedLocation = location.trim();
    console.log(`🔍 Search called with location: "${location}" → normalized: "${normalizedLocation}"`);

    // Check if this is the same search as before
    const isSameSearch = lastSearchParams && 
      lastSearchParams.query === query && 
      lastSearchParams.location === normalizedLocation && 
      lastSearchParams.radius === radius;

    // Check cache first
    const cachedResult = searchCache.getCachedResult(query, normalizedLocation, radius);
    const cacheEntry = searchCache.getCacheEntry(query, normalizedLocation, radius);
    console.log('🔍 Cache check:', {
      hasCachedResult: !!cachedResult,
      cachedJobsLength: cachedResult?.data?.length || 0,
      cachedOriginalLength: cachedResult?.original_data?.length || 0,
      isSameSearch,
      cacheSize: Object.keys(searchCache['cache'] || {}).length
    });
    
    if (cachedResult) {
      const originalJobs = cachedResult.original_data || cachedResult.data || [];
      const filteredJobs = cachedResult.data || [];
      
      console.log('🔍 Using cached result:', {
        originalJobsLength: originalJobs.length,
        filteredJobsLength: filteredJobs.length
      });
      
      setJobs(originalJobs);
      setFilteredJobs(filteredJobs);
      setDataSource(cachedResult.status === 'mock' ? 'mock' : 'real');
      setLocationFilterResults(cachedResult.client_filtered ? {
        applied: true,
        originalCount: cachedResult.original_count || 0,
        filteredCount: cachedResult.filtered_count || 0
      } : null);
      setCurrentCacheEntry(cacheEntry ? { timestamp: cacheEntry.timestamp, searchParams: cacheEntry.searchParams } : null);
      setLoading(false);
      setLastSearchParams({ query, location: normalizedLocation, radius });
      return;
    } else {
      setCurrentCacheEntry(null);
    }

    // Only make API call for new searches, not when user becomes active again
    if (isSameSearch) {
      console.log('🔄 Same search detected - using cached results without API call');
      return;
    }

    // Check if we should make an API call
    if (!searchCache.shouldMakeApiCall(query, normalizedLocation, radius)) {
      console.log('🚫 API call blocked by throttling or cache');
      return;
    }

    setLoading(true);
    try {
      // Build API URL with parameters
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (normalizedLocation) params.append('location', normalizedLocation);
      if (normalizedLocation && radius) params.append('radius', radius.toString());
      params.append('page', '1'); // Always start with page 1 for new searches
      
      console.log('🔍 Fetching jobs with params:', params.toString());
      
      const response = await fetch(`/api/jobs/search?${params.toString()}`);
      const data = await response.json();
      
      console.log('📊 API Response:', data.status, data.data?.length || 0, 'jobs');
      
      // Record the API call
      searchCache.recordApiCall(query, normalizedLocation, radius);
      
      // Cache the result
      searchCache.setCachedResult(query, normalizedLocation, radius, data);
      
      // Store in database for persistence
      try {
        await fetch('/api/user/search-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query,
            location: normalizedLocation,
            radius,
            jobResults: JSON.stringify(data)
          })
        });
      } catch (dbError) {
        console.error('Failed to store search results in database:', dbError);
        // Continue without database storage - in-memory cache still works
      }
      
      // Set current cache entry for the newly cached result
      const newCacheEntry = searchCache.getCacheEntry(query, normalizedLocation, radius);
      setCurrentCacheEntry(newCacheEntry ? { timestamp: newCacheEntry.timestamp, searchParams: newCacheEntry.searchParams } : null);
      
      // Record the search parameters
      setLastSearchParams({ query, location: normalizedLocation, radius });
      
      if (data.status === 'mock') {
        console.log('🚨 Using mock data - configure RAPIDAPI_KEY for real jobs');
        setDataSource('mock');
      } else if (data.status === 'success') {
        console.log('✅ Using real job data from JSearch API');
        setDataSource('real');
      } else {
        console.log('⚠️ API error, using fallback data');
        setDataSource('error');
      }
      
      // Store original and filtered jobs
      const originalJobs = data.original_data || data.data || [];
      const filteredJobs = data.data || [];
      
      console.log('🔍 useSearchJobs - Setting jobs:', {
        originalJobsLength: originalJobs.length,
        filteredJobsLength: filteredJobs.length,
        totalCount: data.total_count || 0,
        firstJob: originalJobs[0]?.job_title || 'No jobs'
      });
      
      setJobs(originalJobs);
      setFilteredJobs(filteredJobs);
      setTotalCount(data.total_count || 0); // Update totalCount
      
      // Check if there are more jobs available from the API
      const totalAvailable = data.total_count || 0;
      const jobsLoaded = (data.original_data || data.data || []).length;
      const hasMoreAvailable = totalAvailable > jobsLoaded;
      setHasMorePages(hasMoreAvailable);
      
      // Reset pagination for new search
      setCurrentPage(1);

      // Track location filtering results
      if (data.client_filtered) {
        setLocationFilterResults({
          applied: true,
          originalCount: data.original_count || 0,
          filteredCount: data.filtered_count || 0
        });
      } else {
        setLocationFilterResults(null);
      }
    } catch (error) {
      const errorResponse = errorHandler.parseError(error, {
        endpoint: 'useSearchJobs',
        params: { query, location, radius }
      });
      
      errorHandler.logError(errorResponse);
      
      console.error('❌ Error loading jobs:', errorResponse.userMessage);
      setDataSource('error');
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more jobs function - loads ALL remaining jobs
  const loadMoreJobs = useCallback(async () => {
    if (!lastSearchParams || !hasMorePages || loadingMore) {
      return;
    }

    setLoadingMore(true);
    try {
      // Calculate how many jobs we've already loaded
      const jobsLoaded = filteredJobs.length;
      const totalAvailable = totalCount;
      const remainingJobs = totalAvailable - jobsLoaded;
      
      // Calculate how many pages we need to load to get all remaining jobs
      const jobsPerPage = 200; // Match the API's results_per_page setting
      const pagesNeeded = Math.ceil(remainingJobs / jobsPerPage);
      
      console.log(`🔍 Loading ALL remaining jobs: ${remainingJobs} jobs across ${pagesNeeded} pages`);
      
      let allNewJobs: Job[] = [];
      
      // Load all remaining pages
      for (let page = 2; page <= pagesNeeded + 1; page++) {
        const params = new URLSearchParams();
        if (lastSearchParams.query) params.append('query', lastSearchParams.query);
        if (lastSearchParams.location) params.append('location', lastSearchParams.location);
        if (lastSearchParams.radius) params.append('radius', lastSearchParams.radius.toString());
        params.append('page', page.toString());
        
        console.log(`🔍 Loading page ${page} of ${pagesNeeded + 1}`);
        
        const response = await fetch(`/api/jobs/search?${params.toString()}`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data?.length > 0) {
          allNewJobs = [...allNewJobs, ...(data.original_data || data.data || [])];
          console.log(`✅ Loaded page ${page}: ${data.data.length} jobs`);
        } else {
          console.log(`📄 No more jobs on page ${page}`);
          break;
        }
      }
      
      if (allNewJobs.length > 0) {
        // Add all new jobs to existing ones
        setJobs(prev => [...prev, ...allNewJobs]);
        setFilteredJobs(prev => [...prev, ...allNewJobs]);
        setCurrentPage(1); // Reset to first page after loading all jobs
        setHasMorePages(false); // No more pages after loading all
        console.log(`✅ Loaded ALL remaining jobs: ${allNewJobs.length} total new jobs`);
      } else {
        setHasMorePages(false);
        console.log('📄 No more jobs available');
      }
    } catch (error) {
      console.error('❌ Error loading more jobs:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [lastSearchParams, hasMorePages, loadingMore, filteredJobs.length, totalCount]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string, location: string, radius: number) => {
      await searchJobs(query, location, radius);
    }, 300),
    [searchJobs]
  );

  const clearCache = useCallback(() => {
    searchCache.clearCache();
    setCurrentCacheEntry(null);
  }, []);

  const cacheStats = searchCache.getCacheStats();

  const allCacheEntries = searchCache.getAllCacheEntries().map(entry => ({
    timestamp: entry.timestamp,
    searchParams: entry.searchParams,
    formattedTime: formatTimestamp(entry.timestamp)
  }));

  return {
    jobs,
    filteredJobs,
    loading,
    dataSource,
    locationFilterResults,
    searchJobs: debouncedSearch,
    loadMoreJobs,
    hasMorePages,
    totalCount,
    clearCache,
    cacheStats,
    isUserIdle: searchCache.isUserIdle(),
    currentCacheEntry,
    allCacheEntries
  };
} 