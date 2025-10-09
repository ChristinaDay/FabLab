import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rateLimiter'

async function getSavedSearchesHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const savedSearches = await prisma.userSearchHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { searchedAt: 'desc' },
      take: 50 // Limit to recent 50 searches
    })

    return NextResponse.json({
      success: true,
      searches: savedSearches
    })

  } catch (error) {
    console.error('Error fetching saved searches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createSavedSearchHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, location, filters } = await request.json()

    // Validate required fields
    if (!query && !location) {
      return NextResponse.json(
        { error: 'Query or location is required' },
        { status: 400 }
      )
    }

    // Save search to history
    const savedSearch = await prisma.userSearchHistory.create({
      data: {
        userId: session.user.id,
        query: query || '',
        location: location || null,
        // Store filters as JSON string for now
        // In a real app, you'd want a proper schema for filters
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Search saved successfully',
      search: savedSearch
    })

  } catch (error) {
    console.error('Error saving search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function deleteSavedSearchHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const searchId = searchParams.get('id')

    if (!searchId) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      )
    }

    // Delete search if it belongs to the user
    const deletedSearch = await prisma.userSearchHistory.deleteMany({
      where: {
        id: searchId,
        userId: session.user.id
      }
    })

    if (deletedSearch.count === 0) {
      return NextResponse.json(
        { error: 'Search not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Search deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export the rate-limited handlers
export const GET = withRateLimit('saved-searches')(getSavedSearchesHandler);
export const POST = withRateLimit('saved-searches')(createSavedSearchHandler);
export const DELETE = withRateLimit('saved-searches')(deleteSavedSearchHandler); 