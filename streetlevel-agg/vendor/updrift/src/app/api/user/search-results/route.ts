import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rateLimiter'

async function createSearchResultHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, location, radius, jobResults } = await request.json()

    // Validate required fields
    if (!query && !location) {
      return NextResponse.json(
        { error: 'Query or location is required' },
        { status: 400 }
      )
    }

    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Store search result in database
    const searchResult = await prisma.searchResult.create({
      data: {
        userId: session.user.id,
        query: query || '',
        location: location || null,
        radius: radius || 25,
        jobResults: jobResults,
        expiresAt: expiresAt
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Search result stored successfully',
      searchResult
    })

  } catch (error) {
    console.error('Error storing search result:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getSearchResultsHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get search results that haven't expired yet
    const searchResults = await prisma.searchResult.findMany({
      where: { 
        userId: session.user.id,
        expiresAt: {
          gt: new Date() // Only get non-expired results
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent 50 searches
    })

    return NextResponse.json({
      success: true,
      searchResults: searchResults.map((result: any) => ({
        id: result.id,
        query: result.query,
        location: result.location,
        radius: result.radius,
        jobResults: JSON.parse(result.jobResults),
        createdAt: result.createdAt,
        expiresAt: result.expiresAt
      }))
    })

  } catch (error) {
    console.error('Error fetching search results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function deleteSearchHistoryHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all search results for the current user
    const deletedCount = await prisma.searchResult.deleteMany({
      where: { 
        userId: session.user.id
      }
    })

    console.log(`🗑️ Deleted ${deletedCount.count} search history entries for user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      message: `Cleared ${deletedCount.count} search history entries`,
      deletedCount: deletedCount.count
    })

  } catch (error) {
    console.error('Error deleting search history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = createSearchResultHandler
export const GET = getSearchResultsHandler
export const DELETE = deleteSearchHistoryHandler 