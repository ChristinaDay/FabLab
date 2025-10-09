import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    // Fetch logo from Clearbit
    const logoUrl = `https://logo.clearbit.com/${domain}`
    const response = await fetch(logoUrl, {
      headers: {
        'User-Agent': 'UpDrift/1.0'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 })
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('Error fetching logo:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logo' },
      { status: 500 }
    )
  }
} 