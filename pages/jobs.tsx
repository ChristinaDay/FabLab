import React, { useEffect, useState } from 'react'
import { fetchVisibleJobs } from '@/lib/db'

export default function Jobs({ jobs }: { jobs: any[] }) {
  const [results, setResults] = useState<any[]>(jobs)
  const [q, setQ] = useState('')
  const [loc, setLoc] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeCat, setActiveCat] = useState<string>('all')

  const categories = [
    { key: 'all', label: 'All', query: '' },
    { key: 'welding', label: 'Welding', query: 'welder OR welding OR "metal fabricator"' },
    { key: 'cnc', label: 'CNC', query: '"CNC machinist" OR "CNC operator"' },
    { key: 'model', label: 'Model making', query: '"model maker" OR "prototype technician"' },
    { key: 'composites', label: 'Composites', query: '"composites technician" OR "composite fabricator"' },
    { key: 'wood', label: 'Wood', query: 'woodworker OR "wood shop"' },
    { key: 'additive', label: 'Additive', query: '"3D printing" OR "additive manufacturing"' },
    { key: 'ceramics', label: 'Ceramics', query: 'ceramics OR "kiln technician" OR "studio technician"' },
    { key: 'management', label: 'Shop mgmt', query: '"shop manager" OR "fabrication manager"' },
  ]

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault()
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())
      if (loc.trim()) params.set('loc', loc.trim())
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
    setQ(query)
    // Run immediately when selecting a tab
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (loc.trim()) params.set('loc', loc.trim())
    setLoading(true)
    try {
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

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Jobs</h1>
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
      <form onSubmit={runSearch} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} className="border rounded px-3 py-2" placeholder="Keyword (e.g. welder, cnc)" />
        <input value={loc} onChange={(e) => setLoc(e.target.value)} className="border rounded px-3 py-2" placeholder="Location (e.g. Boston)" />
        <button disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{loading ? 'Searching…' : 'Search'}</button>
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


