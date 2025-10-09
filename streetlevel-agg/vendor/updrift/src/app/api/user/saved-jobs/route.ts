import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rateLimiter'

async function getSavedJobsHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: session.user.id },
      orderBy: { savedAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Parse job data from JSON strings
    const formattedJobs = savedJobs.map(savedJob => ({
      ...savedJob,
      jobData: JSON.parse(savedJob.jobData)
    }))

    const totalCount = await prisma.savedJob.count({
      where: { userId: session.user.id }
    })

    return NextResponse.json({
      success: true,
      savedJobs: formattedJobs,
      totalCount,
      hasMore: offset + limit < totalCount
    })

  } catch (error) {
    console.error('Error fetching saved jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createSavedJobHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId, jobData, notes } = await request.json()

    // Validate required fields
    if (!jobId || !jobData) {
      return NextResponse.json(
        { error: 'Job ID and job data are required' },
        { status: 400 }
      )
    }

    // Check if job is already saved
    const existingSavedJob = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId: jobId
        }
      }
    })

    if (existingSavedJob) {
      return NextResponse.json(
        { error: 'Job already saved' },
        { status: 409 }
      )
    }

    // Save the job
    const savedJob = await prisma.savedJob.create({
      data: {
        userId: session.user.id,
        jobId: jobId,
        jobData: JSON.stringify(jobData),
        notes: notes || null,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Job saved successfully',
      savedJob: {
        ...savedJob,
        jobData: JSON.parse(savedJob.jobData)
      }
    })

  } catch (error) {
    console.error('Error saving job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function deleteSavedJobHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Delete saved job if it belongs to the user
    const deletedJob = await prisma.savedJob.deleteMany({
      where: {
        jobId: jobId,
        userId: session.user.id
      }
    })

    if (deletedJob.count === 0) {
      return NextResponse.json(
        { error: 'Saved job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job unsaved successfully'
    })

  } catch (error) {
    console.error('Error deleting saved job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 

// Export the rate-limited handlers
export const GET = withRateLimit('saved-jobs')(getSavedJobsHandler);
export const POST = withRateLimit('saved-jobs')(createSavedJobHandler);
export const DELETE = withRateLimit('saved-jobs')(deleteSavedJobHandler); 