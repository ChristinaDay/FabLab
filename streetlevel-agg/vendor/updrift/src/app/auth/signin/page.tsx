'use client'

import { useState, useRef } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const passwordRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    console.log('🔐 Attempting sign in with:', { email, password: '***' })

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/dashboard',
        redirect: false,
      })

      console.log('🔐 Sign in result:', result)

      if (result?.error) {
        console.error('❌ Sign in error:', result.error)
        setError('Invalid credentials. Please check your email and password.')
      } else if (result?.ok) {
        console.log('✅ Sign in successful, redirecting to dashboard...')
        router.push('/dashboard')
      } else {
        console.log('⚠️ Sign in result unclear:', result)
        setError('Sign in failed. Please try again.')
      }
    } catch (err) {
      console.error('💥 Sign in exception:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Theme Toggle */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold gradient-text" aria-label="Go to home page">
                UpDrift
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-foreground">
              Welcome back to UpDrift
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account to continue your job search
            </p>
          </div>

          <div className="bg-card py-8 px-6 shadow-lg rounded-lg">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded mb-6">
                  {error}
                </div>
              )}

              <div className="mb-5">
                <label htmlFor="email" className="block text-sm font-medium text-black mb-2 label-dark-foreground">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md text-base bg-white text-[#0f172a] focus:bg-white focus:text-[#0f172a] placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your email"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="block text-sm font-medium text-black mb-2 label-dark-foreground">
                  Password
                </label>
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md text-base bg-white text-[#0f172a] focus:bg-white focus:text-[#0f172a] placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your password"
                />
              </div>

              <div className="mb-5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-white rounded-md font-medium text-base disabled:bg-muted cursor-pointer transition-colors"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSocialSignIn('google')}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-background text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <g>
                      <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.36 30.77 0 24 0 14.82 0 6.71 5.08 2.69 12.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/>
                      <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.98 37.36 46.1 31.41 46.1 24.55z"/>
                      <path fill="#FBBC05" d="M10.67 28.64c-1.13-3.36-1.13-6.97 0-10.33l-7.98-6.2C.89 16.36 0 20.06 0 24c0 3.94.89 7.64 2.69 11.09l7.98-6.2z"/>
                      <path fill="#EA4335" d="M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.19-5.59c-2.01 1.35-4.59 2.15-8.7 2.15-6.38 0-11.87-3.63-14.33-8.94l-7.98 6.2C6.71 42.92 14.82 48 24 48z"/>
                      <path fill="none" d="M0 0h48v48H0z"/>
                    </g>
                  </svg>
                  <span className="ml-2">Google</span>
                </button>
                <button
                  onClick={() => handleSocialSignIn('github')}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-background text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="ml-2">GitHub</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="font-medium text-primary hover:text-primary/80">
                  Sign up now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 