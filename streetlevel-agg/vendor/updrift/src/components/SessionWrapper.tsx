'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode, Suspense, useEffect, useState } from 'react'
import ErrorBoundary from './ErrorBoundary'

interface SessionWrapperProps {
  children: ReactNode
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}

function SafeSessionProvider({ children }: { children: ReactNode }) {
  try {
    return (
      <SessionProvider 
        basePath="/api/auth"
        refetchInterval={5 * 60}
        refetchOnWindowFocus={true}
        refetchWhenOffline={false}
      >
        {children}
      </SessionProvider>
    )
  } catch (error) {
    console.error('SessionProvider initialization error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Authentication system loading...</p>
        </div>
      </div>
    )
  }
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <SafeSessionProvider>
          {children}
        </SafeSessionProvider>
      </Suspense>
    </ErrorBoundary>
  )
} 