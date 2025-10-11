import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/db'

export default function Nav() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [searchQ, setSearchQ] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [email, setEmail] = useState('')
  const [authMsg, setAuthMsg] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const isActive = (path: string) => router.pathname === path
  const isAdminRoute = router.pathname.startsWith('/admin')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user?.email || null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email || null)
    })
    setHydrated(true)
    return () => subscription.unsubscribe()
  }, [])

  async function onSignOut() {
    await supabase.auth.signOut()
    setUserEmail(null)
    router.push('/')
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQ.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setSearchQ('')
  }
  return (
    <header className="w-full sticky top-0 z-40 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Wired-like boxed logo */}
        <a href="/" className="logo-wired text-xl flex items-center">
          <span className="box">S</span><span className="box">T</span>
          <span className="box mr-2">N</span>
          <span className="ml-1 font-bold text-black text-2xl leading-none sm:text-3xl">ShopTalk</span>
          <span className="mx-3 h-5 w-px bg-black/20" aria-hidden="true"></span>
          <span className="text-black/60">News</span>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <a href="/" className={`${isActive('/') ? 'text-black' : 'text-black/70 hover:text-black'}`}>Home</a>
          <a href="/jobs" className={`${isActive('/jobs') ? 'text-black' : 'text-black/70 hover:text-black'}`}>Job Board</a>
          <span suppressHydrationWarning>
          {hydrated && userEmail ? (
            <div className="relative">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="ml-2 px-3 py-1 rounded border border-black/40 text-black hover:bg-black/5"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                Account
              </button>
              {accountOpen ? (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-black/20 rounded shadow-lg text-sm">
                  <div className="px-3 py-2 text-black/80 truncate" title={userEmail || ''}>{userEmail}</div>
                  <a href="/admin" className="block px-3 py-2 text-black hover:bg-black/5">Admin</a>
                  <a href="/admin/jobs" className="block px-3 py-2 text-black hover:bg-black/5">Admin Jobs</a>
                  <button onClick={onSignOut} className="w-full text-left px-3 py-2 text-black hover:bg-black/5">Sign out</button>
                </div>
              ) : null}
            </div>
          ) : (
            <button onClick={() => setShowSignIn(true)} className="ml-2 px-3 py-1 rounded border border-black/40 text-black hover:bg-black/5">Sign in</button>
          )}
          </span>
          <button onClick={() => setShowSearch(true)} aria-label="Search" className="ml-2 h-8 w-9 grid place-items-center text-black hover:opacity-80">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </nav>

        <button aria-label="Menu" className="md:hidden text-black hover:opacity-80" onClick={() => setOpen(!open)}>
          <svg width="22" height="22" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t">
          <div className="px-4 py-3 grid gap-2 text-sm font-semibold">
            <a href="/" className={`${isActive('/') ? 'text-black' : 'text-black/70'}`}>Home</a>
            <a href="/jobs" className={`${isActive('/jobs') ? 'text-black' : 'text-black/70'}`}>Job Board</a>
            {userEmail ? (
              <>
                <div className="text-black/80 mt-2">{userEmail}</div>
                <a href="/admin" className="inline-block px-3 py-1 rounded border border-black/40 text-black">Admin</a>
                <a href="/admin/jobs" className="inline-block px-3 py-1 rounded border border-black/40 text-black">Admin Jobs</a>
                <button onClick={onSignOut} className="inline-block px-3 py-1 rounded border border-black/40 text-black">Sign out</button>
              </>
            ) : (
              <button onClick={() => setShowSignIn(true)} className="mt-2 inline-block px-3 py-1 rounded border border-black/40 text-black">Sign in</button>
            )}
            <button onClick={() => setShowSearch(true)} aria-label="Search" className="mt-3 inline-grid place-items-center w-10 h-10 text-black">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Search overlay */}
      {showSearch ? (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setShowSearch(false)}>
          <div className="max-w-7xl mx-auto px-4 pt-10" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={(e) => { onSearchSubmit(e); setShowSearch(false) }} className="flex items-center gap-3">
              <input
                autoFocus
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search terms"
                className="flex-1 h-12 rounded px-3 text-lg bg-white"
              />
              <button type="submit" className="h-12 px-5 rounded bg-white border text-black">Search</button>
              <button type="button" onClick={() => setShowSearch(false)} className="h-12 px-4 rounded bg-white border text-black">Close</button>
            </form>
          </div>
        </div>
      ) : null}

      {/* Sign-in overlay (quick links) */}
      {showSignIn ? (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center" onClick={() => setShowSignIn(false)}>
          <div className="bg-white text-black rounded shadow-lg w-[460px] max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center"><div className="font-semibold">Sign in</div><button onClick={() => setShowSignIn(false)}>×</button></div>
            <div className="p-4 space-y-3 text-sm">
              {userEmail ? (
                <div className="space-y-3">
                  <div className="text-black/80">Signed in as <span className="font-medium">{userEmail}</span></div>
                  <a href="/admin" className="block px-3 py-2 rounded border text-center">Admin</a>
                  <a href="/admin/jobs" className="block px-3 py-2 rounded border text-center">Admin Jobs</a>
                  <button onClick={onSignOut} className="block w-full px-3 py-2 rounded border text-center">Sign out</button>
                </div>
              ) : (
                <>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setAuthMsg('Sending link...')
                      const redirectTo = `${window.location.origin}/admin`
                      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo } })
                      setAuthMsg(error ? error.message : 'Check your email for a sign-in link')
                    }}
                    className="space-y-2"
                  >
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2 placeholder-black/60" />
                    <button type="submit" className="w-full px-3 py-2 rounded border text-black">Email me a sign‑in link</button>
                    <div className="text-xs text-black/70">No account? Enter your email and we’ll create one when you sign in.</div>
                  </form>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setAuthMsg('Redirecting to GitHub...')
                        const redirectTo = `${window.location.origin}/admin`
                        const { error } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo } })
                        if (error) setAuthMsg(error.message)
                      }}
                      className="flex-1 px-3 py-2 rounded border text-black flex items-center justify-center gap-2"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.026c0 4.424 2.865 8.18 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.153-1.11-1.461-1.11-1.461-.908-.62.069-.607.069-.607 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.447-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.026 2.748-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.58.688.481A10.026 10.026 0 0022 12.026C22 6.484 17.523 2 12 2z" clipRule="evenodd" />
                      </svg>
                      GitHub
                    </button>
                    <button
                      onClick={async () => {
                        setAuthMsg('Redirecting to Google...')
                        const redirectTo = `${window.location.origin}/admin`
                        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
                        if (error) setAuthMsg(error.message)
                      }}
                      className="flex-1 px-3 py-2 rounded border text-black flex items-center justify-center gap-2"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M21.35 11.1h-8.9v2.96h5.12c-.22 1.34-1.55 3.93-5.12 3.93-3.08 0-5.6-2.54-5.6-5.67s2.52-5.67 5.6-5.67c1.76 0 2.94.75 3.62 1.4l2.47-2.38C17.6 4.3 15.66 3.4 13.45 3.4 8.9 3.4 5.2 7.1 5.2 11.75s3.7 8.35 8.25 8.35c4.76 0 7.9-3.34 7.9-8.05 0-.54-.06-.96-.14-1.35z" />
                      </svg>
                      Google
                    </button>
                  </div>
                  {authMsg ? <div className="text-xs text-black/70">{authMsg}</div> : null}
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Categories row (hide on admin routes) */}
      {!isAdminRoute && (
        <div className="w-full border-t">
          <nav className="max-w-7xl mx-auto px-4 h-11 flex items-center gap-5 overflow-x-auto overflow-y-hidden text-sm">
            <a href="/?category=industrial-design" className={`whitespace-nowrap py-3 ${router.query.category === 'industrial-design' ? 'text-black font-semibold border-b-2 border-black' : 'text-black/70 hover:text-black border-b-2 border-transparent'}`}>Industrial Design</a>
            <a href="/?category=architecture" className={`whitespace-nowrap py-3 ${router.query.category === 'architecture' ? 'text-black font-semibold border-b-2 border-black' : 'text-black/70 hover:text-black border-b-2 border-transparent'}`}>Architecture</a>
            <a href="/?category=fabrication" className={`whitespace-nowrap py-3 ${router.query.category === 'fabrication' ? 'text-black font-semibold border-b-2 border-black' : 'text-black/70 hover:text-black border-b-2 border-transparent'}`}>Fabrication</a>
            <a href="/?category=design" className={`whitespace-nowrap py-3 ${router.query.category === 'design' ? 'text-black font-semibold border-b-2 border-black' : 'text-black/70 hover:text-black border-b-2 border-transparent'}`}>Design</a>
            <a href="/?category=tools" className={`whitespace-nowrap py-3 ${router.query.category === 'tools' ? 'text-black font-semibold border-b-2 border-black' : 'text-black/70 hover:text-black border-b-2 border-transparent'}`}>Tools</a>
            <a href="/?category=materials" className={`whitespace-nowrap py-3 ${router.query.category === 'materials' ? 'text-black font-semibold border-b-2 border-black' : 'text-black/70 hover:text-black border-b-2 border-transparent'}`}>Materials</a>
            <a href="/?category=guides" className={`whitespace-nowrap py-3 ${router.query.category === 'guides' ? 'text-black font-semibold border-b-2 border-black' : 'text-black/70 hover:text-black border-b-2 border-transparent'}`}>Guides</a>
          </nav>
        </div>
      )}
    </header>
  )
}


