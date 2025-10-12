import React from 'react'

export default function Footer() {
  const categories = [
    { key: 'industrial-design', label: 'Industrial Design' },
    { key: 'architecture', label: 'Architecture' },
    { key: 'fabrication', label: 'Fabrication' },
    { key: 'design', label: 'Design' },
    { key: 'tools', label: 'Tools' },
    { key: 'materials', label: 'Materials' },
    { key: 'guides', label: 'Guides' },
  ]
  return (
    <footer className="mt-10 border-t">
      <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-black/70 dark:text-white/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="text-black dark:text-white font-semibold">ShopTalk</div>
          <div>© {new Date().getFullYear()} Curated news and jobs for makers and fabricators.</div>
          <div className="flex gap-4 text-black dark:text-white">
            <a href="/" className="underline">Home</a>
            <a href="/jobs" className="underline">Job Board</a>
            <a href="/topstories" className="underline">Top Stories</a>
            <a href="/privacy" className="underline">Privacy</a>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="font-semibold text-black dark:text-white mb-3">Browse by category</div>
          <nav className="grid grid-cols-2 gap-x-6 gap-y-2">
            {categories.map((c) => (
              <a key={c.key} href={`/?category=${c.key}`} className="underline text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white">
                {c.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}


