import React, { useEffect, useState } from 'react'
import { fetchVisibleJobs } from '@/lib/db'

export default function Jobs({ jobs }: { jobs: any[] }) {
  const [results, setResults] = useState<any[]>(jobs)
  const [globalQ, setGlobalQ] = useState('')
  const [loc, setLoc] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeCat, setActiveCat] = useState<string>('all')
  const [strict, setStrict] = useState(false)

  const categories = [
    { key: 'all', label: 'All', query: '' },
    { key: 'welding', label: 'Welding', query: 'welder welding fabricator metal' },
    { key: 'cnc', label: 'CNC', query: 'CNC machinist operator' },
    { key: 'model', label: 'Model making', query: 'model maker prototype technician' },
    { key: 'composites', label: 'Composites', query: 'composites composite fabricator' },
    { key: 'wood', label: 'Wood', query: 'woodworker wood shop' },
    { key: 'additive', label: 'Additive', query: '3D printing additive manufacturing' },
    { key: 'ceramics', label: 'Ceramics', query: 'ceramics kiln technician studio technician' },
    { key: 'management', label: 'Shop mgmt', query: 'shop manager fabrication manager' },
  ]

  async function runSearch(e?: React.FormEvent, catKey?: string) {
    e?.preventDefault()
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const cat = categories.find((c) => c.key === (catKey || activeCat))
      const catQuery = (cat?.query || '').trim()
      const combined = [catQuery, globalQ.trim()].filter(Boolean).join(' ')
      if (combined) params.set('q', combined)
      if (loc.trim()) params.set('loc', loc.trim())
      if (strict) params.set('strict', '1')
      const res = await fetch(`/api/jobs/search?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Search failed')
      setResults(json.jobs || [])
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function selectCategory(key: string, query: string) {
    setActiveCat(key)
    // Run immediately when selecting a tab with current filters
    await runSearch(undefined, key)
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Jobs</h1>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
        <input value={loc} onChange={(e) => setLoc(e.target.value)} className="border rounded px-3 py-2" placeholder="Location (e.g. San Francisco)" />
        <input value={globalQ} onChange={(e) => setGlobalQ(e.target.value)} className="border rounded px-3 py-2" placeholder="Extra keyword filter (optional)" />
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
      {results.length === 0 ? (
        <div className="text-gray-600">No jobs yet. Check back soon.</div>
      ) : (
        <div className="space-y-4">
          {results.map((j: any) => (
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
        </div>
      )}
    </main>
  )
}

export async function getServerSideProps() {
  const jobs = await fetchVisibleJobs(50)
  return { props: { jobs } }
}


