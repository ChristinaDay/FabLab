import React from 'react'

function isActive(path: string) {
  if (typeof window === 'undefined') return false
  return window.location.pathname === path
}

export default function Nav() {
  return (
    <nav className="w-full border-b border-gray-800 !bg-gray-900 !text-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="font-semibold tracking-wide">FabLab</a>
        <div className="flex items-center gap-4 text-sm">
          <a href="/" className={`${isActive('/') ? 'text-yellow-300 underline' : ''} hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded`}>Home</a>
          <a href="/jobs" className={`${isActive('/jobs') ? 'text-yellow-300 underline' : ''} hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded`}>Jobs</a>
          <a href="/admin" className={`${isActive('/admin') ? 'text-yellow-300 underline' : ''} hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded`}>Admin</a>
        </div>
      </div>
    </nav>
  )
}


