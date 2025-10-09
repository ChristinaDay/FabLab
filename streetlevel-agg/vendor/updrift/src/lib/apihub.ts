import { JobSearchParams, Job } from '@/types/job';
import { searchAdzunaJobs as adzunaSearch } from './api';
import { searchJSearchJobs } from './api';

// Provider interface for job APIs
export interface JobProvider {
  id: string; // Unique provider ID (e.g., 'adzuna', 'jsearch')
  displayName: string; // Human-readable name
  logoUrl?: string; // Optional logo for UI
  searchJobs: (params: JobSearchParams) => Promise<{ data: Job[], total_count: number }>;
}

export const adzunaProvider: JobProvider = {
  id: 'adzuna',
  displayName: 'Adzuna',
  logoUrl: '/logos/Adzuna.png', // Fixed case-sensitive filename
  searchJobs: async (params: JobSearchParams): Promise<{ data: Job[], total_count: number }> => {
    console.log('🔍 Adzuna provider called with params:', params);
    const response = await adzunaSearch(params);
    console.log('🔍 Adzuna provider response:', {
      status: response.status,
      dataLength: response.data?.length || 0,
      totalCount: response.total_count,
      firstJob: response.data?.[0]?.job_title || 'No jobs'
    });
    return { data: response.data, total_count: response.total_count || 0 };
  },
};

export const jsearchProvider: JobProvider = {
  id: 'jsearch',
  displayName: 'JSearch',
  logoUrl: '/logos/jsearch-rapidapi.jpeg', // Updated to match the actual file
  searchJobs: async (params: JobSearchParams): Promise<{ data: Job[], total_count: number }> => {
    console.log('🔍 JSearch provider called with params:', params);
    const response = await searchJSearchJobs(params);
    console.log('🔍 JSearch provider response:', {
      status: response.status,
      dataLength: response.data?.length || 0,
      totalCount: response.total_count,
      firstJob: response.data?.[0]?.job_title || 'No jobs'
    });
    return { data: response.data, total_count: response.total_count || 0 };
  },
};

export const mockProvider: JobProvider = {
  id: 'mock',
  displayName: 'MockJobs',
  logoUrl: '/logos/mock.png', // Placeholder
  searchJobs: async (_params: JobSearchParams): Promise<{ data: Job[], total_count: number }> => {
    // Generate 25 mock jobs for testing pagination (10 per page = 3 pages)
    const mockJobs: Job[] = [];
    
    for (let i = 1; i <= 25; i++) {
      mockJobs.push({
        job_id: `mock-${i}`,
        employer_name: `Mock Company ${i}`,
        job_title: `Mock Software Engineer ${i}`,
        job_description: `This is mock job ${i} for testing the APIhub aggregation and pagination.`,
        job_city: 'Remote',
        job_state: '',
        job_country: 'US',
        job_is_remote: true,
        job_posted_at_timestamp: Date.now() / 1000 - (i * 3600), // Different timestamps
        job_posted_at_datetime_utc: new Date(Date.now() - (i * 3600000)).toISOString(),
        job_apply_link: '#',
        job_apply_is_direct: true,
        job_employment_type: 'FULLTIME',
        job_publisher: 'MockJobs',
        // Optional fields
        employer_logo: undefined,
        employer_website: undefined,
        job_offer_expiration_datetime_utc: undefined,
        job_offer_expiration_timestamp: undefined,
        job_required_experience: undefined,
        job_required_skills: ['Testing', 'TypeScript', `Skill ${i}`],
        job_required_education: undefined,
        job_salary_currency: 'USD',
        job_salary_period: 'YEAR',
        job_min_salary: 100000 + (i * 1000),
        job_max_salary: 120000 + (i * 1000),
        job_benefits: ['Remote work', 'Flexible hours'],
        job_google_link: undefined,
        job_naics_code: undefined,
        job_naics_name: undefined,
        job_occupational_categories: undefined,
        job_highlights: {
          Qualifications: ['TypeScript', 'React', `Qualification ${i}`],
          Responsibilities: ['Write code', 'Test features'],
          Benefits: ['Remote', 'Flexible']
        }
      });
    }
    
    return { data: mockJobs, total_count: 25 };
  },
};

// Register both providers
export const jobProviders: JobProvider[] = [
  adzunaProvider,
  jsearchProvider,
  // mockProvider, // Disabled - only for testing
];

// Search all providers in parallel and aggregate results
export async function searchAllProviders(params: JobSearchParams): Promise<{ jobs: Job[], totalCount: number }> {
  console.log('🔍 searchAllProviders called with params:', params);
  
  // Call all providers in parallel
  const results = await Promise.all(
    jobProviders.map(async provider => {
      try {
        console.log(`🔍 Calling provider: ${provider.id}`);
        const response = await provider.searchJobs(params);
        console.log(`✅ Provider ${provider.id} returned ${response.data?.length || 0} jobs`);
        return response;
      } catch (err) {
        console.error(`❌ Provider ${provider.id} failed:`, err);
        return { data: [], total_count: 0 };
      }
    })
  );
  
  // Flatten and deduplicate by job_id
  const allJobs = results.flatMap(result => result.data || []);
  console.log('🔍 Total jobs before deduplication:', allJobs.length);
  
  const seen = new Set<string>();
  const deduped = allJobs.filter(job => {
    if (seen.has(job.job_id)) return false;
    seen.add(job.job_id);
    return true;
  });
  
  // Sum up total counts from all providers
  const totalCount = results.reduce((sum, result) => {
    return sum + (result.total_count || 0);
  }, 0);
  
  console.log('🔍 Final deduplicated jobs:', deduped.length);
  console.log('🔍 Total count from all providers:', totalCount);
  if (deduped.length > 0) {
    console.log('🔍 First job:', deduped[0].job_title);
  }
  
  return { jobs: deduped, totalCount };
} 