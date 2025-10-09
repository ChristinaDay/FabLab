import { Job } from '@/types/job';
import { formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format salary range for display
 */
export function formatSalaryRange(
  minSalary?: number,
  maxSalary?: number,
  currency = 'USD',
  period = 'YEAR'
): string {
  if (!minSalary && !maxSalary) {
    return 'Salary not disclosed';
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const periodText = period === 'YEAR' ? '/year' : period === 'HOUR' ? '/hour' : '';

  if (minSalary && maxSalary) {
    return `${formatNumber(minSalary)} - ${formatNumber(maxSalary)}${periodText}`;
  } else if (minSalary) {
    return `From ${formatNumber(minSalary)}${periodText}`;
  } else if (maxSalary) {
    return `Up to ${formatNumber(maxSalary)}${periodText}`;
  }

  return 'Salary not disclosed';
}

/**
 * Format job posting date
 */
export function formatJobPostedDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'Recently posted';
  }
}

/**
 * Map specific neighborhoods to broader regions
 */
export function getBroaderRegion(city: string, state: string): string {
  if (!city) return state || '';
  
  const cityLower = city.toLowerCase().trim();
  const stateLower = state.toLowerCase().trim();
  
  // San Francisco Bay Area neighborhoods
  if (stateLower === 'ca' || stateLower === 'california') {
    if (cityLower.includes('soma') || cityLower.includes('south of market')) return 'San Francisco, CA';
    if (cityLower.includes('mission') || cityLower.includes('mission district')) return 'San Francisco, CA';
    if (cityLower.includes('hayes valley') || cityLower.includes('hayes')) return 'San Francisco, CA';
    if (cityLower.includes('north beach')) return 'San Francisco, CA';
    if (cityLower.includes('marina') || cityLower.includes('marina district')) return 'San Francisco, CA';
    if (cityLower.includes('pacific heights')) return 'San Francisco, CA';
    if (cityLower.includes('nob hill')) return 'San Francisco, CA';
    if (cityLower.includes('russian hill')) return 'San Francisco, CA';
    if (cityLower.includes('castro') || cityLower.includes('castro district')) return 'San Francisco, CA';
    if (cityLower.includes('haight') || cityLower.includes('haight-ashbury')) return 'San Francisco, CA';
    if (cityLower.includes('sunset') || cityLower.includes('sunset district')) return 'San Francisco, CA';
    if (cityLower.includes('richmond') || cityLower.includes('richmond district')) return 'San Francisco, CA';
    if (cityLower.includes('bernal heights')) return 'San Francisco, CA';
    if (cityLower.includes('noe valley')) return 'San Francisco, CA';
    if (cityLower.includes('glen park')) return 'San Francisco, CA';
    if (cityLower.includes('potrero hill')) return 'San Francisco, CA';
    if (cityLower.includes('dogpatch')) return 'San Francisco, CA';
    if (cityLower.includes('bayview') || cityLower.includes('bayview-hunters point')) return 'San Francisco, CA';
    if (cityLower.includes('excelsior')) return 'San Francisco, CA';
    if (cityLower.includes('ingleside')) return 'San Francisco, CA';
    if (cityLower.includes('outer mission')) return 'San Francisco, CA';
    if (cityLower.includes('visitacion valley')) return 'San Francisco, CA';
    if (cityLower.includes('treasure island')) return 'San Francisco, CA';
    if (cityLower.includes('alcatraz')) return 'San Francisco, CA';
    
    // Oakland neighborhoods
    if (cityLower.includes('downtown oakland')) return 'Oakland, CA';
    if (cityLower.includes('uptown oakland')) return 'Oakland, CA';
    if (cityLower.includes('lake merritt')) return 'Oakland, CA';
    if (cityLower.includes('rockridge')) return 'Oakland, CA';
    if (cityLower.includes('temescal')) return 'Oakland, CA';
    if (cityLower.includes('adams point')) return 'Oakland, CA';
    if (cityLower.includes('grand lake')) return 'Oakland, CA';
    if (cityLower.includes('fruitvale')) return 'Oakland, CA';
    if (cityLower.includes('san antonio')) return 'Oakland, CA';
    if (cityLower.includes('east oakland')) return 'Oakland, CA';
    if (cityLower.includes('west oakland')) return 'Oakland, CA';
    if (cityLower.includes('north oakland')) return 'Oakland, CA';
    
    // San Jose neighborhoods
    if (cityLower.includes('downtown san jose')) return 'San Jose, CA';
    if (cityLower.includes('santana row')) return 'San Jose, CA';
    if (cityLower.includes('willow glen')) return 'San Jose, CA';
    if (cityLower.includes('cambrian')) return 'San Jose, CA';
    if (cityLower.includes('almaden')) return 'San Jose, CA';
    if (cityLower.includes('east san jose')) return 'San Jose, CA';
    if (cityLower.includes('west san jose')) return 'San Jose, CA';
    if (cityLower.includes('north san jose')) return 'San Jose, CA';
    
    // Other Bay Area cities
    if (cityLower.includes('palo alto')) return 'Palo Alto, CA';
    if (cityLower.includes('mountain view')) return 'Mountain View, CA';
    if (cityLower.includes('redwood city')) return 'Redwood City, CA';
    if (cityLower.includes('san mateo')) return 'San Mateo, CA';
    if (cityLower.includes('burlingame')) return 'Burlingame, CA';
    if (cityLower.includes('san carlos')) return 'San Carlos, CA';
    if (cityLower.includes('menlo park')) return 'Menlo Park, CA';
    if (cityLower.includes('sunnyvale')) return 'Sunnyvale, CA';
    if (cityLower.includes('santa clara')) return 'Santa Clara, CA';
    if (cityLower.includes('san jose')) return 'San Jose, CA';
    if (cityLower.includes('fremont')) return 'Fremont, CA';
    if (cityLower.includes('hayward')) return 'Hayward, CA';
    if (cityLower.includes('berkeley')) return 'Berkeley, CA';
    if (cityLower.includes('emeryville')) return 'Emeryville, CA';
    if (cityLower.includes('alameda')) return 'Alameda, CA';
    if (cityLower.includes('san leandro')) return 'San Leandro, CA';
    if (cityLower.includes('dublin')) return 'Dublin, CA';
    if (cityLower.includes('pleasanton')) return 'Pleasanton, CA';
    if (cityLower.includes('livermore')) return 'Livermore, CA';
    if (cityLower.includes('walnut creek')) return 'Walnut Creek, CA';
    if (cityLower.includes('concord')) return 'Concord, CA';
    if (cityLower.includes('san rafael')) return 'San Rafael, CA';
    if (cityLower.includes('novato')) return 'Novato, CA';
    if (cityLower.includes('sausalito')) return 'Sausalito, CA';
    if (cityLower.includes('mill valley')) return 'Mill Valley, CA';
    if (cityLower.includes('san francisco')) return 'San Francisco, CA';
  }
  
  // New York City neighborhoods
  if (stateLower === 'ny' || stateLower === 'new york') {
    if (cityLower.includes('manhattan') || cityLower.includes('nyc')) return 'New York, NY';
    if (cityLower.includes('brooklyn')) return 'Brooklyn, NY';
    if (cityLower.includes('queens')) return 'Queens, NY';
    if (cityLower.includes('bronx')) return 'Bronx, NY';
    if (cityLower.includes('staten island')) return 'Staten Island, NY';
    if (cityLower.includes('midtown')) return 'New York, NY';
    if (cityLower.includes('downtown')) return 'New York, NY';
    if (cityLower.includes('uptown')) return 'New York, NY';
    if (cityLower.includes('chelsea')) return 'New York, NY';
    if (cityLower.includes('west village')) return 'New York, NY';
    if (cityLower.includes('east village')) return 'New York, NY';
    if (cityLower.includes('soho')) return 'New York, NY';
    if (cityLower.includes('tribeca')) return 'New York, NY';
    if (cityLower.includes('harlem')) return 'New York, NY';
    if (cityLower.includes('upper east side')) return 'New York, NY';
    if (cityLower.includes('upper west side')) return 'New York, NY';
    if (cityLower.includes('lower east side')) return 'New York, NY';
    if (cityLower.includes('lower west side')) return 'New York, NY';
    if (cityLower.includes('financial district')) return 'New York, NY';
    if (cityLower.includes('battery park')) return 'New York, NY';
    if (cityLower.includes('times square')) return 'New York, NY';
    if (cityLower.includes('hells kitchen')) return 'New York, NY';
    if (cityLower.includes('gramercy')) return 'New York, NY';
    if (cityLower.includes('murray hill')) return 'New York, NY';
    if (cityLower.includes('kips bay')) return 'New York, NY';
    if (cityLower.includes('turtle bay')) return 'New York, NY';
    if (cityLower.includes('sutton place')) return 'New York, NY';
    if (cityLower.includes('yorkville')) return 'New York, NY';
    if (cityLower.includes('carnegie hill')) return 'New York, NY';
    if (cityLower.includes('morningside heights')) return 'New York, NY';
    if (cityLower.includes('washington heights')) return 'New York, NY';
    if (cityLower.includes('inwood')) return 'New York, NY';
    if (cityLower.includes('riverdale')) return 'Bronx, NY';
    if (cityLower.includes('fordham')) return 'Bronx, NY';
    if (cityLower.includes('pelham bay')) return 'Bronx, NY';
    if (cityLower.includes('throgs neck')) return 'Bronx, NY';
    if (cityLower.includes('morris park')) return 'Bronx, NY';
    if (cityLower.includes('parkchester')) return 'Bronx, NY';
    if (cityLower.includes('co-op city')) return 'Bronx, NY';
    if (cityLower.includes('williamsburg')) return 'Brooklyn, NY';
    if (cityLower.includes('dumbo')) return 'Brooklyn, NY';
    if (cityLower.includes('brooklyn heights')) return 'Brooklyn, NY';
    if (cityLower.includes('fort greene')) return 'Brooklyn, NY';
    if (cityLower.includes('prospect heights')) return 'Brooklyn, NY';
    if (cityLower.includes('crown heights')) return 'Brooklyn, NY';
    if (cityLower.includes('bedford-stuyvesant')) return 'Brooklyn, NY';
    if (cityLower.includes('bushwick')) return 'Brooklyn, NY';
    if (cityLower.includes('greenpoint')) return 'Brooklyn, NY';
    if (cityLower.includes('park slope')) return 'Brooklyn, NY';
    if (cityLower.includes('bay ridge')) return 'Brooklyn, NY';
    if (cityLower.includes('coney island')) return 'Brooklyn, NY';
    if (cityLower.includes('brighton beach')) return 'Brooklyn, NY';
    if (cityLower.includes('sheepshead bay')) return 'Brooklyn, NY';
    if (cityLower.includes('flatbush')) return 'Brooklyn, NY';
    if (cityLower.includes('midwood')) return 'Brooklyn, NY';
    if (cityLower.includes('borough park')) return 'Brooklyn, NY';
    if (cityLower.includes('sunset park')) return 'Brooklyn, NY';
    if (cityLower.includes('red hook')) return 'Brooklyn, NY';
    if (cityLower.includes('gowanus')) return 'Brooklyn, NY';
    if (cityLower.includes('carroll gardens')) return 'Brooklyn, NY';
    if (cityLower.includes('cobble hill')) return 'Brooklyn, NY';
    if (cityLower.includes('boerum hill')) return 'Brooklyn, NY';
    if (cityLower.includes('vinegar hill')) return 'Brooklyn, NY';
    if (cityLower.includes('astoria')) return 'Queens, NY';
    if (cityLower.includes('long island city')) return 'Queens, NY';
    if (cityLower.includes('sunnyside')) return 'Queens, NY';
    if (cityLower.includes('woodside')) return 'Queens, NY';
    if (cityLower.includes('elmhurst')) return 'Queens, NY';
    if (cityLower.includes('jackson heights')) return 'Queens, NY';
    if (cityLower.includes('corona')) return 'Queens, NY';
    if (cityLower.includes('flushing')) return 'Queens, NY';
    if (cityLower.includes('bayside')) return 'Queens, NY';
    if (cityLower.includes('douglaston')) return 'Queens, NY';
    if (cityLower.includes('little neck')) return 'Queens, NY';
    if (cityLower.includes('jamaica')) return 'Queens, NY';
    if (cityLower.includes('richmond hill')) return 'Queens, NY';
    if (cityLower.includes('ozone park')) return 'Queens, NY';
    if (cityLower.includes('howard beach')) return 'Queens, NY';
    if (cityLower.includes('rockaway')) return 'Queens, NY';
    if (cityLower.includes('forest hills')) return 'Queens, NY';
    if (cityLower.includes('rego park')) return 'Queens, NY';
    if (cityLower.includes('middle village')) return 'Queens, NY';
    if (cityLower.includes('glendale')) return 'Queens, NY';
    if (cityLower.includes('ridgewood')) return 'Queens, NY';
    if (cityLower.includes('maspeth')) return 'Queens, NY';
    if (cityLower.includes('fresh meadows')) return 'Queens, NY';
    if (cityLower.includes('bellerose')) return 'Queens, NY';
    if (cityLower.includes('st. albans')) return 'Queens, NY';
    if (cityLower.includes('springfield gardens')) return 'Queens, NY';
    if (cityLower.includes('laurelton')) return 'Queens, NY';
    if (cityLower.includes('rosedale')) return 'Queens, NY';
    if (cityLower.includes('far rockaway')) return 'Queens, NY';
    if (cityLower.includes('breezy point')) return 'Queens, NY';
    if (cityLower.includes('staten island')) return 'Staten Island, NY';
    if (cityLower.includes('st. george')) return 'Staten Island, NY';
    if (cityLower.includes('tompkinsville')) return 'Staten Island, NY';
    if (cityLower.includes('stapleton')) return 'Staten Island, NY';
    if (cityLower.includes('rosebank')) return 'Staten Island, NY';
    if (cityLower.includes('grasmere')) return 'Staten Island, NY';
    if (cityLower.includes('emerson hill')) return 'Staten Island, NY';
    if (cityLower.includes('todt hill')) return 'Staten Island, NY';
    if (cityLower.includes('new dorp')) return 'Staten Island, NY';
    if (cityLower.includes('great kills')) return 'Staten Island, NY';
    if (cityLower.includes('eltingville')) return 'Staten Island, NY';
    if (cityLower.includes('annadale')) return 'Staten Island, NY';
    if (cityLower.includes('huguenot')) return 'Staten Island, NY';
    if (cityLower.includes('princes bay')) return 'Staten Island, NY';
    if (cityLower.includes('pleasant plains')) return 'Staten Island, NY';
    if (cityLower.includes('richmond')) return 'Staten Island, NY';
    if (cityLower.includes('tottenville')) return 'Staten Island, NY';
    if (cityLower.includes('travis')) return 'Staten Island, NY';
    if (cityLower.includes('mariners harbor')) return 'Staten Island, NY';
    if (cityLower.includes('port richmond')) return 'Staten Island, NY';
    if (cityLower.includes('west brighton')) return 'Staten Island, NY';
    if (cityLower.includes('new brighton')) return 'Staten Island, NY';
    if (cityLower.includes('grymes hill')) return 'Staten Island, NY';
    if (cityLower.includes('clifton')) return 'Staten Island, NY';
    if (cityLower.includes('concord')) return 'Staten Island, NY';
    if (cityLower.includes('silver lake')) return 'Staten Island, NY';
    if (cityLower.includes('willowbrook')) return 'Staten Island, NY';
    if (cityLower.includes('bulls head')) return 'Staten Island, NY';
    if (cityLower.includes('castleton corners')) return 'Staten Island, NY';
    if (cityLower.includes('meiers corners')) return 'Staten Island, NY';
    if (cityLower.includes('oakwood')) return 'Staten Island, NY';
    if (cityLower.includes('bay terrace')) return 'Staten Island, NY';
    if (cityLower.includes('new york')) return 'New York, NY';
  }
  
  // Default: return the original city and state
  return `${city}, ${state}`;
}

/**
 * Get job location display string
 */
export function formatJobLocation(job: Job): string {
  if (job.job_is_remote) {
    return 'Remote';
  }

  // Use broader region instead of specific neighborhoods
  const broaderRegion = getBroaderRegion(job.job_city, job.job_state);
  
  if (broaderRegion) {
    return capitalizeLocation(broaderRegion);
  }

  // Fallback to original logic
  const parts = [];
  if (job.job_city) parts.push(job.job_city);
  if (job.job_state) parts.push(job.job_state);
  if (job.job_country && job.job_country !== 'US') parts.push(job.job_country);

  return parts.join(', ') || 'Location not specified';
}

/**
 * Extract company domain from email or website
 */
export function getCompanyDomain(website?: string, email?: string): string | null {
  if (website) {
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      return url.hostname.replace('www.', '');
    } catch {
      return null;
    }
  }

  if (email) {
    const domain = email.split('@')[1];
    return domain || null;
  }

  return null;
}

/**
 * Validate if a logo URL actually returns an image
 */
export async function validateLogoUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && contentType ? contentType.startsWith('image/') : false;
  } catch {
    return false;
  }
}

/**
 * Generate company logo URL using our proxy API to avoid CORS issues
 * Tries website first, then falls back to company name-based domain guessing
 * Returns null if no valid logo is found
 */
export function getCompanyLogoUrl(companyName: string, website?: string): string | null {
  // First try: use provided website
  const domain = getCompanyDomain(website);
  if (domain) {
    return `/api/logo/${domain}`;
  }

  // Second try: generate domain from company name
  if (companyName) {
    const cleanName = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .replace(/\s+/g, ''); // Remove spaces
    
    // Only try if we have a reasonable company name
    if (cleanName.length >= 3) {
      return `/api/logo/${cleanName}.com`;
    }
  }

  return null;
}

/**
 * Get employment type display text
 */
export function formatEmploymentType(type: string): string {
  const typeMap: Record<string, string> = {
    FULLTIME: 'Full-time',
    PARTTIME: 'Part-time',
    CONTRACT: 'Contract',
    INTERNSHIP: 'Internship',
    TEMPORARY: 'Temporary',
    VOLUNTEER: 'Volunteer',
  };

  return typeMap[type.toUpperCase()] || type;
}

/**
 * Truncate job description for preview
 */
export function truncateDescription(description: string, maxLength = 200): string {
  if (description.length <= maxLength) {
    return description;
  }

  return description.slice(0, maxLength).trim() + '...';
}

/**
 * Extract skills from job description and requirements
 */
export function extractSkills(job: Job): string[] {
  const skills = new Set<string>();

  // Add required skills if available
  if (job.job_required_skills) {
    job.job_required_skills.forEach(skill => skills.add(skill));
  }

  // Common tech skills to look for in description
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Angular', 'Vue',
    'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure',
    'Docker', 'Kubernetes', 'Git', 'REST', 'GraphQL', 'HTML', 'CSS',
    'Sass', 'TailwindCSS', 'Bootstrap', 'Figma', 'Sketch', 'Adobe',
    'Agile', 'Scrum', 'CI/CD', 'DevOps', 'Machine Learning', 'AI',
    'Data Science', 'Analytics', 'Tableau', 'Power BI', 'Excel',
  ];

  const description = job.job_description.toLowerCase();
  const qualifications = job.job_highlights?.Qualifications?.join(' ').toLowerCase() || '';
  const responsibilities = job.job_highlights?.Responsibilities?.join(' ').toLowerCase() || '';

  const fullText = `${description} ${qualifications} ${responsibilities}`;

  commonSkills.forEach(skill => {
    if (fullText.includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  });

  return Array.from(skills).slice(0, 8); // Limit to 8 skills
}

/**
 * Calculate job match score (mock implementation)
 */
export function calculateJobMatchScore(job: Job, userSkills: string[] = []): number {
  let score = 50; // Base score

  // Boost for remote jobs (popular preference)
  if (job.job_is_remote) score += 10;

  // Boost for jobs with salary information
  if (job.job_min_salary || job.job_max_salary) score += 10;

  // Boost for direct application
  if (job.job_apply_is_direct) score += 5;

  // Boost for recent postings
  const daysOld = (Date.now() - job.job_posted_at_timestamp) / (1000 * 60 * 60 * 24);
  if (daysOld < 7) score += 15;
  else if (daysOld < 30) score += 10;

  // Match user skills
  if (userSkills.length > 0) {
    const jobSkills = extractSkills(job);
    const matchingSkills = jobSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    score += Math.min(matchingSkills.length * 5, 25); // Up to 25 points for skills
  }

  return Math.min(Math.max(score, 0), 100); // Clamp between 0-100
}

/**
 * Filter jobs by criteria
 */
export function filterJobs(jobs: Job[], filters: {
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  employmentTypes?: string[];
  experience?: string;
  datePosted?: string;
}): Job[] {
  return jobs.filter(job => {
    // Remote filter
    if (filters.remote !== undefined && job.job_is_remote !== filters.remote) {
      return false;
    }

    // Salary filters
    if (filters.salaryMin && job.job_max_salary && job.job_max_salary < filters.salaryMin) {
      return false;
    }
    if (filters.salaryMax && job.job_min_salary && job.job_min_salary > filters.salaryMax) {
      return false;
    }

    // Employment type filter
    if (filters.employmentTypes?.length && 
        !filters.employmentTypes.includes(job.job_employment_type)) {
      return false;
    }

    // Date posted filter
    if (filters.datePosted) {
      const daysOld = (Date.now() - job.job_posted_at_timestamp) / (1000 * 60 * 60 * 24);
      const maxDays = filters.datePosted === 'day' ? 1 :
                      filters.datePosted === 'week' ? 7 :
                      filters.datePosted === 'month' ? 30 : 365;
      
      if (daysOld > maxDays) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort jobs by criteria
 */
export function sortJobs(jobs: Job[], sortBy: 'relevance' | 'date' | 'salary' | 'company'): Job[] {
  const sorted = [...jobs];

  switch (sortBy) {
    case 'date':
      return sorted.sort((a, b) => b.job_posted_at_timestamp - a.job_posted_at_timestamp);
    
    case 'salary':
      return sorted.sort((a, b) => {
        const salaryA = a.job_max_salary || a.job_min_salary || 0;
        const salaryB = b.job_max_salary || b.job_min_salary || 0;
        return salaryB - salaryA;
      });
    
    case 'company':
      return sorted.sort((a, b) => a.employer_name.localeCompare(b.employer_name));
    
    case 'relevance':
    default:
      return sorted.sort((a, b) => calculateJobMatchScore(b) - calculateJobMatchScore(a));
  }
}

/**
 * Capitalize location names properly (Title Case)
 * Handles various location formats like "san francisco", "san francisco, ca", etc.
 */
export function capitalizeLocation(location: string): string {
  if (!location || typeof location !== 'string') return location;
  
  return location
    .split(',')
    .map(part => 
      part.trim()
        .split(' ')
        .map(word => {
          // Handle special cases for common words
          const lowercaseWord = word.toLowerCase();
          
          // Don't capitalize certain prepositions/articles in the middle
          if (lowercaseWord === 'of' || lowercaseWord === 'the' || lowercaseWord === 'and') {
            return lowercaseWord;
          }
          
          // Capitalize first letter, keep rest as lowercase
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ')
    )
    .join(', ');
}

/**
 * Format job location for search URLs - includes both city and state when available
 */
export function formatJobLocationForSearch(job: Job): string {
  if (job.job_is_remote) {
    return ''; // Don't add location restriction for remote jobs
  }
  
  const parts = [];
  if (job.job_city) parts.push(job.job_city);
  if (job.job_state) parts.push(job.job_state);
  
  // If we have both city and state, use both
  if (parts.length >= 2) {
    return parts.join(', ');
  }
  
  // Fallback to whatever we have
  if (parts.length === 1) {
    return parts[0];
  }
  
  // Final fallback to country
  return job.job_country || '';
}

/**
 * Filter jobs based on user's excluded categories
 */
export function filterExcludedJobs(jobs: Job[], excludedCategories: string[]): Job[] {
  if (!jobs || !Array.isArray(jobs)) {
    return [];
  }
  
  if (!excludedCategories || excludedCategories.length === 0) {
    return jobs;
  }

  return jobs.filter(job => {
    if (!job) return false;
    
    const searchText = [
      job.job_title || '',
      job.job_description || '',
      job.employer_name || '',
      ...(job.job_required_skills || []),
      ...(job.job_occupational_categories || [])
    ].join(' ').toLowerCase();

    // Check if any excluded category is found in the job
    return !excludedCategories.some(category => {
      if (!category || typeof category !== 'string') return false;
      
      const categoryLower = category.toLowerCase().trim();
      if (!categoryLower) return false;
      
      try {
        // Use word boundaries to avoid false positives
        // e.g., "military" should match "military contractor" but not "paramilitary"
        const regex = new RegExp(`\\b${categoryLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
        return regex.test(searchText);
      } catch (error) {
        console.warn('Error in filterExcludedJobs regex:', error);
        return false;
      }
    });
  });
} 