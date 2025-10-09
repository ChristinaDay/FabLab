import axios from 'axios';
import { Job, JobSearchParams, JobSearchResponse } from '@/types/job';
import { searchAllProviders } from './apihub';
import { errorHandler, errorUtils, ErrorType } from './errorHandling';

// Import quota tracker for usage recording
import { quotaTracker } from './quotaTracker';
import { trackAPICall } from './apiUsageTracker';
import { getCompanyLogoUrl } from '@/utils/jobUtils';
import { parseCompositeJobId } from './jobStorage';

// Adzuna API Configuration (much better than JSearch!)
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs';
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || '';
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || '';

// Create axios instance for Adzuna API
const adzunaClient = axios.create({
  baseURL: ADZUNA_BASE_URL,
  timeout: 10000,
});

/**
 * Convert Adzuna job format to our Job interface
 * Note: Adzuna API does not provide logo URLs - logos are generated via getCompanyLogoUrl()
 */
function convertAdzunaJob(adzunaJob: any): Job {
  const employerName = adzunaJob.company?.display_name || '';
  const employerWebsite = adzunaJob.company?.url || undefined;

  return {
    job_id: adzunaJob.id?.toString() || '',
    job_title: adzunaJob.title || '',
    job_description: adzunaJob.description || '',
    job_apply_link: adzunaJob.redirect_url || '',
    job_city: adzunaJob.location?.display_name?.split(',')[0]?.trim() || '',
    job_state: adzunaJob.location?.area?.[1] || '',
    job_country: adzunaJob.location?.area?.[0] || 'US',
    job_employment_type: adzunaJob.contract_type || 'FULLTIME',
    job_is_remote: adzunaJob.location?.display_name?.toLowerCase().includes('remote') || false,
    job_posted_at_timestamp: adzunaJob.created ? new Date(adzunaJob.created).getTime() / 1000 : 0,
    job_posted_at_datetime_utc: adzunaJob.created || '',
    job_min_salary: adzunaJob.salary_min || undefined,
    job_max_salary: adzunaJob.salary_max || undefined,
    job_salary_currency: 'USD',
    job_salary_period: 'YEAR',
    employer_name: employerName,
    employer_website: employerWebsite,
    job_publisher: 'Adzuna',
    job_apply_is_direct: false,
    // Optional properties
    job_offer_expiration_datetime_utc: undefined,
    job_offer_expiration_timestamp: undefined,
    job_required_experience: undefined,
    job_required_skills: undefined,
    job_required_education: undefined,
    job_benefits: undefined,
    job_google_link: undefined,
    job_naics_code: undefined,
    job_naics_name: undefined,
    job_occupational_categories: undefined,
    job_highlights: undefined,
  };
}

/**
 * Search jobs using all providers (Adzuna, JSearch, etc.)
 */
export async function searchJobs(params: JobSearchParams): Promise<JobSearchResponse> {
  console.log('🔍 searchJobs called with params:', params);
  
  // Aggregate jobs from all providers
  const result = await searchAllProviders(params);
  
  // Filter out the excluded job if specified
  let filteredJobs = result.jobs;
  if (params.excludeJobId) {
    console.log('🔍 Filtering out job ID:', params.excludeJobId);
    console.log('🔍 Jobs before filtering:', result.jobs.length);
    console.log('🔍 Sample job IDs before filtering:', result.jobs.slice(0, 3).map(job => job.job_id));
    
    // Parse composite job ID to get provider and original ID
    const parsed = parseCompositeJobId(params.excludeJobId);
    
    filteredJobs = result.jobs.filter(job => {
      // Check against composite ID
      const jobCompositeId = `${job.job_publisher.toLowerCase()}-${job.job_id}`;
      
      // Also check against original ID and provider match
      const isSameJob = jobCompositeId === params.excludeJobId || 
                       (parsed && job.job_id === parsed.originalId && 
                        job.job_publisher.toLowerCase() === parsed.provider);
      
      return !isSameJob;
    });
    
    console.log('🔍 Jobs after filtering:', filteredJobs.length);
    console.log('🔍 Sample job IDs after filtering:', filteredJobs.slice(0, 3).map(job => job.job_id));
  } else {
    console.log('🔍 No excludeJobId provided, skipping filtering');
  }
  
  console.log('🔍 searchJobs - Final result:', {
    status: 'success',
    jobsCount: filteredJobs.length,
    totalCount: result.totalCount,
    firstJob: filteredJobs[0]?.job_title || 'No jobs'
  });
  
  return {
    status: 'success',
    request_id: 'multi-' + Date.now(),
    parameters: params,
    data: filteredJobs,
    original_data: filteredJobs,
    total_count: result.totalCount, // Use aggregated total count
    num_pages: 1, // For now, pagination is not aggregated
    client_filtered: false,
    original_count: filteredJobs.length,
    filtered_count: filteredJobs.length
  };
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in miles
}

/**
 * Get coordinates for a location using a geocoding service
 */
async function getLocationCoordinates(location: string): Promise<{lat: number, lng: number} | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`);
    
    // Check if response is OK and content type is JSON
    if (!response.ok) {
      console.warn(`Geocoding service returned ${response.status}: ${response.statusText}`);
      return null;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Geocoding service returned non-JSON response, skipping location filtering');
      return null;
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.warn('Error getting location coordinates:', error);
  }
  return null;
}

/**
 * Interface for API quota information
 */
export interface APIQuota {
  remaining: number;
  limit: number;
  resetTime?: string;
  resetDate?: Date;
  usagePercentage: number;
}

/**
 * Enhanced response interface with quota information
 */
export interface JobSearchResponseWithQuota extends JobSearchResponse {
  quota?: {
    adzuna?: APIQuota;
    jsearch?: APIQuota;
  };
}

/**
 * Parse quota information from response headers
 */
function parseQuotaFromHeaders(headers: any, apiName: string): APIQuota | undefined {
  const quota: APIQuota = {
    remaining: -1,
    limit: -1,
    usagePercentage: 0
  };

  // Common header patterns for quota information
  const headerPatterns = {
    remaining: [
      'x-ratelimit-remaining',
      'x-remaining-requests',
      'x-quota-remaining',
      'x-remaining',
      'remaining'
    ],
    limit: [
      'x-ratelimit-limit',
      'x-total-requests',
      'x-quota-limit',
      'x-limit',
      'limit'
    ],
    reset: [
      'x-ratelimit-reset',
      'x-quota-reset',
      'x-reset',
      'reset'
    ]
  };

  // Try to find quota information in headers
  for (const pattern of headerPatterns.remaining) {
    const value = headers[pattern] || headers[pattern.toLowerCase()];
    if (value) {
      quota.remaining = parseInt(value);
      break;
    }
  }

  for (const pattern of headerPatterns.limit) {
    const value = headers[pattern] || headers[pattern.toLowerCase()];
    if (value) {
      quota.limit = parseInt(value);
      break;
    }
  }

  for (const pattern of headerPatterns.reset) {
    const value = headers[pattern] || headers[pattern.toLowerCase()];
    if (value) {
      quota.resetTime = value;
      quota.resetDate = new Date(parseInt(value) * 1000);
      break;
    }
  }

  // Calculate usage percentage
  if (quota.limit > 0 && quota.remaining >= 0) {
    quota.usagePercentage = ((quota.limit - quota.remaining) / quota.limit) * 100;
  }

  // Only return quota if we found some information
  return (quota.remaining >= 0 || quota.limit > 0) ? quota : undefined;
}

/**
 * Search jobs using Adzuna API with quota tracking
 */
export async function searchAdzunaJobs(params: JobSearchParams): Promise<JobSearchResponseWithQuota> {
  const startTime = Date.now();
  let success = false;
  let errorMessage: string | undefined;

  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    
    console.log('🔍 Adzuna API credentials check:', {
      hasAppId: !!appId,
      hasAppKey: !!appKey,
      appIdLength: appId?.length || 0,
      appKeyLength: appKey?.length || 0
    });
    
    if (!appId || !appKey) {
      throw new Error('Adzuna API credentials not configured');
    }

    const url = new URL('https://api.adzuna.com/v1/api/jobs/us/search/1');
    url.searchParams.set('app_id', appId);
    url.searchParams.set('app_key', appKey);
    url.searchParams.set('results_per_page', '200'); // Request more results to get better total count
    
    if (params.query) url.searchParams.set('what', params.query);
    if (params.location) url.searchParams.set('where', params.location);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Adzuna API error details:', errorText);
      throw new Error(`Adzuna API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    success = true;

    // Parse quota information from response headers
    const adzunaQuota = parseQuotaFromHeaders(response.headers, 'adzuna');
    
    // Convert Adzuna jobs to our format
    const convertedJobs = (data.results || []).map(convertAdzunaJob);
    
    // Record API usage for quota tracking
    quotaTracker.recordUsage('adzuna', 1);
    
    // Calculate num_pages based on total results if not provided by API
    const resultsPerPage = 200; // Match our API setting
    const totalResults = data.count || convertedJobs.length;
    const calculatedNumPages = Math.ceil(totalResults / resultsPerPage);
    const numPages = data.num_pages || calculatedNumPages;
    
    return {
      status: 'success',
      request_id: data.request_id || '',
      parameters: params,
      data: convertedJobs,
      original_data: convertedJobs,
      total_count: data.count || convertedJobs.length, // Add total_count field
      num_pages: numPages,
      client_filtered: false,
      original_count: convertedJobs.length,
      filtered_count: convertedJobs.length,
      quota: {
        adzuna: adzunaQuota
      }
    };
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Adzuna API error:', errorMessage);
    throw error;
  } finally {
    const responseTime = Date.now() - startTime;
    trackAPICall('adzuna', success, responseTime, errorMessage);
    
    // Record API usage for quota tracking
    if (success) {
      quotaTracker.recordUsage('adzuna', 1);
      console.log('📊 Adzuna quota updated:', quotaTracker.getMonthlyQuota('adzuna'));
      console.log('📊 Quota tracker instance ID:', quotaTracker);
    }
  }
}

/**
 * Mock job data for development/fallback
 */
async function searchMockJobs(params: JobSearchParams): Promise<JobSearchResponse> {
  const { query, location } = params;
  
  // Get the primary city for location-specific mock data
  const primaryCity = location?.split(',')[0]?.trim() || 'San Francisco';
  const primaryState = location?.includes(',') ? location.split(',')[1]?.trim() : 'CA';
  
  const mockJobs: Job[] = [
    {
      job_id: 'mock-1',
      job_title: 'Senior Software Engineer',
      job_description: 'We are seeking a Senior Software Engineer to join our team...',
      job_apply_link: 'https://example.com/apply/1',
      job_city: primaryCity,
      job_state: primaryState,
      job_country: 'US',
      job_employment_type: 'FULLTIME',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() / 1000,
      job_posted_at_datetime_utc: new Date().toISOString(),
      job_min_salary: 120000,
      job_max_salary: 180000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      employer_name: 'TechCorp Innovation',
      // employer_logo: 'https://example.com/logo1.png', // Uncomment if you want a real logo for this mock job
      employer_website: 'https://techcorp.com',
      job_publisher: 'Mock Data',
      job_apply_is_direct: false,
    },
    {
      job_id: 'mock-2',
      job_title: 'DevOps Engineer',
      job_description: 'Join our DevOps team and help build scalable infrastructure...',
      job_apply_link: 'https://example.com/apply/2',
      job_city: primaryCity,
      job_state: primaryState,
      job_country: 'US',
      job_employment_type: 'FULLTIME',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() / 1000,
      job_posted_at_datetime_utc: new Date().toISOString(),
      job_min_salary: 100000,
      job_max_salary: 150000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      employer_name: 'CloudTech Solutions',
      employer_logo: 'https://example.com/logo2.png', // This mock job has a real logo
      employer_website: 'https://cloudtech.com',
      job_publisher: 'Mock Data',
      job_apply_is_direct: false,
    },
    {
      job_id: 'mock-3',
      job_title: 'Product Manager',
      job_description: 'Lead product strategy and development for our AI platform...',
      job_apply_link: 'https://example.com/apply/3',
      job_city: primaryCity,
      job_state: primaryState,
      job_country: 'US',
      job_employment_type: 'FULLTIME',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() / 1000,
      job_posted_at_datetime_utc: new Date().toISOString(),
      job_min_salary: 130000,
      job_max_salary: 170000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      employer_name: 'DataFlow Analytics',
      // employer_logo: 'https://example.com/logo3.png', // Uncomment if you want a real logo for this mock job
      employer_website: 'https://dataflow.com',
      job_publisher: 'Mock Data',
      job_apply_is_direct: false,
    }
  ];
  
  // Filter by query
  let filteredJobs = mockJobs;
  if (query?.trim()) {
    const queryLower = query.toLowerCase();
    filteredJobs = filteredJobs.filter(job =>
      job.job_title.toLowerCase().includes(queryLower) ||
      job.job_description.toLowerCase().includes(queryLower) ||
      job.employer_name.toLowerCase().includes(queryLower)
    );
  }
  
  // Filter by location
  if (location?.trim()) {
    const locationLower = location.toLowerCase();
    filteredJobs = filteredJobs.filter(job =>
      job.job_city.toLowerCase().includes(locationLower) ||
      job.job_state.toLowerCase().includes(locationLower)
    );
  }
  
  return {
    status: 'mock',
    request_id: 'mock-' + Date.now(),
    parameters: params,
    data: filteredJobs,
    original_data: mockJobs,
    num_pages: 1,
    client_filtered: location?.trim() !== '',
    original_count: mockJobs.length,
    filtered_count: filteredJobs.length
  };
}

/**
 * Get job details by ID
 */
export async function getJobDetails(jobId: string): Promise<Job> {
  try {
    const response = await adzunaClient.get(`/job-details?job_id=${jobId}`);
    return response.data.data[0];
  } catch (error) {
    console.error('Error fetching job details:', error);
    throw new Error('Failed to fetch job details. Please try again.');
  }
}

/**
 * Search for jobs with estimated salaries
 */
export async function searchJobsWithSalaries(params: JobSearchParams): Promise<JobSearchResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add all search parameters
    if (params.query) queryParams.append('query', params.query);
    if (params.location) queryParams.append('location', params.location);
    if (params.remote_jobs_only) queryParams.append('remote_jobs_only', 'true');
    
    // Force salary estimates
    queryParams.append('salary_insights', 'true');
    
    const response = await adzunaClient.get(`/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error searching jobs with salaries:', error);
    throw new Error('Failed to search jobs with salary data. Please try again.');
  }
}

/**
 * Get estimated salary for a job title and location
 */
export async function getEstimatedSalary(jobTitle: string, location: string) {
  try {
    const queryParams = new URLSearchParams({
      job_title: jobTitle,
      location: location,
    });
    
    const response = await adzunaClient.get(`/estimated-salary?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching salary estimate:', error);
    throw new Error('Failed to fetch salary estimate. Please try again.');
  }
}

/**
 * Get company information
 */
export async function getCompanyInfo(companyName: string) {
  try {
    const queryParams = new URLSearchParams({
      query: companyName,
    });
    
    const response = await adzunaClient.get(`/company-jobs?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching company info:', error);
    throw new Error('Failed to fetch company information. Please try again.');
  }
}

/**
 * Mock data for development/demo purposes
 */
export function getMockJobs(): Job[] {
  return [
    {
      job_id: 'mock-1',
      employer_name: 'TechCorp Inc.',
      employer_logo: '/api/logo/techcorp.com',
      employer_website: 'https://techcorp.com',
      job_title: 'Senior Software Engineer',
      job_description: 'We are looking for a passionate Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining high-quality software solutions.',
      job_city: 'San Francisco',
      job_state: 'CA',
      job_country: 'US',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() - 86400000, // 1 day ago
      job_posted_at_datetime_utc: new Date(Date.now() - 86400000).toISOString(),
      job_apply_link: 'https://techcorp.com/jobs/senior-software-engineer',
      job_apply_is_direct: true,
      job_employment_type: 'FULLTIME',
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_min_salary: 120000,
      job_max_salary: 180000,
      job_benefits: ['Health Insurance', '401k', 'Remote Work', 'Flexible Hours'],
      job_publisher: 'TechCorp Careers',
      job_required_skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      job_highlights: {
        Qualifications: [
          '5+ years of software development experience',
          'Strong proficiency in JavaScript and React',
          'Experience with backend development',
        ],
        Responsibilities: [
          'Design and develop scalable web applications',
          'Collaborate with cross-functional teams',
          'Mentor junior developers',
        ],
        Benefits: [
          'Competitive salary and equity',
          'Comprehensive health coverage',
          'Flexible work arrangements',
        ],
      },
    },
    {
      job_id: 'mock-2',
      employer_name: 'DataFlow Solutions',
      employer_logo: '/api/logo/dataflow.com',
      employer_website: 'https://dataflow.com',
      job_title: 'Product Manager',
      job_description: 'Join our product team to drive innovation and deliver exceptional user experiences. You will work closely with engineering, design, and business teams.',
      job_city: 'New York',
      job_state: 'NY',
      job_country: 'US',
      job_is_remote: true,
      job_posted_at_timestamp: Date.now() - 172800000, // 2 days ago
      job_posted_at_datetime_utc: new Date(Date.now() - 172800000).toISOString(),
      job_apply_link: 'https://dataflow.com/careers/product-manager',
      job_apply_is_direct: true,
      job_employment_type: 'FULLTIME',
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_min_salary: 130000,
      job_max_salary: 160000,
      job_benefits: ['Health Insurance', '401k', 'Stock Options', 'Unlimited PTO'],
      job_publisher: 'DataFlow Careers',
      job_required_skills: ['Product Management', 'Agile', 'Analytics', 'Strategy'],
      job_highlights: {
        Qualifications: [
          '3+ years of product management experience',
          'Strong analytical and communication skills',
          'Experience with B2B software products',
        ],
        Responsibilities: [
          'Define product strategy and roadmap',
          'Work with engineering to deliver features',
          'Analyze user feedback and metrics',
        ],
        Benefits: [
          'Remote-first culture',
          'Professional development budget',
          'Equity participation',
        ],
      },
    },
  ];
} 

/**
 * Convert JSearch job format to our Job interface
 */
function convertJSearchJob(jsearchJob: any): Job {
  const employerName = jsearchJob.employer_name || '';
  const employerWebsite = jsearchJob.employer_website || undefined;
  // JSearch API might provide logo in different fields
  const employerLogo = jsearchJob.employer_logo || 
                      jsearchJob.employer_logo_url || 
                      jsearchJob.company_logo ||
                      jsearchJob.company_logo_url ||
                      undefined;
  

  
  return {
    job_id: jsearchJob.job_id?.toString() || '',
    job_title: jsearchJob.job_title || '',
    job_description: jsearchJob.job_description || '',
    job_apply_link: jsearchJob.job_apply_link || '',
    job_city: jsearchJob.job_city || '',
    job_state: jsearchJob.job_state || '',
    job_country: jsearchJob.job_country || 'US',
    job_employment_type: jsearchJob.job_employment_type || 'FULLTIME',
    job_is_remote: jsearchJob.job_is_remote || false,
    job_posted_at_timestamp: jsearchJob.job_posted_at_timestamp || 0,
    job_posted_at_datetime_utc: jsearchJob.job_posted_at_datetime_utc || '',
    job_min_salary: jsearchJob.job_min_salary || undefined,
    job_max_salary: jsearchJob.job_max_salary || undefined,
    job_salary_currency: jsearchJob.job_salary_currency || 'USD',
    job_salary_period: jsearchJob.job_salary_period || 'YEAR',
    employer_name: employerName,
    ...(employerLogo ? { employer_logo: employerLogo } : {}),
    employer_website: employerWebsite,
    job_publisher: 'JSearch',
    job_apply_is_direct: jsearchJob.job_apply_is_direct || false,
    // Optional properties
    job_offer_expiration_datetime_utc: jsearchJob.job_offer_expiration_datetime_utc || undefined,
    job_offer_expiration_timestamp: jsearchJob.job_offer_expiration_timestamp || undefined,
    job_required_experience: jsearchJob.job_required_experience || undefined,
    job_required_skills: jsearchJob.job_required_skills || undefined,
    job_required_education: jsearchJob.job_required_education || undefined,
    job_benefits: jsearchJob.job_benefits || undefined,
    job_google_link: jsearchJob.job_google_link || undefined,
    job_naics_code: jsearchJob.job_naics_code || undefined,
    job_naics_name: jsearchJob.job_naics_name || undefined,
    job_occupational_categories: jsearchJob.job_occupational_categories || undefined,
    job_highlights: jsearchJob.job_highlights || undefined,
  };
}

export async function searchJSearchJobs(params: JobSearchParams): Promise<JobSearchResponseWithQuota> {
  const startTime = Date.now();
  let success = false;
  let errorMessage: string | undefined;

  const apiKey = process.env.JSEARCH_API_KEY || process.env.RAPIDAPI_KEY;
  
  if (!apiKey) {
    console.warn('JSearch API key not configured - skipping JSearch API calls');
    throw new Error('JSearch API key not configured');
  }

  const url = new URL('https://jsearch.p.rapidapi.com/search');
  url.searchParams.set('query', params.query || '');
  if (params.location) url.searchParams.set('location', params.location);
  if (params.radius) url.searchParams.set('radius', params.radius.toString());
  if (params.page) url.searchParams.set('page', params.page.toString());
  if (params.num_pages) url.searchParams.set('num_pages', params.num_pages.toString());
  url.searchParams.set('num_pages', '1'); // Request more results per page
  url.searchParams.set('page', '1'); // Start from first page

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`JSearch API error (${response.status}): ${errorText}`);
      throw new Error(`JSearch API error: ${response.status} ${response.statusText}`);
    }
    
    // Parse quota information from response headers
    const jsearchQuota = parseQuotaFromHeaders(response.headers, 'jsearch');
    
    const data = await response.json();
    success = true;
    
    // Debug: Log JSearch API response structure
    if (data.data && data.data.length > 0) {
      const firstJob = data.data[0];
      console.log('🔍 JSearch API job structure:', {
        id: firstJob.job_id,
        employer_name: firstJob.employer_name,
        title: firstJob.job_title,
        // Log all available fields
        allFields: Object.keys(firstJob),
        // Log the entire first job for detailed inspection
        fullJob: firstJob
      });
    }
    
    // Convert JSearch jobs to our format
    const convertedJobs = (data.data || []).map(convertJSearchJob);
    
    console.log('🔍 JSearch total count debug:', {
      dataTotalCount: data.total_count,
      dataLength: data.data?.length || 0,
      willSetTotalCount: data.total_count || (data.data?.length || 0)
    });
    
    // Record API usage for quota tracking
    quotaTracker.recordUsage('jsearch', 1);
    
    return {
      status: data.status || 'success',
      request_id: data.request_id || '',
      parameters: params,
      data: convertedJobs,
      original_data: convertedJobs,
      total_count: data.total_count || convertedJobs.length, // Add total_count field
      num_pages: data.num_pages || 1,
      client_filtered: false,
      original_count: convertedJobs.length,
      filtered_count: convertedJobs.length,
      quota: {
        jsearch: jsearchQuota
      }
    };
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('JSearch API call failed:', errorMessage);
    throw error;
  } finally {
    const responseTime = Date.now() - startTime;
    trackAPICall('jsearch', success, responseTime, errorMessage);
  }
} 