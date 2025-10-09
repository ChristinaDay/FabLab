import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rateLimiter'

// GET - Retrieve user's job applications
const getApplicationsHandler = async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = { userId: session.user.id }
    if (status && status !== 'all') {
      where.status = status
    }

    // Get applications with pagination
    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        orderBy: { appliedAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.jobApplication.count({ where })
    ])

    // Parse job data for each application
    const applicationsWithJobData = applications.map(app => ({
      ...app,
      jobData: app.jobData ? JSON.parse(app.jobData) : null
    }))

    return NextResponse.json({
      success: true,
      applications: applicationsWithJobData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching job applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new job application
const createApplicationHandler = async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId, jobData, applicationUrl, notes, status = 'VIEWED' } = await request.json()

    // Validate required fields
    if (!jobId || !jobData) {
      return NextResponse.json(
        { error: 'Job ID and job data are required' },
        { status: 400 }
      )
    }

    // Check if application already exists
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        userId: session.user.id,
        jobId: jobId
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already tracked this job' },
        { status: 409 }
      )
    }

    // Create new application
    const application = await prisma.jobApplication.create({
      data: {
        userId: session.user.id,
        jobId,
        jobData: JSON.stringify(jobData),
        status,
        applicationUrl,
        notes
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Job added to tracker successfully',
      application: {
        ...application,
        jobData: JSON.parse(application.jobData)
      }
    })

  } catch (error) {
    console.error('Error creating job application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export rate-limited handlers
export const GET = withRateLimit('saved-jobs')(getApplicationsHandler);
export const POST = withRateLimit('saved-jobs')(createApplicationHandler); 