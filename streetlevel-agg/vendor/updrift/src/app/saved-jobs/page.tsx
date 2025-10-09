'use client'

import { useAuthSession } from '@/hooks/useAuthSession'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import JobCard from '@/components/JobCard'
import { 
  BookmarkIcon, 
  TrashIcon, 
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  CalendarIcon,
  CheckIcon,
  EyeIcon,
  ClockIcon,
  XCircleIcon,
  TrophyIcon,
  PlusIcon,
  ChartBarIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { 
  BookmarkIcon as BookmarkSolidIcon,
  CheckCircleIcon,
  EyeIcon as EyeSolidIcon,
  ClockIcon as ClockSolidIcon,
  XCircleIcon as XCircleSolidIcon,
  TrophyIcon as TrophySolidIcon
} from '@heroicons/react/24/solid'
import Header from '@/components/Header'
import { useJobTracker } from '@/lib/useJobApplications'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface SavedJob {
  id: string
  jobId: string
  jobData: any
  notes: string | null
  savedAt: string
}

interface ApplicationStats {
  total: number
  applied: number
  interviewing: number
  rejected: number
  hired: number
}

export default function SavedJobsPage() {
  const { data: session, status } = useAuthSession()
  const router = useRouter()
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [filteredJobs, setFilteredJobs] = useState<SavedJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesText, setNotesText] = useState('')
  const [message, setMessage] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'company'>('newest')
  
  // Job tracking states
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [applyJobData, setApplyJobData] = useState<any>(null)
  const [newStatus, setNewStatus] = useState<string>('APPLIED')
  const [editingApplication, setEditingApplication] = useState<string | null>(null)
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'saved' | 'tracker'>('saved')

  // Use job tracker hook
  const {
    applications,
    loading: applicationsLoading,
    error: applicationsError,
    applicationStatus,
    totalApplications,
    applyToJob,
    updateApplicationStatus,
    deleteApplication,
    refreshApplications
  } = useJobTracker(selectedStatus === 'all' ? undefined : selectedStatus)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      loadSavedJobs()
    }
  }, [session])

  useEffect(() => {
    filterAndSortJobs()
  }, [savedJobs, searchQuery, sortBy])

  const loadSavedJobs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/saved-jobs')
      if (response.ok) {
        const data = await response.json()
        setSavedJobs(data.savedJobs || [])
      }
    } catch (error) {
      console.error('Error loading saved jobs:', error)
      setMessage('Error loading saved jobs')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate application stats
  const stats: ApplicationStats = {
    total: totalApplications,
    applied: applicationStatus.APPLIED,
    interviewing: applicationStatus.INTERVIEWING,
    rejected: applicationStatus.REJECTED,
    hired: applicationStatus.HIRED
  }

  // Helper functions for job tracking
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'INTERVIEWING':
        return <ClockSolidIcon className="w-4 h-4" />
      case 'REJECTED':
        return <XCircleSolidIcon className="w-4 h-4" />
      case 'HIRED':
        return <TrophySolidIcon className="w-4 h-4" />
      default:
        return <BriefcaseIcon className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'bg-blue-100 text-blue-800'
      case 'INTERVIEWING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'HIRED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Check if a saved job has an application
  const getApplicationForJob = (jobId: string) => {
    return applications.find(app => app.jobId === jobId)
  }

  const filterAndSortJobs = () => {
    let filtered = savedJobs

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(savedJob => 
        savedJob.jobData.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        savedJob.jobData.employer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (savedJob.notes && savedJob.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Sort jobs
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        case 'oldest':
          return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime()
        case 'title':
          return a.jobData.job_title.localeCompare(b.jobData.job_title)
        case 'company':
          return a.jobData.employer_name.localeCompare(b.jobData.employer_name)
        default:
          return 0
      }
    })

    setFilteredJobs(filtered)
  }

  const handleUnsaveJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/user/saved-jobs?jobId=${jobId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSavedJobs(prev => prev.filter(job => job.jobId !== jobId))
        setMessage('Job removed from saved')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Error removing job')
      }
    } catch (error) {
      console.error('Error removing job:', error)
      setMessage('Error removing job')
    }
  }

  const handleUpdateNotes = async (savedJobId: string, notes: string) => {
    try {
      const response = await fetch(`/api/user/saved-jobs/${savedJobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      })

      if (response.ok) {
        setSavedJobs(prev => 
          prev.map(job => 
            job.id === savedJobId 
              ? { ...job, notes } 
              : job
          )
        )
        setMessage('Notes updated successfully')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error updating notes:', error)
      setMessage('Error updating notes')
    }
    setEditingNotes(null)
    setNotesText('')
  }

  // Job tracking action handlers
  const handleApplyToJob = async (jobData: any) => {
    try {
      await applyToJob(jobData.job_id, jobData, undefined, notesText)
      setMessage('Job application tracked successfully')
      setTimeout(() => setMessage(''), 3000)
      setShowApplyDialog(false)
      setApplyJobData(null)
      setNotesText('')
      setNewStatus('APPLIED')
    } catch (error) {
      console.error('Error applying to job:', error)
      setMessage('Error tracking job application')
    }
  }

  const handleUpdateApplicationStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      await updateApplicationStatus(applicationId, status as any, notes)
      setMessage('Application status updated successfully')
      setTimeout(() => setMessage(''), 3000)
      setEditingApplication(null)
      setNotesText('')
    } catch (error) {
      console.error('Error updating application status:', error)
      setMessage('Error updating application status')
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    try {
      await deleteApplication(applicationId)
      setMessage('Application deleted successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error deleting application:', error)
      setMessage('Error deleting application')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedJobs.size === 0) return

    try {
      const deletePromises = Array.from(selectedJobs).map(savedJobId => {
        const savedJob = savedJobs.find(job => job.id === savedJobId)
        return savedJob ? fetch(`/api/user/saved-jobs?jobId=${savedJob.jobId}`, {
          method: 'DELETE',
        }) : Promise.resolve()
      })

      await Promise.all(deletePromises)
      
      setSavedJobs(prev => prev.filter(job => !selectedJobs.has(job.id)))
      setSelectedJobs(new Set())
      setShowBulkActions(false)
      setMessage(`${selectedJobs.size} jobs removed from saved`)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error bulk deleting jobs:', error)
      setMessage('Error deleting jobs')
    }
  }

  const toggleJobSelection = (savedJobId: string) => {
    const newSelection = new Set(selectedJobs)
    if (newSelection.has(savedJobId)) {
      newSelection.delete(savedJobId)
    } else {
      newSelection.add(savedJobId)
    }
    setSelectedJobs(newSelection)
    setShowBulkActions(newSelection.size > 0)
  }

  const selectAllJobs = () => {
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set())
      setShowBulkActions(false)
    } else {
      setSelectedJobs(new Set(filteredJobs.map(job => job.id)))
      setShowBulkActions(true)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <BookmarkSolidIcon className="h-8 w-8 text-primary mr-3" />
            My Jobs
          </h1>
          <p className="text-muted-foreground mt-2">
            Save job opportunities and track your applications in one place
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'saved'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BookmarkSolidIcon className="h-5 w-5" />
                  <span>Saved Jobs ({savedJobs.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('tracker')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tracker'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BriefcaseIcon className="h-5 w-5" />
                  <span>Job Tracker ({totalApplications})</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 bg-accent border border-accent text-accent-foreground px-4 py-3 rounded-md">
            {message}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'saved' ? (
          <>
            {/* Saved Jobs Controls */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                {/* Search */}
                <div className="relative flex-1 max-w-lg">
                  <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search saved jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  {/* Sort */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-muted-foreground">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="title">Job Title</option>
                      <option value="company">Company</option>
                    </select>
                  </div>

                  {/* Bulk Actions */}
                  {savedJobs.length > 0 && (
                    <button
                      onClick={selectAllJobs}
                      className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-input rounded-lg hover:bg-accent"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      {selectedJobs.size === filteredJobs.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {showBulkActions && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {selectedJobs.size} job{selectedJobs.size !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center px-3 py-2 text-sm text-destructive hover:text-destructive-foreground border border-destructive rounded-lg hover:bg-destructive/10"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Jobs List */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <BookmarkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {savedJobs.length === 0 ? 'No saved jobs yet' : 'No jobs match your search'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {savedJobs.length === 0 
                    ? 'Start saving interesting job opportunities to keep track of them'
                    : 'Try adjusting your search terms'
                  }
                </p>
                {savedJobs.length === 0 && (
                  <Link
                    href="/search"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
                  >
                    Browse Jobs
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map(savedJob => {
                  const application = getApplicationForJob(savedJob.jobId)
                  return (
                    <div key={savedJob.id} className="relative pl-12">
                      {/* Selection Checkbox */}
                      <div className="absolute top-4 left-4 z-10">
                        <input
                          type="checkbox"
                          checked={selectedJobs.has(savedJob.id)}
                          onChange={() => toggleJobSelection(savedJob.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                        />
                      </div>
                      
                      {/* Minimal Job Card */}
                      <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">
                                <Link 
                                  href={`/jobs/${savedJob.jobData.job_publisher?.toLowerCase() || 'unknown'}-${savedJob.jobData.job_id}`}
                                  className="hover:text-primary hover:underline transition-colors cursor-pointer"
                                >
                                  {savedJob.jobData.job_title}
                                </Link>
                              </h3>
                              {application && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                                  {application.status}
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-2">
                              {savedJob.jobData.employer_name}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              {savedJob.jobData.location && (
                                <span className="flex items-center">
                                  <MapPinIcon className="h-4 w-4 mr-1" />
                                  {savedJob.jobData.location}
                                </span>
                              )}
                              {savedJob.jobData.salary_min && (
                                <span className="flex items-center">
                                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                  ${savedJob.jobData.salary_min.toLocaleString()}
                                  {savedJob.jobData.salary_max && ` - $${savedJob.jobData.salary_max.toLocaleString()}`}
                                </span>
                              )}
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Saved {new Date(savedJob.savedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {!application && (
                              <button
                                onClick={() => {
                                  setApplyJobData(savedJob.jobData)
                                  setShowApplyDialog(true)
                                }}
                                className="text-primary hover:text-primary/80 text-sm flex items-center space-x-1"
                              >
                                <PlusIcon className="h-4 w-4" />
                                <span>Track</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleUnsaveJob(savedJob.jobId)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Notes Section */}
                        <div className="border-t border-border pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                            <button
                              onClick={() => {
                                setEditingNotes(savedJob.id)
                                setNotesText(savedJob.notes || '')
                              }}
                              className="text-primary hover:text-primary/80 text-sm"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </div>
                          {editingNotes === savedJob.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={notesText}
                                onChange={(e) => setNotesText(e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                                rows={3}
                                placeholder="Add your notes about this job..."
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUpdateNotes(savedJob.id, notesText)}
                                  className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNotes(null)
                                    setNotesText('')
                                  }}
                                  className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-md hover:bg-muted/80"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {savedJob.notes || 'No notes added yet. Click the edit icon to add notes.'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Job Tracker Controls */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                {/* Search */}
                <div className="relative flex-1 max-w-lg">
                  <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  {/* Status Filter */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-muted-foreground">Status:</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-1 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    >
                      <option value="all">All Status</option>
                      <option value="APPLIED">Applied</option>
                      <option value="INTERVIEWING">Interviewing</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="HIRED">Hired</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <BriefcaseIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Applied</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.applied}</p>
                    </div>
                    <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Interviewing</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.interviewing}</p>
                    </div>
                    <ClockIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    </div>
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Hired</p>
                      <p className="text-2xl font-bold text-green-600">{stats.hired}</p>
                    </div>
                    <TrophyIcon className="h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Job Tracker List */}
        {activeTab === 'tracker' && (
          <>
            {applicationsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <BriefcaseIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No applications tracked yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your job applications to monitor your progress
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
                >
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications
                  .filter(app => {
                    if (!searchQuery) return true
                    const query = searchQuery.toLowerCase()
                    return (
                      app.jobData?.job_title?.toLowerCase().includes(query) ||
                      app.jobData?.employer_name?.toLowerCase().includes(query) ||
                      app.notes?.toLowerCase().includes(query)
                    )
                  })
                  .filter(app => {
                    if (selectedStatus === 'all') return true
                    return app.status === selectedStatus
                  })
                  .map(application => (
                    <div key={application.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              <Link 
                                href={`/jobs/${application.jobData.job_publisher?.toLowerCase() || 'unknown'}-${application.jobId}`}
                                className="hover:text-primary hover:underline transition-colors cursor-pointer"
                              >
                                {application.jobData.job_title}
                              </Link>
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                          </div>
                          <p className="text-muted-foreground mb-2">
                            {application.jobData.employer_name}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            {application.jobData.location && (
                              <span className="flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {application.jobData.location}
                              </span>
                            )}
                            {application.jobData.salary_min && (
                              <span className="flex items-center">
                                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                ${application.jobData.salary_min.toLocaleString()}
                                {application.jobData.salary_max && ` - $${application.jobData.salary_max.toLocaleString()}`}
                              </span>
                            )}
                            <span className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              Applied {formatDate(application.appliedAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingApplication(application.id)
                              setNotesText(application.notes || '')
                            }}
                            className="text-primary hover:text-primary/80"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteApplication(application.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Status Update */}
                      <div className="border-t border-border pt-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Update Status</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {['APPLIED', 'INTERVIEWING', 'REJECTED', 'HIRED'].map(status => (
                            <button
                              key={status}
                              onClick={() => handleUpdateApplicationStatus(application.id, status)}
                              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                application.status === status
                                  ? getStatusColor(status)
                                  : 'bg-muted text-muted-foreground hover:bg-accent'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Notes */}
                      {editingApplication === application.id ? (
                        <div className="border-t border-border pt-4 space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                          <textarea
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            placeholder="Add notes about this application..."
                            className="w-full p-2 border border-input rounded-lg bg-background text-foreground text-sm resize-none"
                            rows={3}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateApplicationStatus(application.id, application.status, notesText)}
                              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingApplication(null)
                                setNotesText('')
                              }}
                              className="px-3 py-1 text-sm border border-input rounded hover:bg-accent"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        application.notes && (
                          <div className="border-t border-border pt-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
                            <p className="text-sm text-foreground bg-muted rounded p-3">
                              {application.notes}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Application Tracking Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Track Job Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Initial Status
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPLIED">Applied</SelectItem>
                  <SelectItem value="INTERVIEWING">Interviewing</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="HIRED">Hired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Notes (Optional)
              </label>
              <Textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Add notes about this application..."
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => applyJobData && handleApplyToJob(applyJobData)}
                className="flex-1"
              >
                Track Application
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowApplyDialog(false)
                  setApplyJobData(null)
                  setNotesText('')
                  setNewStatus('APPLIED')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 