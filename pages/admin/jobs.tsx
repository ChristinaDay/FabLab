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
  const [form, setForm] = useState<Job>({ title: '', company: '', location: '', link: '', description: '', source: '' })
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Jobs Admin</h1>
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
        <div>Loading…</div)
      ) : (
        <div className="space-y-4">
          {jobs.map((j) => (
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
      )}
    </div>
  )
}


