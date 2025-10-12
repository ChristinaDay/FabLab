import type { AppProps } from 'next/app'
import '../app/globals.css'
import { useEffect } from 'react'
import { supabase } from '@/lib/db'
import { Oswald } from 'next/font/google'
import Footer from '@/components/Footer'

const oswald = Oswald({
  variable: '--font-condensed',
  subsets: ['latin'],
  weight: ['400','500','600','700']
})

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {})
    return () => subscription.unsubscribe()
  }, [])
  return (
    <div className={oswald.variable}>
      <Component {...pageProps} />
      <Footer />
    </div>
  )
}


