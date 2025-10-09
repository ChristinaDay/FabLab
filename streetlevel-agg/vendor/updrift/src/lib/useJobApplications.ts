import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface JobApplication {
  id: string
  userId: string
  jobId: string
  jobData: any
  status: 'APPLIED' | 'VIEWED' | 'INTERVIEWING' | 'REJECTED' | 'HIRED'
  appliedAt: string
  updatedAt: string
  applicationUrl?: string
  notes?: string
  followUpDate?: string
}

export interface ApplicationStatus {
  APPLIED: number
  VIEWED: number
  INTERVIEWING: number
  REJECTED: number
  HIRED: number
}

export interface UseJobTrackerReturn {
  applications: JobApplication[]
  loading: boolean
  error: string | null
  applicationStatus: ApplicationStatus
  totalApplications: number
  applyToJob: (jobId: string, jobData: any, applicationUrl?: string, notes?: string) => Promise<void>
  updateApplicationStatus: (applicationId: string, status: JobApplication['status'], notes?: string) => Promise<void>
  deleteApplication: (applicationId: string) => Promise<void>
  refreshApplications: () => Promise<void>
}

export function useJobTracker(status?: string): UseJobTrackerReturn {
  const { data: session } = useSession()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalApplications, setTotalApplications] = useState(0)

  // Calculate application status counts
  const applicationStatus: ApplicationStatus = applications.reduce(
    (acc, app) => {
      acc[app.status]++
      return acc
    },
    { APPLIED: 0, VIEWED: 0, INTERVIEWING: 0, REJECTED: 0, HIRED: 0 }
  )

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    if (!session?.user) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (status && status !== 'all') {
        params.append('status', status)
      }
      params.append('limit', '100') // Get more applications

      const response = await fetch(`/api/user/applications?${params.toString()}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          // User is not authenticated, this is expected
          setApplications([])
          setTotalApplications(0)
          return
        }
        throw new Error('Failed to fetch applications')
      }

      const data = await response.json()
      setApplications(data.applications || [])
      setTotalApplications(data.pagination?.total || 0)
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }, [session?.user, status])

  // Track a job
  const applyToJob = useCallback(async (
    jobId: string, 
    jobData: any, 
    applicationUrl?: string, 
    notes?: string
  ) => {
    if (!session?.user) {
      throw new Error('You must be signed in to track jobs')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          jobData,
          applicationUrl,
          notes,
          status: 'VIEWED'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to track job')
      }

      const data = await response.json()
      
      // Add new application to the list
      setApplications(prev => [data.application, ...prev])
      setTotalApplications(prev => prev + 1)

      return data.application
    } catch (err) {
      console.error('Error applying to job:', err)
      setError(err instanceof Error ? err.message : 'Failed to track job')
      throw err
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  // Update application status
  const updateApplicationStatus = useCallback(async (
    applicationId: string, 
    status: JobApplication['status'], 
    notes?: string
  ) => {
    if (!session?.user) {
      throw new Error('You must be signed in to update applications')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update application')
      }

      const data = await response.json()
      
      // Update application in the list
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? data.application : app
        )
      )

      return data.application
    } catch (err) {
      console.error('Error updating application:', err)
      setError(err instanceof Error ? err.message : 'Failed to update application')
      throw err
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  // Delete application
  const deleteApplication = useCallback(async (applicationId: string) => {
    if (!session?.user) {
      throw new Error('You must be signed in to delete applications')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user/applications/${applicationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete application')
      }

      // Remove application from the list
      setApplications(prev => prev.filter(app => app.id !== applicationId))
      setTotalApplications(prev => prev - 1)
    } catch (err) {
      console.error('Error deleting application:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete application')
      throw err
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  // Refresh applications
  const refreshApplications = useCallback(async () => {
    await fetchApplications()
  }, [fetchApplications])

  // Load applications on mount and when dependencies change
  useEffect(() => {
    if (session?.user) {
      fetchApplications()
    } else {
      setApplications([])
      setTotalApplications(0)
    }
  }, [fetchApplications, session?.user])

  return {
    applications,
    loading,
    error,
    applicationStatus,
    totalApplications,
    applyToJob,
    updateApplicationStatus,
    deleteApplication,
    refreshApplications
  }
} 