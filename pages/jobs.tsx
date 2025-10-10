import React, { useEffect, useRef, useState } from 'react'
import Nav from '@/components/Nav'
import { fetchVisibleJobs } from '@/lib/db'
import { useSearchJobs } from '@/lib/useSearchJobs'

export default function Jobs({ jobs }: { jobs: any[] }) {
  const { jobs: results, loading, searchJobs, error } = useSearchJobs({ initialJobs: jobs })
  const [globalQ, setGlobalQ] = useState('')
  const [loc, setLoc] = useState('')
  const [activeCat, setActiveCat] = useState<string>('all')
  const [strict, setStrict] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const visibleJobs = results.slice(0, page * pageSize)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const categories = [
    { key: 'all', label: 'All', query: '' },
    { key: 'welding', label: 'Welding', query: 'welder welding fabricator metal' },
    { key: 'cnc', label: 'CNC', query: 'CNC machinist operator' },
    { key: 'model', label: 'Model making', query: 'model maker prototype technician' },
    { key: 'composites', label: 'Composites', query: 'composites composite fabricator' },
    { key: 'wood', label: 'Wood', query: 'woodworker wood shop' },
    { key: 'carpentry', label: 'Carpentry', query: 'carpenter carpentry cabinetry joiner framing finish carpentry' },
    { key: 'additive', label: 'Additive', query: '3D printing additive manufacturing' },
    { key: 'ceramics', label: 'Ceramics', query: 'ceramics kiln technician studio technician' },
    { key: 'management', label: 'Shop mgmt', query: 'shop manager fabrication manager' },
  ]

  async function runSearch(e?: React.FormEvent, catKey?: string) {
    e?.preventDefault()
    const cat = categories.find((c) => c.key === (catKey || activeCat))
    const catQuery = (cat?.query || '').trim()
    const combined = [catQuery, globalQ.trim()].filter(Boolean).join(' ')
    const curatedOnly = (catKey || activeCat) === 'all'
    searchJobs(combined, loc.trim(), strict, { debounceMs: 0, curatedOnly })
  }

  async function selectCategory(key: string, query: string) {
    setActiveCat(key)
    // Run immediately when selecting a tab with current filters
    await runSearch(undefined, key)
  }

  // Reset pagination when results change
  useEffect(() => {
    setPage(1)
  }, [results])

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && !loading && visibleJobs.length < results.length) {
        setPage((p) => p + 1)
      }
    }, { rootMargin: '200px 0px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [loading, visibleJobs.length, results.length])

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Jobs</h1>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
        <input value={globalQ} onChange={(e) => setGlobalQ(e.target.value)} className="border rounded px-3 py-2" placeholder="Extra keyword filter (optional)" />
        <input value={loc} onChange={(e) => setLoc(e.target.value)} className="border rounded px-3 py-2" placeholder="Location (e.g. San Francisco)" />
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} /> Exact city match
        </label>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={(e) => { e.preventDefault(); selectCategory(c.key, c.query) }}
            className={`px-3 py-1 rounded border text-sm ${activeCat === c.key ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}
            title={c.query || 'All jobs'}
          >
            {c.label}
          </button>
        ))}
      </div>
      <form onSubmit={(e) => runSearch(e)} className="mb-6">
        <button disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{loading ? 'Refreshing…' : 'Apply filters'}</button>
      </form>
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-1/4 mb-3"></div>
              <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-100 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded">{error}</div>
      ) : results.length === 0 ? (
        <div className="text-gray-600">No jobs yet. Try adjusting filters and search again.</div>
      ) : (
        <div className="space-y-4">
          {visibleJobs.map((j: any) => (
            <article key={j.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="font-semibold text-lg">{j.title}</div>
                  <div className="text-sm text-gray-600">{j.company} {j.location ? `• ${j.location}` : ''}</div>
                  <p className="mt-2 text-sm text-gray-700">{(j.description || '').slice(0, 280)}</p>
                  <div className="text-xs text-gray-500 mt-1">Source: {j.source}</div>
                </div>
                <a href={j.link} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Apply</a>
              </div>
            </article>
          ))}
          {/* Load more button fallback */}
          {visibleJobs.length < results.length && (
            <div className="flex justify-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded border hover:bg-gray-50"
              >
                Load more
              </button>
            </div>
          )}
          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} />
        </div>
      )}
      </main>
    </>
  )
}

export async function getServerSideProps() {
  const jobs = await fetchVisibleJobs(50)
  return { props: { jobs } }
}


