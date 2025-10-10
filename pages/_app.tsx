import type { AppProps } from 'next/app'
import '../app/globals.css'
import { useEffect } from 'react'
import { supabase } from '@/lib/db'

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {})
    return () => subscription.unsubscribe()
  }, [])
  return <Component {...pageProps} />
}


