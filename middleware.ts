import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isApi = pathname.startsWith('/api/')
  const needsAuth = pathname.startsWith('/api/admin')
  if (!needsAuth) return NextResponse.next()

  // If no admin emails are configured, bypass auth (useful for local dev)
  if (ADMIN_EMAILS.length === 0) {
    return NextResponse.next()
  }

  // Prefer Authorization header from client fetch; fall back to cookie
  const bearer = req.headers.get('authorization') || ''
  const tokenFromHeader = bearer.toLowerCase().startsWith('bearer ')
    ? bearer.slice(7).trim()
    : ''
  const accessToken = tokenFromHeader || req.cookies.get('sb-access-token')?.value
  if (!accessToken) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data } = await supabase.auth.getUser(accessToken)
  const email = data.user?.email
  const isAdmin = !!email && ADMIN_EMAILS.includes(email)
  if (!isAdmin) return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/admin/:path*'],
}


