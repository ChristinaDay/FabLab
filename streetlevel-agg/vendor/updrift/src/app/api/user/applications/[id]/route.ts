import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rateLimiter'

// GET - Get a specific application
const getApplicationHandler = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const application = await prisma.jobApplication.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
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

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      application: {
        ...application,
        jobData: application.jobData ? JSON.parse(application.jobData) : null
      }
    })

  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update application status and details
const updateApplicationHandler = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, notes, applicationUrl, followUpDate } = await request.json()

    // Validate status if provided
    const validStatuses = ['APPLIED', 'VIEWED', 'INTERVIEWING', 'REJECTED', 'HIRED']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: APPLIED, VIEWED, INTERVIEWING, REJECTED, HIRED' },
        { status: 400 }
      )
    }

    // Check if application exists and belongs to user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Update application
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(applicationUrl !== undefined && { applicationUrl }),
        ...(followUpDate !== undefined && { followUpDate }),
        updatedAt: new Date()
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
      message: 'Application updated successfully',
      application: {
        ...updatedApplication,
        jobData: updatedApplication.jobData ? JSON.parse(updatedApplication.jobData) : null
      }
    })

  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an application
const deleteApplicationHandler = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if application exists and belongs to user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Delete application
    await prisma.jobApplication.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export rate-limited handlers
export const GET = withRateLimit('saved-jobs')(getApplicationHandler);
export const PUT = withRateLimit('saved-jobs')(updateApplicationHandler);
export const DELETE = withRateLimit('saved-jobs')(deleteApplicationHandler); 