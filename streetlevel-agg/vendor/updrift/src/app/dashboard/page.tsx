'use client'

import { signOut } from 'next-auth/react'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookmarkIcon, MagnifyingGlassIcon, UserIcon, SparklesIcon, PaperAirplaneIcon, BriefcaseIcon, CheckCircleIcon, EyeIcon, ClockIcon, XCircleIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { capitalizeLocation } from '@/utils/jobUtils'
import ThemeToggle from '@/components/ThemeToggle'
import Header from '@/components/Header'

export default function Dashboard() {
  const { data: session, status } = useAuthSession()
  const router = useRouter()
  const [savedJobs, setSavedJobs] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    applied: 0,
    interviewing: 0,
    rejected: 0,
    hired: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Debug session state
  console.log('🔍 Dashboard session state:', { 
    status, 
    hasSession: !!session, 
    sessionUser: session?.user?.email,
    sessionUserId: session?.user?.id 
  })

  useEffect(() => {
    console.log('🔄 Dashboard useEffect - status changed:', status)
    if (status === 'unauthenticated') {
      console.log('❌ User unauthenticated, redirecting to signin')
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session) {
      console.log('✅ User authenticated, loading dashboard data')
      loadDashboardData()
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user) {
      loadDashboardData()
    }
  }, [session])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load search history
      const searchResponse = await fetch('/api/user/saved-searches')
      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        setSearchHistory(searchData.searches?.slice(0, 5) || []) // Show recent 5
      }

      // Load saved jobs
      const savedJobsResponse = await fetch('/api/user/saved-jobs?limit=5')
      if (savedJobsResponse.ok) {
        const savedJobsData = await savedJobsResponse.json()
        setSavedJobs(savedJobsData.savedJobs || [])
      }

      // Load application statistics
      const applicationsResponse = await fetch('/api/user/applications')
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json()
        const apps = applicationsData.applications || []
        setApplicationStats({
          total: apps.length,
          applied: apps.filter((app: any) => app.status === 'APPLIED').length,
          interviewing: apps.filter((app: any) => app.status === 'INTERVIEWING').length,
          rejected: apps.filter((app: any) => app.status === 'REJECTED').length,
          hired: apps.filter((app: any) => app.status === 'HIRED').length
        })
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    console.log('⏳ Dashboard loading...')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    console.log('❌ Dashboard: User unauthenticated, showing loading...')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    console.log('❌ Dashboard: No session found, returning null')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  console.log('✅ Dashboard: Session found, rendering dashboard')

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {session.user.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your job search
          </p>
        </div>

        {/* My Jobs Overview */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                <BriefcaseIcon className="h-6 w-6 text-primary mr-2" />
                My Jobs
              </h2>
              <p className="text-muted-foreground mt-1">
                Track your saved jobs and applications in one place
              </p>
            </div>
            <Link 
              href="/saved-jobs"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-background bg-primary hover:bg-primary/90"
            >
              View All Jobs
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Saved Jobs */}
            <div className="bg-background p-4 rounded-lg border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-secondary rounded-lg">
                  <BookmarkSolidIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Saved Jobs</p>
                  <p className="text-2xl font-bold text-foreground">{savedJobs.length}</p>
                </div>
              </div>
            </div>

            {/* Applied */}
            <div className="bg-background p-4 rounded-lg border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PaperAirplaneIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Applied</p>
                  <p className="text-2xl font-bold text-foreground">{applicationStats.applied}</p>
                </div>
              </div>
            </div>

            {/* Interviewing */}
            <div className="bg-background p-4 rounded-lg border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Interviewing</p>
                  <p className="text-2xl font-bold text-foreground">{applicationStats.interviewing}</p>
                </div>
              </div>
            </div>

            {/* Hired */}
            <div className="bg-background p-4 rounded-lg border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrophyIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">Hired</p>
                  <p className="text-2xl font-bold text-foreground">{applicationStats.hired}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Search</h3>
            <p className="text-muted-foreground mb-4">Find your next opportunity</p>
            <Link 
              href="/search"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-background bg-primary hover:bg-primary/90"
            >
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              Search Jobs
            </Link>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Profile Settings</h3>
            <p className="text-muted-foreground mb-4">Update your preferences and skills</p>
            <Link 
              href="/profile"
              className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-background hover:bg-muted"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </Link>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">APIhub</h3>
            <p className="text-muted-foreground mb-4">See all connected job APIs and their status</p>
            <Link 
              href="/apihub"
              className="inline-flex items-center px-4 py-2 border border-accent bg-accent text-accent-foreground text-sm font-semibold rounded-md shadow hover:brightness-110 transition"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              View API Sources
            </Link>
          </div>
        </div>

        {/* Recent Saved Jobs Section */}
        <div className="bg-card rounded-lg shadow-sm border border-border">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Recent Saved Jobs</h3>
              {savedJobs.length > 0 && (
                <Link 
                  href="/saved-jobs"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  View all saved jobs
                </Link>
              )}
            </div>
          </div>
          <div className="p-6">
            {savedJobs.length === 0 ? (
              <div className="text-center py-8">
                <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h4>
                <p className="text-gray-600 mb-4">
                  Start saving jobs you're interested in to keep track of them
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {savedJobs.map((savedJob: any, index: number) => (
                  <div key={savedJob.id || index} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="p-2 bg-secondary rounded-lg">
                        <BookmarkSolidIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {savedJob.jobData.job_title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {savedJob.jobData.employer_name}
                        </p>
                        <p className="text-xs text-muted">
                          Saved {new Date(savedJob.savedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/saved-jobs`}
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        View
                      </Link>
                      <Link
                        href={savedJob.jobData.job_apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-success hover:text-success/80 text-sm font-medium"
                      >
                        Apply
                      </Link>
                    </div>
                  </div>
                ))}
                
                {savedJobs.length >= 5 && (
                  <div className="text-center pt-4">
                    <Link
                      href="/saved-jobs"
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      View all saved jobs
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Search History */}
        <div className="mt-8 bg-card rounded-lg shadow-sm border border-border">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Recent Searches</h3>
              <Link 
                href="/search"
                className="text-sm text-primary hover:text-primary/80"
              >
                Start new search
              </Link>
            </div>
          </div>
          <div className="p-6">
            {searchHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlassIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-medium text-foreground mb-2">No searches yet</h4>
                <p className="text-muted-foreground mb-4">
                  Start searching for jobs to see your activity here
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
                >
                  Start Searching
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {searchHistory.map((search: any, index: number) => (
                  <div key={search.id || index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-accent rounded-lg">
                        <MagnifyingGlassIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {search.query || 'All jobs'}
                          {search.location && ` in ${capitalizeLocation(search.location)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(search.searchedAt).toLocaleDateString()} at{' '}
                          {new Date(search.searchedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/search?${new URLSearchParams({
                        ...(search.query && { q: search.query }),
                        ...(search.location && { location: search.location })
                      }).toString()}`}
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      Search again
                    </Link>
                  </div>
                ))}
                {searchHistory.length >= 5 && (
                  <div className="text-center pt-4">
                    <Link
                      href="/profile"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      View all search history
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 