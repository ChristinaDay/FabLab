'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthSession } from '@/hooks/useAuthSession'
import { Job } from '@/types/job'
import { use } from 'react'
import { 
  formatSalaryRange, 
  formatJobPostedDate, 
  formatJobLocation, 
  formatEmploymentType,
  getCompanyLogoUrl,
  capitalizeLocation
} from '@/utils/jobUtils'
import {
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BookmarkIcon,
  ArrowTopRightOnSquareIcon,
  ComputerDesktopIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Header from '@/components/Header'
import SimilarJobs from '@/components/SimilarJobs'
import SameRegionJobs from '@/components/SameRegionJobs'

interface JobDetailPageProps {
  params: Promise<{ jobId: string }>
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { jobId } = use(params)
  const router = useRouter()
  const { data: session } = useAuthSession()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)
  const [application, setApplication] = useState<any>(null)
  const [previousSearchUrl, setPreviousSearchUrl] = useState<string>('/search')

  useEffect(() => {
    // Check if user came from a search page and store the search URL
    const checkPreviousSearch = () => {
      // First, check sessionStorage for stored search params
      const storedSearch = sessionStorage.getItem('lastSearchUrl')
      if (storedSearch) {
        setPreviousSearchUrl(storedSearch)
        return
      }

      // Fallback: check document.referrer
      if (typeof window !== 'undefined' && document.referrer) {
        const referrer = new URL(document.referrer)
        if (referrer.pathname === '/search' && referrer.search) {
          setPreviousSearchUrl(`/search${referrer.search}`)
          return
        }
      }

      // Default fallback
      setPreviousSearchUrl('/search')
    }

    checkPreviousSearch()

    const fetchJobDetail = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/jobs/${jobId}`)
        const data = await response.json()

        if (data.status === 'success') {
          setJob(data.data)
          
          // Fetch application status if user is authenticated
          if (session?.user) {
            try {
              const applicationsResponse = await fetch('/api/user/applications?limit=1000')
              if (applicationsResponse.ok) {
                              const applicationsData = await applicationsResponse.json()
              const application = applicationsData.applications.find((app: any) => app.jobId === data.data.job_id)
              if (application) {
                setApplicationStatus(application.status)
                setApplication(application)
              }
              }
            } catch (err) {
              console.error('Error fetching application status:', err)
            }
          }
        } else {
          setError(data.message || 'Failed to load job details')
        }
      } catch (err) {
        setError('Failed to load job details')
        console.error('Error fetching job detail:', err)
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJobDetail()
    }
  }, [jobId, session])

  const handleSaveJob = async () => {
    if (!session?.user?.email || !job) return

    try {
      const response = await fetch('/api/user/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.job_id,
          jobData: JSON.stringify(job)
        })
      })

      if (response.ok) {
        setIsSaved(true)
      }
    } catch (err) {
      console.error('Error saving job:', err)
    }
  }

  const handleApply = () => {
    if (job?.job_apply_link) {
      window.open(job.job_apply_link, '_blank', 'noopener,noreferrer')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-64 w-full mb-6" />
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div>
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || 'The job you are looking for could not be found.'}</p>
            <Button onClick={() => router.push(previousSearchUrl)}>Back to Search</Button>
          </div>
        </div>
      </div>
    )
  }

  const companyLogo = job.employer_logo || getCompanyLogoUrl(job.employer_name)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.push(previousSearchUrl)}
              className="bg-background text-foreground border-border hover:bg-muted hover:text-foreground"
            >
              ← Back to Search
            </Button>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Job Header */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {companyLogo && (
                      <div className="flex-shrink-0">
                        <Image
                          src={companyLogo}
                          alt={`${job.employer_name} logo`}
                          width={64}
                          height={64}
                          className="rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl sm:text-2xl font-bold break-words">
                          {job.job_title}
                        </CardTitle>
                        {applicationStatus === 'VIEWED' && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                            Last viewed {application?.updatedAt ? new Date(application.updatedAt).toLocaleDateString() : ''}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <BuildingOfficeIcon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{job.employer_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{formatJobLocation(job)}</span>
                        </div>
                        {job.job_is_remote && (
                          <Badge variant="secondary" className="flex-shrink-0">
                            <ComputerDesktopIcon className="h-3 w-3 mr-1" />
                            Remote
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4 flex-shrink-0" />
                          <span>Posted {formatJobPostedDate(job.job_posted_at_timestamp.toString())}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BriefcaseIcon className="h-4 w-4 flex-shrink-0" />
                          <span>{formatEmploymentType(job.job_employment_type)}</span>
                        </div>
                        {job.job_min_salary && job.job_max_salary && (
                          <div className="flex items-center gap-1">
                            <CurrencyDollarIcon className="h-4 w-4 flex-shrink-0" />
                            <span>{formatSalaryRange(job.job_min_salary, job.job_max_salary, job.job_salary_currency)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Job Description */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div 
                      className="whitespace-pre-wrap text-foreground break-words"
                      dangerouslySetInnerHTML={{ 
                        __html: job.job_description.replace(/\n/g, '<br>') 
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Job Highlights */}
              {job.job_highlights && Object.keys(job.job_highlights).length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Job Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(job.job_highlights).map(([category, items]) => (
                      <div key={category} className="mb-4">
                        <h4 className="font-semibold mb-2">{category}</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {items.map((item, index) => (
                            <li key={index} className="text-muted-foreground">{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Required Skills */}
              {job.job_required_skills && job.job_required_skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Required Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {job.job_required_skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="break-words">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4 lg:space-y-6">
              {/* Apply Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3 sm:space-y-4">
                    <Button 
                      onClick={handleApply}
                      className="w-full"
                      size="lg"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                      Apply on Company Site
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleSaveJob}
                      className="w-full"
                      disabled={isSaved}
                    >
                      {isSaved ? (
                        <>
                          <BookmarkSolidIcon className="h-4 w-4 mr-2" />
                          Saved
                        </>
                      ) : (
                        <>
                          <BookmarkIcon className="h-4 w-4 mr-2" />
                          Save Job
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold break-words">{job.employer_name}</h4>
                    <p className="text-sm text-muted-foreground">{formatJobLocation(job)}</p>
                  </div>
                  
                  {job.employer_website && (
                    <div className="flex items-center gap-2">
                      <GlobeAltIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a 
                        href={job.employer_website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        Company Website
                      </a>
                    </div>
                  )}

                  {job.job_benefits && job.job_benefits.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Benefits</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {job.job_benefits.map((benefit, index) => (
                          <li key={index}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-muted-foreground">Employment Type</span>
                    <span className="break-words">{formatEmploymentType(job.job_employment_type)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-muted-foreground">Location</span>
                    <span className="break-words">{formatJobLocation(job)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-muted-foreground">Posted</span>
                    <span>{formatJobPostedDate(job.job_posted_at_timestamp.toString())}</span>
                  </div>
                  {job.job_min_salary && job.job_max_salary && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-muted-foreground">Salary</span>
                      <span className="break-words">{formatSalaryRange(job.job_min_salary, job.job_max_salary, job.job_salary_currency)}</span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-muted-foreground">Source</span>
                    <span className="capitalize">{job.job_publisher}</span>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Job Suggestions - Full Width */}
          {job && (
            <div className="mt-8 space-y-8">
              {/* Same Region Jobs */}
              <SameRegionJobs currentJob={job} maxJobs={4} />
              
              {/* Similar Jobs (Anywhere) */}
              <SimilarJobs currentJob={job} maxJobs={4} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 