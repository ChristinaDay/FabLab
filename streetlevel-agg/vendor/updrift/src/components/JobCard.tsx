'use client'

import { Job } from '@/types/job'
import { 
  formatSalaryRange, 
  formatJobPostedDate, 
  formatJobLocation, 
  formatEmploymentType,
  truncateDescription,
  extractSkills,
  calculateJobMatchScore,
  getCompanyLogoUrl,
  capitalizeLocation
} from '@/utils/jobUtils'
import {
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BookmarkIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  ComputerDesktopIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  EyeIcon,
  UserGroupIcon,
  XCircleIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Global logo statistics tracking
declare global {
  interface Window {
    logoStats?: {
      totalJobs: number
      jobsWithLogos: number
      jobsWithoutLogos: number
      companiesWithoutLogos: Set<string>
    }
    getLogoStats?: () => {
      totalJobs: number
      jobsWithLogos: number
      jobsWithoutLogos: number
      companiesWithoutLogos: Set<string>
    } | null
  }
}

if (typeof window !== 'undefined') {
  if (!window.logoStats) {
    window.logoStats = {
      totalJobs: 0,
      jobsWithLogos: 0,
      jobsWithoutLogos: 0,
      companiesWithoutLogos: new Set()
    }
  }
  
  // Add global function to check logo stats
  if (!window.getLogoStats) {
    window.getLogoStats = () => {
      if (window.logoStats) {
        console.log('📊 CURRENT LOGO STATISTICS:', {
          totalJobs: window.logoStats.totalJobs,
          jobsWithLogos: window.logoStats.jobsWithLogos,
          jobsWithoutLogos: window.logoStats.jobsWithoutLogos,
          logoPercentage: Math.round((window.logoStats.jobsWithLogos / window.logoStats.totalJobs) * 100),
          companiesWithoutLogos: Array.from(window.logoStats.companiesWithoutLogos)
        })
        return window.logoStats
      }
      return null
    }
  }
}

interface JobCardProps {
  job: Job
  isSaved?: boolean
  onSave?: (jobId: string) => void
  onApply?: (job: Job) => void
  showMatchScore?: boolean
  className?: string
  applicationStatus?: 'APPLIED' | 'VIEWED' | 'INTERVIEWING' | 'REJECTED' | 'HIRED'
  onUpdateApplicationStatus?: (jobId: string, status: string) => void
  onNavigate?: () => void // Callback for when user navigates to job detail
}

export default function JobCard({ 
  job, 
  isSaved = false, 
  onSave, 
  onApply,
  showMatchScore = true,
  className = '',
  applicationStatus,
  onUpdateApplicationStatus,
  onNavigate
  }: JobCardProps) {
  

  const [imageError, setImageError] = useState(false)
  
  const skills = extractSkills(job)
  const matchScore = calculateJobMatchScore(job)
  
  // Logo logic: try API logo first, then generate from website/company name
  const apiLogoUrl = job.employer_logo || ''
  const generatedLogoUrl = getCompanyLogoUrl(job.employer_name, job.employer_website)
  const companyLogoUrl = apiLogoUrl || generatedLogoUrl || ''
  const hasRealLogo = !!(apiLogoUrl || generatedLogoUrl)





  const handleSave = () => {
    if (onSave) {
      onSave(job.job_id)
    }
  }

  const handleViewJob = async () => {
    if (onApply) {
      onApply(job)
    } else {
      // Mark job as viewed if we have the callback
      if (onUpdateApplicationStatus) {
        onUpdateApplicationStatus(job.job_id, 'VIEWED')
      }
      
      // Store job data for internal job detail pages
      try {
        await fetch('/api/jobs/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job })
        })
        console.log('✅ Stored job data for internal page:', job.job_id)
        
        // Small delay to ensure storage completes
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error('❌ Error storing job data:', error)
      }
      
      // Call navigation callback to store search context
      if (onNavigate) {
        onNavigate()
      }
      
      // Create composite job ID for internal routing
      const compositeJobId = `${job.job_publisher.toLowerCase()}-${job.job_id}`
      window.location.href = `/jobs/${compositeJobId}`
    }
  }

  const getApplicationStatusIcon = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return <CheckCircleIcon className="w-4 h-4 text-blue-600" />
      case 'VIEWED':
        return <EyeIcon className="w-4 h-4 text-yellow-600" />
      case 'INTERVIEWING':
        return <UserGroupIcon className="w-4 h-4 text-purple-600" />
      case 'REJECTED':
        return <XCircleIcon className="w-4 h-4 text-red-600" />
      case 'HIRED':
        return <TrophyIcon className="w-4 h-4 text-green-600" />
      default:
        return null
    }
  }

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'VIEWED':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'INTERVIEWING':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'HIRED':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <Card className={`rounded-2xl border-4 border-primary shadow-xl overflow-hidden bg-card h-full flex flex-col ${className}`}>
      {/* Top Holo Bar */}
      <div className="bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200 px-4 py-2 flex items-center justify-between">
        {/* Match Score Badge (like HP) */}
        {showMatchScore ? (
          <Badge variant="secondary" className="bg-green-100 text-green-700 font-bold px-3 py-1 text-base shadow-sm">
            <SparklesIcon className="w-4 h-4 mr-1" />
            {matchScore}% Match
          </Badge>
        ) : <div />}
        {/* Application Status Badge - exclude VIEWED since it's shown in the button */}
        {applicationStatus && !['VIEWED'].includes(applicationStatus) && (
          <Badge 
            variant="secondary" 
            className={`${getApplicationStatusColor(applicationStatus)} border font-medium px-3 py-1 text-sm shadow-sm flex items-center gap-1`}
          >
            {getApplicationStatusIcon(applicationStatus)}
            {applicationStatus}
          </Badge>
        )}
        {/* Save Button (star/ribbon style) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          className="text-yellow-500 hover:text-yellow-600 p-2 rounded-full border-2 border-yellow-300 bg-white/80 shadow-md"
          aria-label={isSaved ? 'Unsave job' : 'Save job'}
        >
          {isSaved ? (
            <BookmarkSolidIcon className="w-6 h-6 text-primary" />
          ) : (
            <BookmarkIcon className="w-6 h-6" />
          )}
        </Button>
      </div>
      <CardContent className="pt-0 pb-4 px-6 flex flex-col flex-1 mt-8">
        {/* Logo + Title Row */}
        <div className="flex items-center gap-4 mb-2">
          {/* Employer Logo - only show if real logo exists AND loads successfully */}
          {hasRealLogo && !imageError && (
            <div className="w-14 h-14 rounded-lg bg-white shadow border flex items-center justify-center overflow-hidden flex-shrink-0">
              <Image
                src={companyLogoUrl}
                alt={`${job.employer_name} logo`}
                width={56}
                height={56}
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            </div>
          )}
          {/* Title & Employer */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-extrabold text-foreground mb-1 line-clamp-2">
              {job.job_title}
            </h3>
            <p className="text-base text-muted-foreground font-medium mb-0 line-clamp-1">
              {job.employer_name}
            </p>
          </div>
        </div>
        {/* Meta Row (stat boxes) */}
        <div className="flex flex-wrap justify-start gap-2 mb-3">
          <div className="flex items-center gap-1 bg-muted/70 rounded-full px-3 py-1 text-sm">
            <MapPinIcon className="h-4 w-4" />
            <span className="font-medium">
              {job.job_city && job.job_state ? capitalizeLocation(`${job.job_city}, ${job.job_state}`) :
                job.job_city ? capitalizeLocation(job.job_city) :
                job.job_country || 'Location not specified'}
            </span>
          </div>
          {job.job_employment_type && (
            <div className="flex items-center gap-1 bg-muted/70 rounded-full px-3 py-1 text-sm">
              <BriefcaseIcon className="h-4 w-4" />
              <span>{job.job_employment_type}</span>
            </div>
          )}
          {job.job_is_remote && (
            <div className="flex items-center gap-1 bg-green-100 rounded-full px-3 py-1 text-sm text-green-700">
              <ComputerDesktopIcon className="h-4 w-4" />
              Remote
            </div>
          )}
        </div>
        {/* Description (flavor text) */}
        <div className="bg-muted/60 rounded-lg p-3 italic text-left text-sm mb-3 w-full">
          {truncateDescription(job.job_description, 200)}
        </div>
      </CardContent>
      {/* Footer: Salary, Badges, Apply button and info */}
      <div className="px-6 pb-4 mt-auto">
        {/* Salary */}
        {(job.job_min_salary || job.job_max_salary) && (
          <div className="flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 ring-2 ring-emerald-500 dark:ring-emerald-400/60 rounded-full px-3 py-1 shadow-lg mb-4">
            <CurrencyDollarIcon className="w-5 h-5 text-emerald-700 dark:text-emerald-400 mr-2 drop-shadow-lg" />
            <span className="text-emerald-800 dark:text-emerald-300 font-extrabold text-lg tracking-wide drop-shadow-lg">
              {formatSalaryRange(job.job_min_salary, job.job_max_salary, job.job_salary_currency, job.job_salary_period)}
            </span>
          </div>
        )}
        {/* Skills & Benefits (energy/abilities) */}
        {(skills.length > 0 || (job.job_benefits && job.job_benefits.length > 0)) && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {skills.slice(0, 6).map((skill, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 px-2 py-1 text-xs">
                {skill}
              </Badge>
            ))}
            {skills.length > 6 && (
              <Badge variant="outline" className="text-muted-foreground px-2 py-1 text-xs">
                +{skills.length - 6} more
              </Badge>
            )}
            {job.job_benefits && job.job_benefits.slice(0, 3).map((benefit, index) => (
              <Badge key={index} variant="secondary" className="bg-green-100 text-green-700 px-2 py-1 text-xs">
                {benefit}
              </Badge>
            ))}
            {job.job_benefits && job.job_benefits.length > 3 && (
              <Badge variant="outline" className="text-muted-foreground px-2 py-1 text-xs">
                +{job.job_benefits.length - 3} benefits
              </Badge>
            )}
          </div>
        )}
        <Button 
          onClick={handleViewJob} 
          className={`w-full font-bold text-lg flex items-center justify-center gap-2 ${
            applicationStatus === 'VIEWED'
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-2 border-yellow-300' 
              : applicationStatus && ['APPLIED', 'INTERVIEWING', 'REJECTED', 'HIRED'].includes(applicationStatus)
              ? 'bg-muted text-muted-foreground hover:bg-muted/80' 
              : 'bg-primary/90 hover:bg-primary'
          }`}
          disabled={applicationStatus && ['APPLIED', 'INTERVIEWING', 'REJECTED', 'HIRED'].includes(applicationStatus)}
        >

          {applicationStatus === 'VIEWED' ? (
            <>
              View Again
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </>
          ) : applicationStatus ? (
            <>
              {applicationStatus === 'APPLIED' && 'Applied'}
              {applicationStatus === 'INTERVIEWING' && 'Interviewing'}
              {applicationStatus === 'REJECTED' && 'Rejected'}
              {applicationStatus === 'HIRED' && 'Hired'}
            </>
          ) : (
            <>
              View Job
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </>
          )}
        </Button>
        <div className="text-xs text-muted-foreground text-left mt-2">
          <ClockIcon className="inline-block w-4 h-4 mr-1 align-text-bottom" />
          {formatJobPostedDate(job.job_posted_at_datetime_utc)}
          <span className="mx-1">•</span>
          via {job.job_publisher}
        </div>
      </div>
    </Card>
  )
} 