import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      authenticated: !!session,
      user: session?.user || null,
      message: session 
        ? `Welcome ${session.user.name || session.user.email}!` 
        : 'Not authenticated',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Authentication test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 