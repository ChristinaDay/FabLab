import React, { useEffect, useState } from 'react'

type Job = {
  id?: string
  title: string
  company?: string
  location?: string
  link: string
  description?: string
  source?: string
  tags?: string[]
  published_at?: string
  visible?: boolean
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const needsReview = jobs.filter((j) => !j.visible)
  const [form, setForm] = useState<Job>({ title: '', company: '', location: '', link: '', description: '', source: '' })
  const [msg, setMsg] = useState<string | null>(null)
  const [sources, setSources] = useState<any[]>([])
  const [sourcesMsg, setSourcesMsg] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [newType, setNewType] = useState<'adzuna'|'jsearch'>('adzuna')
  const [newQuery, setNewQuery] = useState('')

  useEffect(() => {
    fetchJobs()
    fetchSources()
  }, [])

  async function fetchJobs() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/jobs-list')
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed to load')
      setJobs(json.jobs || [])
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function fetchSources() {
    try {
      const res = await fetch('/api/admin/job-sources-list')
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed to load sources')
      setSources(json.sources || [])
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  async function updateSource(id: string, patch: { auto_publish?: boolean; active?: boolean }) {
    setSourcesMsg(null)
    try {
      const res = await fetch('/api/admin/job-sources-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed')
      setSourcesMsg('Updated')
      fetchSources()
    } catch (e: any) {
      setSourcesMsg(e.message || 'Failed to update source')
    }
  }

  async function handleAddQuery() {
    const q = newQuery.trim()
    if (!q) return
    try {
      const res = await fetch('/api/admin/job-sources-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newType, query: q }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed to add')
      setNewQuery('')
      fetchSources()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  async function runIngestion(id?: string) {
    setRunning(true)
    setSourcesMsg(null)
    try {
      const res = await fetch('/api/admin/jobs-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { id } : {}),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed')
      setSourcesMsg(`Triggered ingestion (${json.processed} source${json.processed === 1 ? '' : 's'})`)
    } catch (e: any) {
      setSourcesMsg(e.message || 'Failed to trigger ingestion')
    } finally {
      setRunning(false)
    }
  }

  async function saveJob() {
    setMsg(null)
    try {
      const res = await fetch('/api/admin/jobs-upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, published_at: new Date().toISOString(), visible: false }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed to save job')
      setMsg('Saved')
      setForm({ title: '', company: '', location: '', link: '', description: '', source: '' })
      fetchJobs()
    } catch (e: any) {
      setMsg(e.message || 'Failed')
    }
  }

  async function toggleVisible(id: string, current: boolean) {
    try {
      const res = await fetch('/api/admin/jobs-toggle-visible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, visible: !current }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed')
      fetchJobs()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  async function bulkPublish() {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([id]) => id)
    if (ids.length === 0) return
    try {
      const res = await fetch('/api/admin/jobs-bulk-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed')
      setSelected({})
      fetchJobs()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Jobs Admin</h1>
      <div className="border rounded p-4 mb-8">
        <div className="font-medium mb-2">Job Sources</div>
        <div className="mb-3 flex gap-2">
          <button onClick={() => runIngestion()} disabled={running} className={`px-3 py-1 rounded ${running ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`} title="Run all active sources now">
            {running ? 'Running…' : 'Run all now'}
          </button>
        </div>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
          <div className="text-sm font-medium">Add keywords</div>
          <select className="border rounded px-2 py-1" value={newType} onChange={(e) => setNewType(e.target.value as any)}>
            <option value="adzuna">Adzuna</option>
            <option value="jsearch">JSearch</option>
          </select>
          <div className="flex gap-2">
            <input className="border rounded px-3 py-1 flex-1" placeholder="e.g. welder OR \"metal fabricator\"" value={newQuery} onChange={(e) => setNewQuery(e.target.value)} />
            <button onClick={handleAddQuery} className="px-3 py-1 rounded border hover:bg-gray-50">Add</button>
          </div>
        </div>
        <div className="space-y-2">
          {sources.filter((s) => !!s.active).map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 border rounded p-2">
              <div className="text-sm">
                <div className="font-semibold">{s.label || `${s.type}:${s.org}`}</div>
                <div className="text-gray-600">{s.type} • {s.org}</div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-1" title="If enabled, newly ingested jobs from this source are immediately visible on /jobs">
                  <input type="checkbox" checked={!!s.auto_publish} onChange={(e) => updateSource(s.id, { auto_publish: e.target.checked })} />
                  Auto‑publish
                </label>
                <label className="flex items-center gap-1" title="If disabled, this source is skipped by scheduled and manual runs">
                  <input type="checkbox" checked={!!s.active} onChange={(e) => updateSource(s.id, { active: e.target.checked })} />
                  Active
                </label>
                <button onClick={() => runIngestion(s.id)} disabled={running} className={`px-2 py-1 rounded border ${running ? 'opacity-60' : 'hover:bg-gray-50'}`} title="Run only this source now">
                  Run now
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <button className="text-sm underline" onClick={() => setShowInactive(!showInactive)}>
            {showInactive ? 'Hide' : 'Show'} inactive sources
          </button>
        </div>
        {showInactive ? (
          <div className="mt-2 space-y-2">
            {sources.filter((s) => !s.active).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 border rounded p-2 opacity-70">
                <div className="text-sm">
                  <div className="font-semibold">{s.label || `${s.type}:${s.org}`}</div>
                  <div className="text-gray-600">{s.type} • {s.org}</div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <label className="flex items-center gap-1" title="If enabled, newly ingested jobs from this source are immediately visible on /jobs">
                    <input type="checkbox" checked={!!s.auto_publish} onChange={(e) => updateSource(s.id, { auto_publish: e.target.checked })} />
                    Auto‑publish
                  </label>
                  <label className="flex items-center gap-1" title="If disabled, this source is skipped by scheduled and manual runs">
                    <input type="checkbox" checked={!!s.active} onChange={(e) => updateSource(s.id, { active: e.target.checked })} />
                    Active
                  </label>
                  <button onClick={() => runIngestion(s.id)} disabled={running} className={`px-2 py-1 rounded border ${running ? 'opacity-60' : 'hover:bg-gray-50'}`} title="Run only this source now">
                    Run now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {sourcesMsg ? <div className="text-sm text-gray-700 mt-2">{sourcesMsg}</div> : null}
      </div>
      <div className="border rounded p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Company" value={form.company || ''} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Location" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Apply link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Source (optional)" value={form.source || ''} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          <textarea className="border rounded px-3 py-2 md:col-span-2" placeholder="Short description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button onClick={saveJob} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save job</button>
          {msg ? <div className="text-sm text-gray-700">{msg}</div> : null}
        </div>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="space-y-10">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Needs review</h2>
              <button onClick={bulkPublish} className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700" title="Publish selected">
                Publish selected
              </button>
            </div>
            <div className="space-y-3">
              {needsReview.length === 0 ? <div className="text-sm text-gray-600">No items.</div> : null}
              {needsReview.map((j) => (
                <div key={j.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={!!selected[j.id as string]} onChange={(e) => setSelected({ ...selected, [j.id as string]: e.target.checked })} />
                      <div>
                        <div className="font-semibold">{j.title}</div>
                        <div className="text-sm text-gray-600">{j.company} {j.location ? `• ${j.location}` : ''}</div>
                        <div className="text-sm mt-1">{j.description}</div>
                        <a href={j.link} target="_blank" rel="noreferrer" className="text-sm underline mt-1 inline-block">Apply</a>
                      </div>
                    </div>
                    <button onClick={() => toggleVisible(j.id as string, !!j.visible)} className={`px-3 py-1 rounded ${j.visible ? 'bg-red-500 text-white' : 'bg-green-600 text-white'}`}>
                      {j.visible ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="font-semibold mb-3">Published</h2>
            <div className="space-y-3">
              {jobs.filter((j) => j.visible).map((j) => (
                <div key={j.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-semibold">{j.title}</div>
                      <div className="text-sm text-gray-600">{j.company} {j.location ? `• ${j.location}` : ''}</div>
                      <div className="text-sm mt-1">{j.description}</div>
                      <a href={j.link} target="_blank" rel="noreferrer" className="text-sm underline mt-1 inline-block">Apply</a>
                    </div>
                    <button onClick={() => toggleVisible(j.id as string, !!j.visible)} className={`px-3 py-1 rounded ${j.visible ? 'bg-red-500 text-white' : 'bg-green-600 text-white'}`}>
                      {j.visible ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}


