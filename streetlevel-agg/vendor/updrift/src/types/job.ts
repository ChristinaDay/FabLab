export interface Job {
  job_id: string;
  employer_name: string;
  employer_logo?: string;
  employer_website?: string;
  job_title: string;
  job_description: string;
  job_city: string;
  job_state: string;
  job_country: string;
  job_is_remote: boolean;
  job_posted_at_timestamp: number;
  job_posted_at_datetime_utc: string;
  job_apply_link: string;
  job_apply_is_direct: boolean;
  job_offer_expiration_datetime_utc?: string;
  job_offer_expiration_timestamp?: number;
  job_required_experience?: {
    no_experience_required: boolean;
    required_experience_in_months: number;
    experience_mentioned: boolean;
    experience_preferred: boolean;
  };
  job_required_skills?: string[];
  job_required_education?: {
    postgraduate_degree: boolean;
    professional_certification: boolean;
    high_school: boolean;
    associates_degree: boolean;
    bachelors_degree: boolean;
    degree_mentioned: boolean;
    degree_preferred: boolean;
    professional_certification_mentioned: boolean;
  };
  job_employment_type: string;
  job_salary_currency?: string;
  job_salary_period?: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_benefits?: string[];
  job_google_link?: string;
  job_publisher: string;
  job_naics_code?: string;
  job_naics_name?: string;
  job_occupational_categories?: string[];
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
    Benefits?: string[];
  };
}

export interface JobSearchParams {
  query?: string;
  location?: string;
  radius?: number; // Search radius in miles
  remote_jobs_only?: boolean;
  employment_types?: string[];
  job_requirements?: string[];
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  date_posted?: string;
  page?: number;
  num_pages?: number;
  excludeJobId?: string; // Job ID to exclude from search results
}

export interface JobSearchResponse {
  status: string;
  request_id: string;
  parameters: JobSearchParams;
  data: Job[];
  original_data?: Job[];
  num_pages: number;
  client_filtered?: boolean;
  original_count?: number;
  filtered_count?: number;
  total_count?: number; // Total jobs available from API
}

export interface SavedJob {
  job_id: string;
  saved_at: string;
  notes?: string;
  status: 'saved' | 'applied' | 'interviewing' | 'rejected' | 'hired';
}

export interface JobApplication {
  job_id: string;
  applied_at: string;
  status: 'applied' | 'viewed' | 'rejected' | 'interviewing' | 'hired';
  application_link: string;
  notes?: string;
  follow_up_date?: string;
}

export interface UserPreferences {
  preferred_locations: string[];
  preferred_remote: boolean;
  preferred_employment_types: string[];
  preferred_experience_levels: string[];
  preferred_salary_range: {
    min?: number;
    max?: number;
  };
  job_alerts: boolean;
  email_notifications: boolean;
  blacklisted_companies: string[];
  preferred_industries: string[];
} 