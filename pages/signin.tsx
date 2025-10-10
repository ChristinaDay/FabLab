import React, { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/db'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const e = data.user?.email || null
      setUserEmail(e)
    })
  }, [])

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setStatus('Sending magic link...')
    const redirectTo = `${window.location.origin}/admin`
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo } })
    if (error) setStatus(error.message)
    else setStatus('Check your email for a sign-in link. After clicking it, you will land on /admin.')
  }

  async function signInWithProvider(provider: 'github' | 'google') {
    setStatus(`Redirecting to ${provider}...`)
    const redirectTo = `${window.location.origin}/admin`
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
    if (error) setStatus(error.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUserEmail(null)
  }

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4">Sign in</h1>
        {userEmail ? (
          <div className="space-y-3">
            <div className="text-sm">Signed in as <span className="font-medium">{userEmail}</span></div>
            <a href="/admin" className="underline">Go to admin</a>
            <div>
              <button onClick={signOut} className="px-3 py-2 rounded border hover:bg-gray-50 text-sm">Sign out</button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-md">
            <form onSubmit={sendMagicLink} className="space-y-3">
              <input
                type="email"
                required
                className="w-full border rounded px-3 py-2"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="px-4 py-2 rounded bg-black text-white hover:opacity-90">Email me a sign‑in link</button>
            </form>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">Or continue with</div>
              <div className="flex gap-2">
                <button onClick={() => signInWithProvider('github')} className="px-4 py-2 rounded border hover:bg-gray-50">GitHub</button>
                <button onClick={() => signInWithProvider('google')} className="px-4 py-2 rounded border hover:bg-gray-50">Google</button>
              </div>
            </div>

            {status ? <div className="text-sm text-gray-700">{status}</div> : null}
          </div>
        )}
      </main>
    </>
  )
}


