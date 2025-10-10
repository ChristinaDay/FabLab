import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isApi = pathname.startsWith('/api/')
  const needsAuth = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  if (!needsAuth) return NextResponse.next()

  // Read Supabase auth cookie set by the browser
  const accessToken = req.cookies.get('sb-access-token')?.value
  if (!accessToken) {
    if (isApi) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    const signInUrl = req.nextUrl.clone(); signInUrl.pathname = '/signin'
    return NextResponse.redirect(signInUrl)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data } = await supabase.auth.getUser(accessToken)
  const email = data.user?.email
  const isAdmin = !!email && (ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(email))
  if (!isAdmin) {
    if (isApi) return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    const signInUrl = req.nextUrl.clone(); signInUrl.pathname = '/signin'
    return NextResponse.redirect(signInUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}


