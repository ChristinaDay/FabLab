'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export function useAuthSession() {
  const [isReady, setIsReady] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // Always call useSession at top level, but capture errors
  let sessionResult
  try {
    sessionResult = useSession()
  } catch (error) {
    console.error('Session error caught in useAuthSession:', error)
    sessionResult = {
      data: null,
      status: 'unauthenticated' as const,
      update: async () => null
    }
  }

  useEffect(() => {
    // Ensure we're fully mounted on the client
    setIsMounted(true)
    setIsClient(true)
    
    // Longer delay to ensure SessionProvider is fully ready
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Always return loading during SSR and initialization to prevent hydration mismatches
  if (!isMounted || !isClient || !isReady) {
    return {
      data: null,
      status: 'loading' as const,
      update: async () => null
    }
  }

  // Return the session result only after safe initialization
  return sessionResult
}