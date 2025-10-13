import type { AppProps } from 'next/app'
import '../app/globals.css'
import { useEffect } from 'react'
import { supabase } from '@/lib/db'
import { Oswald } from 'next/font/google'
import Footer from '@/components/Footer'
import Head from 'next/head'

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
      <Head>
        <link rel="icon" href="/globe.svg" />
        <link rel="apple-touch-icon" href="/shoptalk1.png" />
      </Head>
      <Component {...pageProps} />
      <Footer />
    </div>
  )
}


