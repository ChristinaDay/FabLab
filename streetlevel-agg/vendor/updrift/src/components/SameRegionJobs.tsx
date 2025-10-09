'use client'
import { useState, useEffect } from 'react'
import { Job } from '@/types/job'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { formatSalaryRange, formatJobLocation, formatJobPostedDate, getCompanyLogoUrl, validateLogoUrl, formatJobLocationForSearch } from '@/utils/jobUtils'
import Link from 'next/link'

interface SameRegionJobsProps {
  currentJob: Job
  maxJobs?: number
}

export default function SameRegionJobs({ currentJob, maxJobs = 4 }: SameRegionJobsProps) {
  const [sameRegionJobs, setSameRegionJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validLogos, setValidLogos] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchSameRegionJobs = async () => {
      try {
        setLoading(true)
        const jobTitle = currentJob.job_title
        const location = currentJob.job_city || currentJob.job_country || ''
        
        if (!location) {
          setLoading(false)
          return
        }

        // Use the same search that brought the user to this job
        // Extract the most relevant keywords from the job title
        const titleWords = jobTitle.toLowerCase().split(' ').filter(word => 
          word.length > 2 && !['the', 'and', 'or', 'for', 'with', 'in', 'at', 'to', 'of', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being'].includes(word)
        )
        
        // Use the first 2-3 meaningful words as the search query
        const searchQuery = titleWords.length >= 2 
          ? titleWords.slice(0, 3).join(' ')
          : jobTitle.toLowerCase().split(' ').slice(0, 2).join(' ')
        
        console.log('🔍 SameRegionJobs - Using search query:', searchQuery);
        console.log('🔍 SameRegionJobs - Location:', `${currentJob.job_city}, ${currentJob.job_state}`);

        if (!searchQuery) {
          setLoading(false)
          return
        }

        // Use the same search query but in the same location
        const searchStrategies = [
          // Strategy 1: Same search query + same location
          { query: searchQuery, location: `${currentJob.job_city}, ${currentJob.job_state}` },
          // Strategy 2: Full job title + same location
          { query: jobTitle, location: `${currentJob.job_city}, ${currentJob.job_state}` },
          // Strategy 3: Broader search in same location
          { query: titleWords[0] || searchQuery, location: `${currentJob.job_city}, ${currentJob.job_state}` }
        ]

        let allJobs: Job[] = []
        
        // Try each strategy until we get enough results
        for (const strategy of searchStrategies) {
          if (allJobs.length >= maxJobs * 3) break // Stop if we have enough candidates
          
          try {
            console.log('🔍 SameRegionJobs - Current job ID:', currentJob.job_id);
            const response = await fetch(`/api/jobs/search?query=${encodeURIComponent(strategy.query)}&location=${encodeURIComponent(strategy.location)}&num_pages=1&excludeJobId=${encodeURIComponent(currentJob.job_id)}`)
            const data = await response.json()

            if (data.status === 'success' && data.data) {
              const newJobs = data.data.filter((job: Job) => 
                !allJobs.some(existingJob => existingJob.job_id === job.job_id)
              )
              allJobs = [...allJobs, ...newJobs]
            }
          } catch (err) {
            console.error('Error with search strategy:', err)
          }
        }

        if (allJobs.length === 0) {
          setError('No jobs found in the same region')
        } else {
          const filteredJobs = allJobs.filter((job: Job) => {
            // Skip the current job
            if (job.job_id === currentJob.job_id) return false;
            
            // Get location info from current job
            const currentCity = currentJob.job_city?.toLowerCase().trim();
            const currentState = currentJob.job_state?.toLowerCase().trim();
            const currentCountry = currentJob.job_country?.toLowerCase().trim();
            
            // Get location info from candidate job
            const jobCity = job.job_city?.toLowerCase().trim();
            const jobState = job.job_state?.toLowerCase().trim();
            const jobCountry = job.job_country?.toLowerCase().trim();
            
            // More flexible location matching
            const cityMatch = currentCity && jobCity && (
              currentCity === jobCity ||
              jobCity.includes(currentCity) ||
              currentCity.includes(jobCity)
            );
            
            const stateMatch = currentState && jobState && (
              currentState === jobState ||
              jobState.includes(currentState) ||
              currentState.includes(jobState)
            );
            
            const countryMatch = currentCountry && jobCountry && (
              currentCountry === jobCountry ||
              jobCountry.includes(currentCountry) ||
              currentCountry.includes(jobCountry)
            );
            
            // Return true if any location level matches
            return cityMatch || stateMatch || countryMatch;
          });

          if (filteredJobs.length === 0) {
            setError('No jobs found in the same region')
          } else {
            const finalJobs = filteredJobs.slice(0, maxJobs)
            setSameRegionJobs(finalJobs)
            
            // Store same region jobs in database for job detail pages
            const storeSameRegionJobs = async () => {
              for (const job of finalJobs) {
                try {
                  await fetch('/api/jobs/store', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ job })
                  })
                } catch (err) {
                  console.error('Error storing same region job:', job.job_id, err)
                }
              }
            }
            
            // Validate logos for the jobs we're showing
            const validateLogos = async () => {
              const validLogosSet = new Set<string>()
              
              for (const job of finalJobs) {
                const logoUrl = getCompanyLogoUrl(job.employer_name, job.employer_website)
                if (logoUrl) {
                  try {
                    const isValid = await validateLogoUrl(logoUrl)
                    if (isValid) {
                      validLogosSet.add(job.job_id)
                    }
                  } catch (err) {
                    console.error('Error validating logo for job:', job.job_id, err)
                  }
                }
              }
              
              setValidLogos(validLogosSet)
            }
            
            // Run both operations in parallel
            Promise.all([storeSameRegionJobs(), validateLogos()])
          }
        }
      } catch (err) {
        console.error('Error fetching same region jobs:', err)
        setError('Failed to load same region jobs')
      } finally {
        setLoading(false)
      }
    }

    if (currentJob) {
      fetchSameRegionJobs()
    }
  }, [currentJob, maxJobs])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jobs in {currentJob.job_city || currentJob.job_state || currentJob.job_country}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: maxJobs }).map((_, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || sameRegionJobs.length === 0) {
    console.log('SameRegionJobs: No jobs to display', { error, sameRegionJobsLength: sameRegionJobs.length });
    return null // Don't show anything if no same region jobs found
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobs in {currentJob.job_city || currentJob.job_state || currentJob.job_country}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sameRegionJobs.map((job) => {
            const generatedLogoUrl = getCompanyLogoUrl(job.employer_name, job.employer_website)
            
            return (
              <Link
                key={job.job_id}
                href={`/jobs/${job.job_publisher.toLowerCase()}-${job.job_id}`}
                className="block group"
              >
                <Card className="h-full hover:shadow-md transition-shadow relative">
                  <CardContent className="p-4">
                    {/* Job Info Container */}
                    <div className="w-full">
                      {/* Title and Company - Flexible to scoot over when logo appears */}
                      <div className={`${generatedLogoUrl && validLogos.has(job.job_id) ? 'ml-14 sm:ml-16' : ''}`}>
                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {job.job_title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {job.employer_name}
                        </p>
                      </div>
                      
                      {/* Data Points - Always take full width */}
                      <div className="w-full">
                        {/* Location */}
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <MapPinIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{formatJobLocation(job)}</span>
                        </div>

                        {/* Salary - Only show if available */}
                        {job.job_min_salary && job.job_max_salary && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <CurrencyDollarIcon className="w-3 h-3 flex-shrink-0" />
                            <span>{formatSalaryRange(job.job_min_salary, job.job_max_salary, job.job_salary_currency)}</span>
                          </div>
                        )}

                        {/* Posted Date */}
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <ClockIcon className="w-3 h-3 flex-shrink-0" />
                          <span>{formatJobPostedDate(job.job_posted_at_timestamp.toString())}</span>
                        </div>
                      </div>
                    </div>

                    {/* Company Logo - Positioned absolutely to not affect layout */}
                    {generatedLogoUrl && (
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                        <img 
                          src={generatedLogoUrl} 
                          alt={job.employer_name}
                          className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                          onError={(e) => {
                            // If image fails to load, hide the entire container
                            const parentElement = e.currentTarget.parentElement
                            if (parentElement) {
                              parentElement.style.display = 'none'
                            }
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
        
        {/* View All Same Region Jobs Button */}
        {sameRegionJobs.length > 0 && (
          <div className="pt-3 border-t border-border/50 mt-4">
            <Link
              href={`/search?query=${encodeURIComponent(currentJob.job_title)}&location=${encodeURIComponent(formatJobLocationForSearch(currentJob))}`}
              className="block"
            >
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                View All Jobs in {formatJobLocationForSearch(currentJob) || currentJob.job_country}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 