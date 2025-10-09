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

interface SimilarJobsProps {
  currentJob: Job
  maxJobs?: number
}

export default function SimilarJobs({ currentJob, maxJobs = 4 }: SimilarJobsProps) {
  const [similarJobs, setSimilarJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validLogos, setValidLogos] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchSimilarJobs = async () => {
      try {
        setLoading(true)
        
        // Use the same search that brought the user to this job
        const jobTitle = currentJob.job_title
        const location = currentJob.job_city || currentJob.job_country || ''
        
        console.log('🔍 SimilarJobs - Original job title:', jobTitle);
        
        // Create search query based on job title keywords
        const titleWords = jobTitle.toLowerCase().split(' ').filter(word => 
          word.length > 2 && !['the', 'and', 'or', 'for', 'with', 'in', 'at', 'to', 'of', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being'].includes(word)
        )
        
        console.log('🔍 SimilarJobs - Extracted keywords:', titleWords);
        
        // Use first 2-3 meaningful words from title, or fallback to full title if too short
        const searchQuery = titleWords.length >= 2 
          ? titleWords.slice(0, 3).join(' ')
          : jobTitle.toLowerCase().split(' ').slice(0, 2).join(' ')
        
        console.log('🔍 SimilarJobs - Generated search query:', searchQuery);
        
        if (!searchQuery || searchQuery.trim().length < 2) {
          setLoading(false)
          return
        }

        // Use the same search query but without location restriction (anywhere)
        const searchStrategies = [
          // Strategy 1: Same search query (anywhere)
          { query: searchQuery, location: '' },
          // Strategy 2: Broader search (anywhere)
          { query: titleWords[0] || searchQuery, location: '' }
        ]

        let allJobs: Job[] = []
        
        // Try each strategy until we get enough results
        for (const strategy of searchStrategies) {
          if (allJobs.length >= maxJobs * 2) break // Stop if we have enough candidates
          
          try {
                    // Create composite job ID for proper exclusion
        const compositeJobId = `${currentJob.job_publisher.toLowerCase()}-${currentJob.job_id}`;
        console.log('🔍 SimilarJobs - Current job ID:', currentJob.job_id);
        console.log('🔍 SimilarJobs - Composite job ID:', compositeJobId);
        console.log('🔍 SimilarJobs - Trying strategy:', strategy);
        const response = await fetch(`/api/jobs/search?query=${encodeURIComponent(strategy.query)}&location=${encodeURIComponent(strategy.location)}&num_pages=1&excludeJobId=${encodeURIComponent(compositeJobId)}`)
        const data = await response.json()

        console.log('🔍 SimilarJobs - API response:', { status: data.status, dataLength: data.data?.length || 0 });

        if (data.status === 'success' && data.data) {
          const newJobs = data.data.filter((job: Job) => {
            // Don't include if already in allJobs
            const alreadyExists = allJobs.some(existingJob => existingJob.job_id === job.job_id);
            // Don't include if it's the current job (double-check)
            const isCurrentJob = job.job_id === currentJob.job_id && job.job_publisher.toLowerCase() === currentJob.job_publisher.toLowerCase();
            return !alreadyExists && !isCurrentJob;
          })
          
          console.log('🔍 SimilarJobs - New jobs found:', newJobs.length);
          console.log('🔍 SimilarJobs - Filtered out current job:', data.data.length - newJobs.length - allJobs.filter(existing => data.data.some((job: Job) => job.job_id === existing.job_id)).length);
          allJobs = [...allJobs, ...newJobs]
        }
          } catch (err) {
            console.error('Error with search strategy:', err)
          }
        }

                  // Sort by title similarity with stricter criteria
          const sortedJobs = allJobs.sort((a, b) => {
            const currentWords = new Set(currentJob.job_title.toLowerCase().split(' '))
            const aWords = new Set(a.job_title.toLowerCase().split(' '))
            const bWords = new Set(b.job_title.toLowerCase().split(' '))
            
            const aOverlap = Array.from(currentWords).filter(word => aWords.has(word)).length
            const bOverlap = Array.from(currentWords).filter(word => bWords.has(word)).length
            
            // Also consider company similarity
            const aCompanyMatch = a.employer_name.toLowerCase() === currentJob.employer_name.toLowerCase() ? 5 : 0
            const bCompanyMatch = b.employer_name.toLowerCase() === currentJob.employer_name.toLowerCase() ? 5 : 0
            
            // Consider job requirements similarity
            const aSkills = a.job_required_skills || []
            const bSkills = b.job_required_skills || []
            const currentSkills = currentJob.job_required_skills || []
            
            const aSkillOverlap = aSkills.filter(skill => currentSkills.includes(skill)).length
            const bSkillOverlap = bSkills.filter(skill => currentSkills.includes(skill)).length
            
            // Check for key industry terms
            const currentTitle = currentJob.job_title.toLowerCase()
            const aTitle = a.job_title.toLowerCase()
            const bTitle = b.job_title.toLowerCase()
            
            const aIndustryMatch = (currentTitle.includes('marketing') && aTitle.includes('marketing')) ? 3 : 0
            const bIndustryMatch = (currentTitle.includes('marketing') && bTitle.includes('marketing')) ? 3 : 0
            
            const aSeniorityMatch = (currentTitle.includes('senior') && aTitle.includes('senior')) ? 2 : 0
            const bSeniorityMatch = (currentTitle.includes('senior') && bTitle.includes('senior')) ? 2 : 0
            
            // Calculate total similarity scores
            const aScore = aOverlap + aCompanyMatch + aSkillOverlap + aIndustryMatch + aSeniorityMatch
            const bScore = bOverlap + bCompanyMatch + bSkillOverlap + bIndustryMatch + bSeniorityMatch
            
            return bScore - aScore
          })

        // Final filter to absolutely ensure current job is not included
        const filteredSortedJobs = sortedJobs.filter(job => 
          !(job.job_id === currentJob.job_id && job.job_publisher.toLowerCase() === currentJob.job_publisher.toLowerCase())
        );

        if (filteredSortedJobs.length === 0) {
          setError('No similar jobs found')
        } else {
          const finalJobs = filteredSortedJobs.slice(0, maxJobs)
          console.log('🔍 SimilarJobs - Final jobs after all filtering:', finalJobs.length);
          console.log('🔍 SimilarJobs - First 3 job IDs:', finalJobs.slice(0, 3).map(job => `${job.job_publisher.toLowerCase()}-${job.job_id}`));
          setSimilarJobs(finalJobs)
          
          // Store similar jobs in database for job detail pages
          const storeSimilarJobs = async () => {
            for (const job of finalJobs) {
              try {
                await fetch('/api/jobs/store', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ job })
                })
              } catch (err) {
                console.error('Error storing similar job:', job.job_id, err)
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
          Promise.all([storeSimilarJobs(), validateLogos()])
        }
      } catch (err) {
        console.error('Error fetching similar jobs:', err)
        setError('Failed to load similar jobs')
      } finally {
        setLoading(false)
      }
    }

    if (currentJob) {
      fetchSimilarJobs()
    }
  }, [currentJob, maxJobs])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Similar Jobs</CardTitle>
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

  if (error || similarJobs.length === 0) {
    console.log('SimilarJobs: No jobs to display', { error, similarJobsLength: similarJobs.length });
    return null // Don't show anything if no similar jobs found
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Similar Jobs (Anywhere)</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {similarJobs.map((job) => {
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
        
        {/* View All Similar Jobs Button */}
        {similarJobs.length > 0 && (
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
                View All Similar Jobs (Anywhere)
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 