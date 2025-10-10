import React from 'react'
import { useRouter } from 'next/router'

export default function Nav() {
  const router = useRouter()
  const isActive = (path: string) => router.pathname === path
  return (
    <nav className="w-full border-b border-gray-800 !bg-gray-900 !text-white sticky top-0 left-0 right-0 z-40">
      <div className="w-full px-6 py-3 flex items-center justify-between">
        <a href="/" className="font-semibold tracking-wide">ShopTalk</a>
        <div className="flex items-center gap-4 text-sm">
          <a href="/" className={`${isActive('/') ? 'text-yellow-300 underline' : ''} hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded`}>Home</a>
          <a href="/jobs" className={`${isActive('/jobs') ? 'text-yellow-300 underline' : ''} hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded`}>Jobs</a>
          <a href="/admin" className={`${isActive('/admin') ? 'text-yellow-300 underline' : ''} hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded`}>Admin</a>
        </div>
      </div>
    </nav>
  )
}


