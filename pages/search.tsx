import React from 'react'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/db'

const TAGS = [
  { key: 'industrial-design', label: 'Industrial Design' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'fabrication', label: 'Fabrication' },
  { key: 'design', label: 'Design' },
  { key: 'tools', label: 'Tools' },
  { key: 'materials', label: 'Materials' },
  { key: 'guides', label: 'Guides' },
]

export default function SearchPage({ q, results, selectedTags }: { q: string; results: any[]; selectedTags: string[] }) {
  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">Search results</h1>
        <form method="GET" action="/search" className="mb-4 flex gap-2 items-center flex-wrap">
          <input name="q" defaultValue={q} className="flex-1 min-w-[280px] border rounded px-3 py-2" placeholder="Search articles" />
          <button className="px-4 py-2 rounded border">Search</button>
          <div className="w-full flex flex-wrap gap-2 text-sm mt-2">
            {TAGS.map((t) => (
              <label key={t.key} className="flex items-center gap-1 border rounded px-2 py-1">
                <input type="checkbox" name="tags" value={t.key} defaultChecked={selectedTags.includes(t.key)} />
                {t.label}
              </label>
            ))}
          </div>
        </form>
        {(!results || results.length === 0) ? (
          <div className="text-gray-600">No results.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item: any) => (
              <article key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="w-full h-40 object-cover" />
                ) : null}
                <div className="p-4">
                  <a href={item.link} target="_blank" rel="noreferrer" className="font-semibold hover:underline">{item.title}</a>
                  <div className="text-xs text-gray-500 mt-1">{item.source} • {new Date(item.published_at).toLocaleDateString()}</div>
                  <p className="text-sm text-gray-600 mt-2">{item.excerpt?.slice(0, 160)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export async function getServerSideProps(context: { query: { [key: string]: any } }) {
  const q = String(context.query.q || '').trim()
  const rawTags = context.query.tags
  const selectedTags: string[] = Array.isArray(rawTags)
    ? (rawTags as string[])
    : (typeof rawTags === 'string' && rawTags.length ? rawTags.split(',') : [])
  let results: any[] = []

  let query = supabase
    .from('items')
    .select('*')
    .eq('visible', true)
    .order('published_at', { ascending: false })
    .limit(60)

  if (q) {
    // Search title OR excerpt OR source
    const esc = q.replace(/%/g, '\\%').replace(/_/g, '\\_')
    // @ts-ignore supabase-js or() filter
    query = query.or(`title.ilike.%${esc}%,excerpt.ilike.%${esc}%,source.ilike.%${esc}%`)
  }
  if (selectedTags.length) {
    // Prefer overlaps if available; fallback to OR contains
    const qAny: any = query as any
    if (typeof qAny.overlaps === 'function') {
      query = qAny.overlaps('tags', selectedTags)
    } else if (selectedTags.length === 1) {
      query = query.contains('tags', [selectedTags[0]]) as any
    } else {
      const ors = selectedTags.map((t) => `tags.cs.{${t}}`).join(',')
      // @ts-ignore
      query = query.or(ors)
    }
  }
  const { data, error } = await query
  if (!error && data) results = data

  return { props: { q, results, selectedTags } }
}


