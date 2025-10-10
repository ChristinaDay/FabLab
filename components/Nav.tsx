import React, { useState } from 'react'
import { useRouter } from 'next/router'

export default function Nav() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const isActive = (path: string) => router.pathname === path
  const isAdminRoute = router.pathname.startsWith('/admin')
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
          <a href="/jobs" className={`${isActive('/jobs') ? 'text-black' : 'text-black/70 hover:text-black'}`}>Jobs</a>
          <a href="/admin" className={`${isActive('/admin') ? 'text-black' : 'text-black/70 hover:text-black'}`}>Admin</a>
          <a href="/admin/jobs" className={`${isActive('/admin/jobs') ? 'text-black' : 'text-black/70 hover:text-black'}`}>Admin Jobs</a>
          <a href="/signin" className="ml-2 px-3 py-1 rounded border hover:bg-gray-50">Sign in</a>
        </nav>

        <button aria-label="Menu" className="md:hidden" onClick={() => setOpen(!open)}>
          <svg width="22" height="22" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t">
          <div className="px-4 py-3 grid gap-2 text-sm font-semibold">
            <a href="/" className={`${isActive('/') ? 'text-black' : 'text-black/70'}`}>Home</a>
            <a href="/jobs" className={`${isActive('/jobs') ? 'text-black' : 'text-black/70'}`}>Jobs</a>
            <a href="/admin" className={`${isActive('/admin') ? 'text-black' : 'text-black/70'}`}>Admin</a>
            <a href="/admin/jobs" className={`${isActive('/admin/jobs') ? 'text-black' : 'text-black/70'}`}>Admin Jobs</a>
            <a href="/signin" className="mt-2 inline-block px-3 py-1 rounded border">Sign in</a>
          </div>
        </div>
      )}

      {/* Categories row (hide on admin routes) */}
      {!isAdminRoute && (
        <div className="w-full border-t">
          <nav className="max-w-7xl mx-auto px-4 h-11 flex items-center gap-5 overflow-x-auto text-sm">
            <a href="/?category=industrial-design" className={`whitespace-nowrap ${router.query.category === 'industrial-design' ? 'font-bold' : 'text-black/70 hover:text-black'}`}>Industrial Design</a>
            <a href="/?category=architecture" className={`whitespace-nowrap ${router.query.category === 'architecture' ? 'font-bold' : 'text-black/70 hover:text-black'}`}>Architecture</a>
            <a href="/?category=fabrication" className={`whitespace-nowrap ${router.query.category === 'fabrication' ? 'font-bold' : 'text-black/70 hover:text-black'}`}>Fabrication</a>
            <a href="/?category=design" className={`whitespace-nowrap ${router.query.category === 'design' ? 'font-bold' : 'text-black/70 hover:text-black'}`}>Design</a>
            <a href="/?category=tools" className={`whitespace-nowrap ${router.query.category === 'tools' ? 'font-bold' : 'text-black/70 hover:text-black'}`}>Tools</a>
            <a href="/?category=materials" className={`whitespace-nowrap ${router.query.category === 'materials' ? 'font-bold' : 'text-black/70 hover:text-black'}`}>Materials</a>
            <a href="/jobs" className={`whitespace-nowrap ${isActive('/jobs') ? 'font-bold' : 'text-black/70 hover:text-black'}`}>Jobs</a>
            <a href="/?category=guides" className={`whitespace-nowrap ${router.query.category === 'guides' ? 'font-bold' : 'text-black/70 hover:text-black'}`}>Guides</a>
          </nav>
        </div>
      )}
    </header>
  )
}


