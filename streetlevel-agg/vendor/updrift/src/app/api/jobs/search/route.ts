import { NextRequest, NextResponse } from 'next/server';
import { searchJobs } from '@/lib/api';
import { errorHandler, errorUtils } from '@/lib/errorHandling';
import { withRateLimit } from '@/lib/rateLimiter';

const searchHandler = async (request: NextRequest) => {
  return errorUtils.withRetry(
    async () => {
      const { searchParams } = new URL(request.url);
      
      // Extract search parameters
      const query = searchParams.get('query') || '';
      const location = searchParams.get('location') || '';
      const radius = parseInt(searchParams.get('radius') || '25'); // Default 25 mile radius
      const remote_jobs_only = searchParams.get('remote_jobs_only') === 'true';
      const employment_types = searchParams.get('employment_types')?.split(',') || [];
      const salary_min = searchParams.get('salary_min');
      const salary_max = searchParams.get('salary_max');
      const date_posted = searchParams.get('date_posted');
      const page = parseInt(searchParams.get('page') || '1');
      const num_pages = parseInt(searchParams.get('num_pages') || '1');
      const excludeJobId = searchParams.get('excludeJobId') || ''; // New parameter to exclude current job

      console.log('🔍 Job search request:', { query, location, radius, remote_jobs_only, page, excludeJobId });

      // Use the new Adzuna API implementation
      console.log('🔍 Calling searchJobs function...');
      const searchResults = await searchJobs({
        query,
        location,
        radius,
        remote_jobs_only,
        employment_types,
        salary_min: salary_min ? parseInt(salary_min) : undefined,
        salary_max: salary_max ? parseInt(salary_max) : undefined,
        date_posted: date_posted || undefined,
        page,
        num_pages,
        excludeJobId, // Pass the excludeJobId parameter
      });
      console.log('🔍 searchJobs function completed');

      console.log('✅ Job search successful:', searchResults.data?.length || 0, 'jobs found');
      console.log('🔍 Search results structure:', {
        status: searchResults.status,
        dataLength: searchResults.data?.length || 0,
        originalDataLength: searchResults.original_data?.length || 0,
        totalCount: searchResults.total_count,
        firstJob: searchResults.data?.[0]?.job_title || 'No jobs'
      });
      
      return NextResponse.json(searchResults);
    },
    3, // maxRetries
    {
      endpoint: 'jobs-search',
      params: Object.fromEntries(new URL(request.url).searchParams)
    }
  ).catch(error => {
    const errorResponse = errorHandler.parseError(error, {
      endpoint: 'jobs-search',
      params: Object.fromEntries(new URL(request.url).searchParams)
    });
    
    errorHandler.logError(errorResponse);
    
    return NextResponse.json(
      errorUtils.createApiErrorResponse(errorResponse),
      { status: errorResponse.type === 'AUTHENTICATION_ERROR' ? 401 : 500 }
    );
  });
};

// Export the rate-limited handler
export const GET = withRateLimit('jobs-search')(searchHandler); 