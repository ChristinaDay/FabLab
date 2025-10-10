import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Configure your admin allowlist here
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const needsAuth = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  if (!needsAuth) return NextResponse.next()

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
  })
  const { data } = await supabase.auth.getUser()
  const email = data.user?.email
  const isAdmin = !!email && (ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(email))
  if (!isAdmin) {
    const signInUrl = req.nextUrl.clone()
    signInUrl.pathname = '/signin'
    return NextResponse.redirect(signInUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}


