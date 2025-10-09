import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Delete all search results that have expired
    const deletedCount = await prisma.searchResult.deleteMany({
      where: {
        expiresAt: {
          lt: new Date() // Delete results that expired before now
        }
      }
    })

    console.log(`🧹 Cleaned up ${deletedCount.count} expired search results`)

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount.count} expired search results`,
      deletedCount: deletedCount.count
    })

  } catch (error) {
    console.error('Error cleaning up expired search results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 