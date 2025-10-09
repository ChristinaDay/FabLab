import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notes } = await request.json()
    const resolvedParams = await params
    const savedJobId = resolvedParams.id

    if (!savedJobId) {
      return NextResponse.json(
        { error: 'Saved job ID is required' },
        { status: 400 }
      )
    }

    // Update the saved job if it belongs to the user
    const updatedSavedJob = await prisma.savedJob.updateMany({
      where: {
        id: savedJobId,
        userId: session.user.id
      },
      data: {
        notes: notes || null
      }
    })

    if (updatedSavedJob.count === 0) {
      return NextResponse.json(
        { error: 'Saved job not found' },
        { status: 404 }
      )
    }

    // Fetch the updated saved job to return
    const savedJob = await prisma.savedJob.findUnique({
      where: { id: savedJobId }
    })

    return NextResponse.json({
      success: true,
      message: 'Notes updated successfully',
      savedJob: savedJob ? {
        ...savedJob,
        jobData: JSON.parse(savedJob.jobData)
      } : null
    })

  } catch (error) {
    console.error('Error updating saved job notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const savedJobId = resolvedParams.id

    if (!savedJobId) {
      return NextResponse.json(
        { error: 'Saved job ID is required' },
        { status: 400 }
      )
    }

    // Delete the saved job if it belongs to the user
    const deletedSavedJob = await prisma.savedJob.deleteMany({
      where: {
        id: savedJobId,
        userId: session.user.id
      }
    })

    if (deletedSavedJob.count === 0) {
      return NextResponse.json(
        { error: 'Saved job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Saved job deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting saved job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 