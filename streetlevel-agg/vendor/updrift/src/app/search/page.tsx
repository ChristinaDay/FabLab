'use client'

/**
 * Job Search Page
 * 
 * IMPORTANT: Location Filtering Solution
 * =====================================
 * This page implements client-side location filtering to fix a critical issue with
 * the JSearch API (RapidAPI). The external API does not properly respect the location
 * parameter, often returning jobs from random locations when searching for specific cities.
 * 
 * Our solution:
 * 1. Send location parameter to API (for potential future improvements)
 * 2. Apply smart client-side filtering based on job_city, job_state, job_country fields
 * 3. Handle various location formats (city, state, abbreviations, metro areas)
 * 4. Show users filtering statistics to maintain transparency
 * 
 * This ensures users only see jobs actually relevant to their location search.
 * 
 * API THROTTLING & CACHING
 * ========================
 * - 24-hour cache duration for search results
 * - Only one API call per unique search per 24 hours
 * - Idle detection prevents API calls when user is inactive (10+ minutes)
 * - No automatic refresh when user becomes active again
 * - Manual search triggers required for new API calls
 */

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuthSession } from '@/hooks/useAuthSession'
import { Job } from '@/types/job'
import { filterJobs, sortJobs, capitalizeLocation } from '@/utils/jobUtils'
import { useSearchJobs } from '@/lib/useSearchJobs'
import { useJobTracker } from '@/lib/useJobApplications'
import JobCard from '@/components/JobCard'
import ApiSetupGuide from '@/components/ApiSetupGuide'
import {
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  UserIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { signOut } from 'next-auth/react';
// import ThemeSelector from '@/components/ThemeSelector'
import Header from '@/components/Header'

type SortOption = 'relevance' | 'date' | 'salary' | 'company'
type ViewMode = 'grid' | 'list'

function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useAuthSession()
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [showApiGuide, setShowApiGuide] = useState(false)
  const [userPreferences, setUserPreferences] = useState<any>(null)

  // Use the new search hook
  const {
    jobs,
    filteredJobs: initialFilteredJobs,
    loading,
    dataSource,
    locationFilterResults,
    searchJobs,
    loadMoreJobs,
    hasMorePages,
    totalCount,
    clearCache,
    cacheStats,
    isUserIdle,
    currentCacheEntry,
    allCacheEntries
  } = useSearchJobs()

  // Use job applications hook
  const {
    applications,
    applyToJob,
    updateApplicationStatus,
    loading: applicationsLoading
  } = useJobTracker()

  // Enhanced filter states
  const [filters, setFilters] = useState({
    remote: false,
    salaryMin: '',
    salaryMax: '',
    employmentTypes: [] as string[],
    datePosted: 'all',
    experience: 'all',
    skills: [] as string[],
    companySize: [] as string[],
    schedule: [] as string[]
  })

  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [inputQuery, setInputQuery] = useState('')
  const [inputLocation, setInputLocation] = useState('')
  const [radius, setRadius] = useState(25) // Default 25 mile radius
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false)
  


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [jobsPerPage] = useState(10) // Show 10 jobs per page
  const [displayedJobs, setDisplayedJobs] = useState<Job[]>([])
  const [filteredJobsForPagination, setFilteredJobsForPagination] = useState<Job[]>([])

  // Database search history state
  const [dbSearchHistory, setDbSearchHistory] = useState<Array<{
    id: string;
    query: string;
    location: string;
    radius: number;
    createdAt: Date;
    formattedTime: string;
  }>>([])
  const [loadingSearchHistory, setLoadingSearchHistory] = useState(false)

  // Format search parameters from cache key
  const formatSearchParams = (searchParamsKey: string) => {
    const [query, location, radius] = searchParamsKey.split(':');
    const parts = [];
    
    if (query) parts.push(`"${query}"`);
    if (location) parts.push(`in ${location}`);
    if (radius && radius !== '25') parts.push(`(${radius}mi radius)`);
    
    const formattedText = parts.length > 0 ? parts.join(' ') : 'No search parameters';
    console.log(`📋 Formatting search params: "${searchParamsKey}" → "${formattedText}"`);
    return formattedText;
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  // Store current search URL for back navigation
  const storeCurrentSearchUrl = () => {
    if (typeof window !== 'undefined') {
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      sessionStorage.setItem('lastSearchUrl', currentUrl);
    }
  };

  // Get search parameters from URL
  useEffect(() => {
    // Don't update from URL if we're actively updating the URL ourselves
    if (isUpdatingUrl) {
      setIsUpdatingUrl(false)
      return
    }
    
    const query = searchParams.get('q') || ''
    const loc = searchParams.get('location') || ''
    const rad = searchParams.get('radius')
    setSearchQuery(query)
    setLocation(loc)
    setInputQuery(query)
    setInputLocation(loc) // This will now be the normalized location from URL
    if (rad) {
      setRadius(parseInt(rad))
    }
  }, [searchParams])

  // Debug cache entries
  useEffect(() => {
    console.log('🔍 Search History - allCacheEntries:', allCacheEntries.length, 'entries')
    allCacheEntries.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.searchParams} (${Math.floor((Date.now() - entry.timestamp) / 1000)}s old)`)
    })
  }, [allCacheEntries])

  // Note: Cache entries created before location normalization will show raw input
  // Users can click "Clear All Cache" to refresh with normalized location names

  // Load search history from database
  const loadSearchHistoryFromDB = async () => {
    if (!session?.user) return;
    
    setLoadingSearchHistory(true);
    try {
      const response = await fetch('/api/user/search-results');
      if (response.ok) {
        const data = await response.json();
        const historyEntries = data.searchResults.map((result: any) => ({
          id: result.id,
          query: result.query,
          location: result.location,
          radius: result.radius,
          createdAt: new Date(result.createdAt),
          formattedTime: formatTimestamp(new Date(result.createdAt).getTime())
        }));
        setDbSearchHistory(historyEntries);
        console.log('📋 Loaded search history from database:', historyEntries.length, 'entries');
      }
    } catch (error) {
      console.error('Error loading search history from database:', error);
    } finally {
      setLoadingSearchHistory(false);
    }
  };

  // Load search history when user is authenticated
  useEffect(() => {
    if (session?.user) {
      loadSearchHistoryFromDB();
    }
  }, [session]);

  // Debug search history rendering
  useEffect(() => {
    console.log('🔍 Search history state:', {
      dbSearchHistoryLength: dbSearchHistory.length,
      showSearchHistory,
      loadingSearchHistory
    });
  }, [dbSearchHistory, showSearchHistory, loadingSearchHistory]);

  // Debug total count
  useEffect(() => {
    console.log('🔍 Total count debug:', {
      totalCount,
      initialFilteredJobsLength: initialFilteredJobs.length,
      loading
    });
  }, [totalCount, initialFilteredJobs.length, loading]);



  // Reset to page 1 when starting a new search
  useEffect(() => {
    setCurrentPage(1);
  }, [initialFilteredJobs]);


  // Manual search trigger function
  const triggerSearch = () => {
    console.log('🔍 Triggering search with:', { inputQuery, inputLocation, radius })
    
    // Try to match the input to a suggestion for better location normalization
    const match = locationSuggestions.find(suggestion =>
      suggestion.toLowerCase() === inputLocation.toLowerCase() ||
      suggestion.toLowerCase().startsWith(inputLocation.toLowerCase()) ||
      suggestion.toLowerCase().includes(inputLocation.toLowerCase())
    )
    
    const normalizedLocation = match || inputLocation
    
    // Update state first
    setSearchQuery(inputQuery)
    setLocation(normalizedLocation)
    
    // Set flag to prevent URL parameter override
    setIsUpdatingUrl(true)
    
    // Update URL with current search parameters
    const params = new URLSearchParams()
    if (inputQuery) params.append('q', inputQuery)
    if (normalizedLocation) params.append('location', normalizedLocation)
    if (normalizedLocation && radius) params.append('radius', radius.toString())
    
    router.push(`/search?${params.toString()}`)
    
    // Also trigger search directly to ensure it works
    if (inputQuery || normalizedLocation) {
      console.log(`🔍 Executing search with normalized location: "${normalizedLocation}"`)
      searchJobs(inputQuery, normalizedLocation, radius)
    }
  }

  // Handle Enter key press to trigger search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Only do this for the location input
      if (e.currentTarget === document.activeElement && e.currentTarget instanceof HTMLInputElement && e.currentTarget.placeholder === 'Location...') {
        // Try to match the input to a suggestion (case-insensitive, partial or full)
        const match = locationSuggestions.find(suggestion =>
          suggestion.toLowerCase() === inputLocation.toLowerCase() ||
          suggestion.toLowerCase().startsWith(inputLocation.toLowerCase()) ||
          suggestion.toLowerCase().includes(inputLocation.toLowerCase())
        )
        if (match) {
          setInputLocation(match)
          setLocation(match)
          console.log(`📍 Location matched: "${inputLocation}" → "${match}"`)
          // Trigger search with normalized location
          setTimeout(() => {
            console.log(`🔍 Triggering search with matched location: "${match}"`)
            searchJobs(inputQuery, match, radius)
          }, 100)
        } else {
          setLocation(inputLocation)
          console.log(`📍 Using raw input: "${inputLocation}"`)
          // Trigger search with raw input
          setTimeout(() => {
            console.log(`🔍 Triggering search with raw location: "${inputLocation}"`)
            searchJobs(inputQuery, inputLocation, radius)
          }, 100)
        }
        setShowLocationSuggestions(false)
      } else {
        triggerSearch()
      }
    }
  }

  // Fetch location suggestions when user types
  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (inputLocation.length < 2) {
        setLocationSuggestions([])
        setShowLocationSuggestions(false)
        return
      }

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputLocation)}&limit=5&addressdetails=1&countrycodes=us,ca,gb,au`)
        const data = await response.json()
        
        const suggestions = data.map((item: any) => {
          const address = item.address
          const city = address.city || address.town || address.village || address.hamlet
          const state = address.state || address.region
          const country = address.country
          
          if (city && state) {
            return `${city}, ${state}`
          } else if (city) {
            return `${city}, ${country}`
          } else {
            return item.display_name.split(',').slice(0, 2).join(',')
          }
        }).filter((suggestion: string, index: number, array: string[]) => 
          array.indexOf(suggestion) === index // Remove duplicates
        )
        
        setLocationSuggestions(suggestions)
        setShowLocationSuggestions(suggestions.length > 0)
      } catch (error) {
        console.error('Error fetching location suggestions:', error)
        setLocationSuggestions([])
        setShowLocationSuggestions(false)
      }
    }

    const delayedFetch = setTimeout(fetchLocationSuggestions, 300)
    return () => clearTimeout(delayedFetch)
  }, [inputLocation])

  const handleLocationSelect = (suggestion: string) => {
    setInputLocation(suggestion)
    setLocation(suggestion)
    setShowLocationSuggestions(false)
    console.log(`📍 Location selected: "${suggestion}"`)
    // Trigger search when location is selected with normalized location
    setTimeout(() => {
      console.log(`🔍 Triggering search with selected location: "${suggestion}"`)
      searchJobs(inputQuery, suggestion, radius)
    }, 100)
  }

  // Close location suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.location-input-container')) {
        setShowLocationSuggestions(false)
      }
    }

    if (showLocationSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLocationSuggestions])

  // Close search history when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.search-history-container')) {
        setShowSearchHistory(false)
      }
    }

    if (showSearchHistory) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearchHistory])

  // Load user's saved jobs if authenticated
  useEffect(() => {
    if (session?.user) {
      loadSavedJobs()
    }
  }, [session])

  const loadSavedJobs = async () => {
    try {
      const response = await fetch('/api/user/saved-jobs?limit=1000')
      if (response.ok) {
        const data = await response.json()
        const savedJobIds = new Set<string>()
        data.savedJobs.forEach((saved: any) => {
          if (saved.jobId) {
            savedJobIds.add(saved.jobId)
          }
        })
        setSavedJobs(savedJobIds)
      }
    } catch (error) {
      console.error('Error loading saved jobs:', error)
    }
  }

  // Load user preferences if authenticated
  useEffect(() => {
    if (session?.user) {
      loadUserPreferences()
    }
  }, [session])

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      if (response.ok) {
        const data = await response.json()
        setUserPreferences(data.preferences)
      }
    } catch (error) {
      console.error('Error loading user preferences:', error)
    }
  }

  const applyUserPreferences = () => {
    if (userPreferences) {
      setFilters(prev => ({
        ...prev,
        remote: userPreferences.preferredRemote || false,
        salaryMin: userPreferences.preferredSalaryMin?.toString() || '',
        salaryMax: userPreferences.preferredSalaryMax?.toString() || '',
        skills: userPreferences.skills || [],
        employmentTypes: userPreferences.preferredJobTypes || [],
        companySize: userPreferences.preferredCompanySize || [],
        schedule: userPreferences.preferredSchedule || []
      }))
      
      // Apply location from preferences if not already set
      if (!location && userPreferences.location) {
        setLocation(userPreferences.location)
      }
    }
  }

  const saveCurrentSearch = async () => {
    if (!session?.user) return
    
    try {
      const searchData = {
        query: searchQuery,
        location: location,
        filters: filters
      }
      
      const response = await fetch('/api/user/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchData)
      })
      
      if (response.ok) {
        // Show success message
        console.log('Search saved successfully!')
      }
    } catch (error) {
      console.error('Error saving search:', error)
    }
  }

  // Load jobs using the new search hook
  useEffect(() => {
    // Only search if we have actual search parameters (not just empty strings from initial state)
    if (!searchQuery && !location) {
      return
    }

    // Use the new search hook to load jobs
    searchJobs(searchQuery, location, radius)

    // Track search in history if user is authenticated and search has content
    if (session?.user && (searchQuery || location)) {
      trackSearch()
      // Refresh search history after new search
      setTimeout(() => loadSearchHistoryFromDB(), 1000)
    }
  }, [searchQuery, location, radius, searchJobs, session])



  const trackSearch = async () => {
    try {
      await fetch('/api/user/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          location: location
        })
      })
    } catch (error) {
      console.error('Error tracking search:', error)
    }
  }

  // Apply filters and sorting to displayed jobs
  useEffect(() => {
    console.log('🔍 Updating displayed jobs:', {
      filteredJobsLength: filteredJobsForPagination.length,
      currentPage,
      jobsPerPage
    });
    
    // Update displayed jobs from filtered results
    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const jobsToShow = filteredJobsForPagination.slice(startIndex, endIndex);
    setDisplayedJobs(jobsToShow);
    
    console.log('🔍 Displayed jobs:', {
      totalFiltered: filteredJobsForPagination.length,
      displayed: jobsToShow.length,
      startIndex,
      endIndex
    });
  }, [filteredJobsForPagination, currentPage, jobsPerPage])

  const handleSaveJob = async (jobId: string) => {
    if (!session?.user) {
      setSaveMessage('Please sign in to save jobs')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    const isSaved = savedJobs.has(jobId)
    const job = jobs.find(j => j.job_id === jobId)

    if (!job) {
      setSaveMessage('Job not found')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    try {
      if (isSaved) {
        // Unsave job
        const response = await fetch(`/api/user/saved-jobs?jobId=${jobId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          const newSavedJobs = new Set(savedJobs)
          newSavedJobs.delete(jobId)
          setSavedJobs(newSavedJobs)
          setSaveMessage('Job removed from saved')
        } else {
          setSaveMessage('Error removing job')
        }
      } else {
        // Save job
        const response = await fetch('/api/user/saved-jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId: jobId,
            jobData: job,
          }),
        })

        if (response.ok) {
          const newSavedJobs = new Set(savedJobs)
          newSavedJobs.add(jobId)
          setSavedJobs(newSavedJobs)
          setSaveMessage('Job saved successfully!')
        } else {
          const errorData = await response.json()
          setSaveMessage(errorData.error || 'Error saving job')
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error)
      setSaveMessage('Error saving job')
    }

    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleApplyToJob = async (job: any) => {
    if (!session?.user) {
      setSaveMessage('Please sign in to apply to jobs')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    try {
      // Store job data for internal job detail pages
      await fetch('/api/jobs/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job })
      })

      await applyToJob(job.job_id, job, job.job_apply_link)
      setSaveMessage('Application tracked successfully!')
      
      // Open the application link in a new tab
      if (job.job_apply_link) {
        window.open(job.job_apply_link, '_blank')
      }
    } catch (error) {
      console.error('Error applying to job:', error)
      setSaveMessage(error instanceof Error ? error.message : 'Error applying to job')
    }

    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleUpdateApplicationStatus = async (jobId: string, status: string) => {
    try {
      let application = applications.find(app => app.jobId === jobId)
      
      if (!application && status === 'VIEWED') {
        // Create a new application record for VIEWED status
        const job = initialFilteredJobs.find(j => j.job_id === jobId)
        if (job) {
          await applyToJob(jobId, job, job.job_apply_link)
          application = applications.find(app => app.jobId === jobId)
        }
      }
      
      if (application) {
        await updateApplicationStatus(application.id, status as any)
        setSaveMessage('Application status updated!')
      }
    } catch (error) {
      console.error('Error updating application status:', error)
      setSaveMessage('Error updating application status')
    }

    setTimeout(() => setSaveMessage(''), 3000)
  }

  // Get application status for a job
  const getApplicationStatus = (jobId: string) => {
    const application = applications.find(app => app.jobId === jobId)
    return application?.status
  }

  const handleEmploymentTypeChange = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      employmentTypes: checked 
        ? [...prev.employmentTypes, type]
        : prev.employmentTypes.filter(t => t !== type)
    }))
  }

  const clearFilters = () => {
    setFilters({
      remote: false,
      salaryMin: '',
      salaryMax: '',
      employmentTypes: [],
      datePosted: 'all',
      experience: 'all',
      skills: [],
      companySize: [],
      schedule: []
    })
  }

  // Update filtered jobs for pagination when filters change
  useEffect(() => {
    let filtered = filterJobs(initialFilteredJobs, {
      remote: filters.remote || undefined,
      salaryMin: filters.salaryMin ? parseInt(filters.salaryMin) : undefined,
      salaryMax: filters.salaryMax ? parseInt(filters.salaryMax) : undefined,
      employmentTypes: filters.employmentTypes.length > 0 ? filters.employmentTypes : undefined,
      datePosted: filters.datePosted !== 'all' ? filters.datePosted : undefined,
      experience: filters.experience !== 'all' ? filters.experience : undefined
    })
    
    // Apply user's excluded job categories filter
    if (userPreferences?.excludedJobCategories?.length > 0) {
      try {
        // Inline filtering function to avoid webpack issues
        filtered = filtered.filter(job => {
          if (!job) return false;
          
          const searchText = [
            job.job_title || '',
            job.job_description || '',
            job.employer_name || '',
            ...(job.job_required_skills || []),
            ...(job.job_occupational_categories || [])
          ].join(' ').toLowerCase();

          // Check if any excluded category is found in the job
          return !userPreferences.excludedJobCategories.some((category: string) => {
            if (!category || typeof category !== 'string') return false;
            
            const categoryLower = category.toLowerCase().trim();
            if (!categoryLower) return false;
            
            try {
              // Use word boundaries to avoid false positives
              const regex = new RegExp(`\\b${categoryLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
              return regex.test(searchText);
            } catch (error) {
              console.warn('Error in excluded jobs regex:', error);
              return false;
            }
          });
        });
      } catch (error) {
        console.error('Error applying excluded job categories filter:', error)
        // Continue with unfiltered results if there's an error
      }
    }
    
    filtered = sortJobs(filtered, sortBy)
    setFilteredJobsForPagination(filtered)
  }, [initialFilteredJobs, filters, sortBy, userPreferences])
  
  const totalPages = Math.ceil(filteredJobsForPagination.length / jobsPerPage)
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-20">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          {searchQuery ? `Jobs for "${searchQuery}"` : (location ? `Jobs in ${capitalizeLocation(location)}` : 'Explore Job Opportunities')}
        </h1>
        
        {/* Search Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          {/* Intro blurb - always visible */}
          <div className="flex-1 min-w-0">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Search for jobs by title, skills, or company. Add a location to find opportunities near you, or browse remote positions. 
              Your search history is automatically saved for quick access.
            </p>
          </div>
          
          {/* Search inputs */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-end lg:flex-shrink-0">
            <div className="relative flex-1 sm:flex-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Refine search..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-56 lg:w-64 bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="relative flex-1 sm:flex-none location-input-container">
              <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Location..."
                value={inputLocation}
                onChange={(e) => setInputLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowLocationSuggestions(locationSuggestions.length > 0)}
                className="pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-44 lg:w-48 bg-background text-foreground placeholder:text-muted-foreground"
              />
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-input rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleLocationSelect(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-muted focus:bg-muted text-sm text-foreground border-b border-muted last:border-b-0"
                    >
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground mr-2" />
                        {suggestion}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Radius Selector */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="pl-3 pr-8 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-background text-foreground w-full sm:w-32 lg:w-36"
              >
                <option value={5}>Within 5 miles</option>
                <option value={10}>Within 10 miles</option>
                <option value={15}>Within 15 miles</option>
                <option value={25}>Within 25 miles</option>
                <option value={35}>Within 35 miles</option>
                <option value={50}>Within 50 miles</option>
                <option value={75}>Within 75 miles</option>
                <option value={100}>Within 100 miles</option>
              </select>
            </div>
            <button
              onClick={triggerSearch}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>
        </div>
        
        {/* Save Message */}
        {saveMessage && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
            {saveMessage}
          </div>
        )}

        {/* Search History Dropdown */}
        <div className="mb-6 search-history-container">
          <div className="relative">
            <button
              onClick={() => setShowSearchHistory(!showSearchHistory)}
              className="w-full bg-card rounded-xl shadow-sm border border-input p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              aria-expanded={showSearchHistory}
              aria-haspopup="listbox"
              aria-label="Search history dropdown"
            >
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                <span className="text-sm font-semibold text-foreground">
                  Search History ({dbSearchHistory.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isUserIdle && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-xs">Idle</span>
                  </div>
                )}
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${showSearchHistory ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            {showSearchHistory && (
              <div 
                className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl shadow-lg border border-input z-10 max-h-64 overflow-y-auto"
                role="listbox"
                aria-label="Search history list"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className="p-2">
                  {dbSearchHistory.length > 0 ? (
                    <ul className="space-y-1" role="list">
                      {dbSearchHistory.map((entry, index) => {
                        const searchParamsText = formatSearchParams(`${entry.query}:${entry.location}:${entry.radius}`);
                        const isCurrent = currentCacheEntry && 
                          currentCacheEntry.searchParams === `${entry.query}:${entry.location}:${entry.radius}`;
                        
                        return (
                          <li 
                            key={entry.id} 
                            className={`p-2 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${isCurrent ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-muted'}`} 
                            role="listitem"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              // Update form fields
                              setInputQuery(entry.query);
                              setInputLocation(entry.location);
                              setRadius(entry.radius);
                              setSearchQuery(entry.query);
                              setLocation(entry.location);
                              
                              // Update URL with normalized location
                              const params = new URLSearchParams();
                              if (entry.query) params.append('q', entry.query);
                              if (entry.location) params.append('location', entry.location);
                              if (entry.radius) params.append('radius', entry.radius.toString());
                              router.push(`/search?${params.toString()}`);
                              
                              // Force a fresh search by clearing cache first
                              clearCache();
                              searchJobs(entry.query, entry.location, entry.radius);
                              
                              // Close dropdown
                              setShowSearchHistory(false);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-foreground text-sm">
                                  {searchParamsText}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {entry.formattedTime}
                                </div>
                              </div>
                              {isCurrent && (
                                <div className="ml-2 text-xs text-primary font-medium">
                                  Current
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : loadingSearchHistory ? (
                    <div className="p-3 rounded-lg bg-muted/30 border border-muted">
                      <div className="font-medium text-foreground text-sm">
                        Loading search history...
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-muted/30 border border-muted">
                      <div className="font-medium text-foreground text-sm">
                        No search history
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Your searches will appear here
                      </div>
                    </div>
                  )}
                  
                  {cacheStats.size > 0 && (
                    <div className="mt-2 pt-2 border-t border-muted">
                      <button
                        onClick={() => {
                          clearCache();
                          loadSearchHistoryFromDB();
                        }}
                        className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                        title="Clear search cache"
                      >
                        Clear All Cache
                      </button>
                    </div>
                  )}
                  
                  {dbSearchHistory.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-muted">
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/user/search-results', {
                              method: 'DELETE'
                            });
                            
                            if (response.ok) {
                              const data = await response.json();
                              console.log('🗑️ Search history cleared:', data.message);
                              setDbSearchHistory([]); // Clear local state
                              setShowSearchHistory(false); // Close dropdown
                            } else {
                              console.error('Failed to clear search history');
                            }
                          } catch (error) {
                            console.error('Error clearing search history:', error);
                          }
                        }}
                        className="w-full text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-2 rounded transition-colors"
                        title="Clear search history"
                      >
                        Clear Search History
                      </button>
                    </div>
                  )}
                  

                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Filtering Notification */}
        {locationFilterResults?.applied && location && locationFilterResults.filteredCount === 0 && locationFilterResults.originalCount > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <MapPinIcon className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800">
                  API Location Filtering Issue Detected
                </h3>
                <div className="mt-1 text-sm text-amber-700">
                  <p className="mb-2">
                    Found <strong>{locationFilterResults.originalCount} jobs</strong> from the API, but <strong>none actually match {capitalizeLocation(location)}</strong>. 
                    This suggests the job search API is not properly filtering by location.
                  </p>
                  <div className="flex space-x-4 mt-3">
                    <button
                      onClick={() => {
                        const newLocation = '';
                        const newUrl = new URL(window.location.href);
                        newUrl.searchParams.delete('location');
                        window.history.pushState({}, '', newUrl.toString());
                        router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
                      }}
                      className="text-amber-800 hover:text-amber-900 font-medium underline"
                    >
                      Search Without Location
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-amber-600">
                    <strong>Tip:</strong> Consider upgrading to a better job search API like Adzuna for accurate location filtering.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between bg-card rounded-xl shadow-sm border border-input p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5" />
              <span className="font-medium text-foreground">Filters</span>
            </div>
            <ChevronDownIcon className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-card rounded-xl shadow-sm border border-input p-6 lg:sticky lg:top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              </div>

              {/* Remote Work */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.remote}
                    onChange={(e) => setFilters(prev => ({ ...prev, remote: e.target.checked }))}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">Remote only</span>
                </label>
              </div>

              {/* User Preferences Quick Apply */}
              {session?.user && userPreferences && (
                <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center space-x-2 mb-3">
                    <UserIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Your Preferences</span>
                  </div>
                  <button
                    onClick={applyUserPreferences}
                    className="w-full bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors"
                  >
                    Apply My Preferences
                  </button>
                </div>
              )}

              {/* Save Search */}
              {session?.user && (
                <div className="mb-6">
                  <button
                    onClick={saveCurrentSearch}
                    className="w-full flex items-center justify-center space-x-2 bg-muted text-foreground px-3 py-2 rounded-md text-sm hover:bg-muted/80 transition-colors"
                  >
                    <BookmarkIcon className="h-4 w-4" />
                    <span>Save Search</span>
                  </button>
                </div>
              )}

              {/* Salary Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Salary Range</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.salaryMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, salaryMin: e.target.value }))}
                    className="px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.salaryMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, salaryMax: e.target.value }))}
                    className="px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Date Posted */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Date Posted</h4>
                <select
                  value={filters.datePosted}
                  onChange={(e) => setFilters(prev => ({ ...prev, datePosted: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                >
                  <option value="all">Any time</option>
                  <option value="day">Past 24 hours</option>
                  <option value="week">Past week</option>
                  <option value="month">Past month</option>
                </select>
              </div>

              {/* Employment Type */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Employment Type</h4>
                <div className="space-y-2">
                  {['FULLTIME', 'PARTTIME', 'CONTRACT', 'INTERNSHIP'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.employmentTypes.includes(type)}
                        onChange={(e) => handleEmploymentTypeChange(type, e.target.checked)}
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-muted-foreground capitalize">
                        {type.toLowerCase().replace('fulltime', 'Full-time').replace('parttime', 'Part-time')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>Advanced Filters</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </button>

                {showAdvancedFilters && (
                  <div className="mt-4 space-y-6">
                    {/* Experience Level */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3">Experience Level</h4>
                      <select
                        value={filters.experience}
                        onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                        className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      >
                        <option value="all">Any level</option>
                        <option value="entry">Entry Level</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior Level</option>
                        <option value="executive">Executive</option>
                      </select>
                    </div>

                    {/* Company Size */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3">Company Size</h4>
                      <div className="space-y-2">
                        {['Startup (1-50)', 'Small (51-200)', 'Medium (201-1000)', 'Large (1001-5000)', 'Enterprise (5000+)'].map(size => (
                          <label key={size} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.companySize.includes(size)}
                              onChange={(e) => {
                                const newArray = e.target.checked
                                  ? [...filters.companySize, size]
                                  : filters.companySize.filter(s => s !== size)
                                setFilters(prev => ({ ...prev, companySize: newArray }))
                              }}
                              className="rounded border-input text-primary focus:ring-primary"
                            />
                            <span className="ml-2 text-sm text-muted-foreground">{size}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 mt-6 lg:mt-0">
            {/* Results header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                {/* Summary Text */}
                <p className="text-muted-foreground text-sm">
                  {(() => {
                    const displayCount = initialFilteredJobs.length === 0 && !loading ? 0 : (totalCount > 0 ? totalCount : initialFilteredJobs.length);
                    console.log('🔍 Results count debug:', {
                      initialFilteredJobsLength: initialFilteredJobs.length,
                      totalCount,
                      loading,
                      displayCount
                    });
                    return `${displayCount} results`;
                  })()}
                  {isUserIdle && ' • Idle mode (API calls disabled)'}
                </p>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-muted-foreground">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-1 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Most recent</option>
                    <option value="salary">Highest salary</option>
                    <option value="company">Company A-Z</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-muted text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-muted text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Results content */}
            <div className="min-h-[400px]">
              {initialFilteredJobs.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {locationFilterResults?.applied && locationFilterResults.filteredCount === 0 && locationFilterResults.originalCount > 0
                        ? `No jobs found in ${capitalizeLocation(location)}`
                        : "No jobs found"
                      }
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {locationFilterResults?.applied && locationFilterResults.filteredCount === 0 && locationFilterResults.originalCount > 0
                        ? `We found ${locationFilterResults.originalCount} jobs for "${searchQuery}", but none were located in ${capitalizeLocation(location)}.`
                        : "Try adjusting your search criteria or filters"
                      }
                    </p>
                    
                    {locationFilterResults?.applied && locationFilterResults.filteredCount === 0 && locationFilterResults.originalCount > 0 && (
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                          onClick={() => {
                            // This functionality is no longer needed since we removed the local filteredJobs state
                          }}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Show All {locationFilterResults.originalCount} Jobs
                        </button>
                        <button
                          onClick={() => {
                            router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
                          }}
                          className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          Remove Location Filter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
                  {displayedJobs.map(job => (
                    <JobCard
                      key={job.job_id}
                      job={job}
                      isSaved={savedJobs.has(job.job_id)}
                      onSave={handleSaveJob}
                      applicationStatus={getApplicationStatus(job.job_id)}
                      onUpdateApplicationStatus={handleUpdateApplicationStatus}
                      showMatchScore={true}
                      className={viewMode === 'list' ? 'lg:flex lg:space-x-6' : ''}
                      onNavigate={storeCurrentSearchUrl}
                    />
                  ))}
                  
                  {/* Pagination */}
                  {initialFilteredJobs.length > 0 && (
                    <div className="mt-8">
                      {/* Client-side pagination for loaded jobs */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2 mb-4">
                          <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm border border-input rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          
                          {/* Page numbers */}
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => goToPage(pageNum)}
                                  className={`px-3 py-2 text-sm rounded-lg ${
                                    currentPage === pageNum
                                      ? 'bg-primary text-primary-foreground'
                                      : 'border border-input hover:bg-muted'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm border border-input rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      )}
                      
                      {/* Load all remaining results from API */}
                      {hasMorePages && currentPage === totalPages && (
                        <div className="text-center">
                          <button 
                            onClick={loadMoreJobs}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
                          >
                            Load All Results
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ApiSetupGuide
        isVisible={showApiGuide}
        onClose={() => setShowApiGuide(false)}
      />
    </div>
  );
}

// Suspense wrapper component
function SearchPageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg shadow p-6">
                <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted/70 rounded w-3/4"></div>
                  <div className="h-4 bg-muted/70 rounded w-1/2"></div>
                  <div className="h-4 bg-muted/70 rounded w-2/3"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg shadow p-6">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted/70 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted/70 rounded w-full"></div>
                      <div className="h-4 bg-muted/70 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPageWithSuspense() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPage />
    </Suspense>
  );
}