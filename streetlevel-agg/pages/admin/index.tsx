import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/db'
import Nav from '@/components/Nav'

type Item = {
  id: string
  title: string
  link: string
  excerpt?: string
  source?: string
  thumbnail?: string | null
  published_at?: string
  visible?: boolean
  created_at?: string
  updated_at?: string
}

export default function AdminPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [feedUrl, setFeedUrl] = useState('')
  const [ingesting, setIngesting] = useState(false)
  const [ingestMsg, setIngestMsg] = useState<string | null>(null)
  const [opml, setOpml] = useState('')
  const [importMsg, setImportMsg] = useState<string | null>(null)

  // Sorting / grouping UI state
  const [sortKey, setSortKey] = useState<'published_at' | 'created_at' | 'updated_at' | 'source'>('published_at')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [groupBy, setGroupBy] = useState<'none' | 'source' | 'visible' | 'feedDay' | 'appDay'>('none')

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/list')
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed to load')
      setItems((json.items || []) as Item[])
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function toggleVisible(id: string, current: boolean) {
    try {
      const res = await fetch('/api/admin/toggle-visible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, visible: !current }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed')
      fetchItems()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  async function ingestFeed(url?: string) {
    const targetUrl = (url ?? feedUrl).trim()
    if (!targetUrl) return
    setIngesting(true)
    setIngestMsg(null)
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedUrl: targetUrl }),
      })
      const json = await res.json()
      if (!res.ok) {
        setIngestMsg(`Error: ${json.detail || json.error || 'Failed'}`)
      } else {
        setIngestMsg(`Imported ${json.count} from ${json.feed || targetUrl}`)
        setFeedUrl('')
        fetchItems()
      }
    } catch (e) {
      setIngestMsg('Network error')
    } finally {
      setIngesting(false)
    }
  }

  function extractUrlsFromOpmlOrText(text: string): string[] {
    const urls: string[] = []
    // Try OPML: look for xmlUrl attributes
    const opmlUrlRegex = /xmlUrl="([^"]+)"/g
    let m: RegExpExecArray | null
    while ((m = opmlUrlRegex.exec(text)) !== null) {
      urls.push(m[1])
    }
    // Also parse newline-separated URLs
    text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith('http'))
      .forEach((u) => urls.push(u))
    // de-dup
    return Array.from(new Set(urls))
  }

  async function handleImportFeeds() {
    const urls = extractUrlsFromOpmlOrText(opml)
    if (urls.length === 0) {
      setImportMsg('No URLs found')
      return
    }
    try {
      const res = await fetch('/api/admin/feeds-bulk-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed')
      setImportMsg(`Imported/updated ${json.count} feeds`)
      setOpml('')
    } catch (e: any) {
      setImportMsg(e.message || 'Failed to import')
    }
  }

  async function backfillThumbnails() {
    try {
      const res = await fetch('/api/admin/backfill-thumbnails', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed')
      setImportMsg(`Backfilled ${json.updated} thumbnails (checked ${json.checked})`)
      fetchItems()
    } catch (e: any) {
      setImportMsg(e.message || 'Failed to backfill')
    }
  }

  return (
    <>
      <Nav />
      <div className="px-6 pt-4 md:pt-6">
      <h1 className="text-2xl font-bold mb-4">Editorial Admin</h1>
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          <input
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            placeholder="https://example.com/feed.xml"
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={() => ingestFeed()}
            disabled={ingesting || !feedUrl.trim()}
            className={`px-4 py-2 rounded text-white ${ingesting || !feedUrl.trim() ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {ingesting ? 'Ingesting…' : 'Ingest feed'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {[
            { label: 'Make:', url: 'https://makezine.com/feed/' },
            { label: 'Core77', url: 'https://www.core77.com/feed' },
            { label: 'The Fabricator', url: 'https://www.thefabricator.com/metal_fabricating_news.rss' },
          ].map((f) => (
            <button
              key={f.url}
              onClick={() => ingestFeed(f.url)}
              className="px-3 py-1 rounded border hover:bg-gray-50"
            >
              Ingest {f.label}
            </button>
          ))}
        </div>
        {ingestMsg ? <div className="text-sm text-gray-700">{ingestMsg}</div> : null}
      </div>
      <div className="mb-8 space-y-3">
        <div className="text-sm font-medium">Import feeds (paste OPML or newline list of URLs)</div>
        <textarea
          value={opml}
          onChange={(e) => setOpml(e.target.value)}
          placeholder="Paste OPML XML or a list of feed URLs (one per line)"
          className="w-full h-40 border rounded p-2 font-mono text-xs"
        />
        <div className="flex gap-2">
          <button
            onClick={handleImportFeeds}
            className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Import feeds
          </button>
          <button
            onClick={backfillThumbnails}
            className="px-3 py-1 rounded border hover:bg-gray-50"
          >
            Backfill thumbnails
          </button>
          {importMsg ? <div className="text-sm text-gray-700">{importMsg}</div> : null}
        </div>
      </div>

      {/* Toolbar: sorting and grouping (moved below import feeds, above list) */}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-gray-400">Sort by</label>
          <select className="border rounded px-2 py-1" value={sortKey} onChange={(e) => setSortKey(e.target.value as any)}>
            <option value="published_at">Feed date</option>
            <option value="created_at">App created</option>
            <option value="updated_at">App updated</option>
            <option value="source">Source</option>
          </select>
          <button
            className="px-2 py-1 rounded border hover:bg-gray-50"
            onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
            title="Toggle sort direction"
          >
            {sortDir === 'desc' ? '↓' : '↑'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-400">Group</label>
          <select className="border rounded px-2 py-1" value={groupBy} onChange={(e) => setGroupBy(e.target.value as any)}>
            <option value="none">None</option>
            <option value="source">By source</option>
            <option value="visible">By published</option>
            <option value="feedDay">By feed date (day)</option>
            <option value="appDay">By app date (day)</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <ItemsList
          items={items}
          sortKey={sortKey}
          sortDir={sortDir}
          groupBy={groupBy}
          onToggle={toggleVisible}
        />
      )}
      </div>
    </>
  )
}

type ItemsListProps = {
  items: Item[]
  sortKey: 'published_at' | 'created_at' | 'updated_at' | 'source'
  sortDir: 'desc' | 'asc'
  groupBy: 'none' | 'source' | 'visible' | 'feedDay' | 'appDay'
  onToggle: (id: string, current: boolean) => void
}

function ItemsList({ items, sortKey, sortDir, groupBy, onToggle }: ItemsListProps) {
  const toTime = (d?: string) => (d ? new Date(d).getTime() : 0)
  const sorted = [...items].sort((a, b) => {
    let av: string | number = ''
    let bv: string | number = ''
    if (sortKey === 'source') {
      av = (a.source || '').toLowerCase()
      bv = (b.source || '').toLowerCase()
      return sortDir === 'asc' ? (av > bv ? 1 : av < bv ? -1 : 0) : (av < bv ? 1 : av > bv ? -1 : 0)
    }
    if (sortKey === 'published_at') {
      av = toTime(a.published_at)
      bv = toTime(b.published_at)
    } else if (sortKey === 'created_at') {
      av = toTime(a.created_at)
      bv = toTime(b.created_at)
    } else {
      av = toTime(a.updated_at)
      bv = toTime(b.updated_at)
    }
    return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })

  const renderItem = (it: Item) => (
    <div key={it.id} className="p-3 border rounded-lg flex gap-4 items-start">
      {it.thumbnail ? <img src={it.thumbnail} alt="" className="w-24 h-24 object-cover rounded" /> : null}
      <div className="flex-1">
        <a href={it.link} target="_blank" rel="noreferrer" className="text-lg font-semibold link">
          {it.title}
        </a>
        <div className="text-sm text-gray-600">
          {it.source} • {it.published_at?.slice(0,10)}
        </div>
        <p className="mt-2 text-sm">{it.excerpt?.slice(0,200)}</p>
      </div>
      <div>
        <button
          onClick={() => onToggle(it.id, !!it.visible)}
          className={`px-3 py-1 rounded ${it.visible ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
        >
          {it.visible ? 'Unpublish' : 'Publish'}
        </button>
      </div>
    </div>
  )

  if (groupBy === 'none') {
    return <div className="space-y-4">{sorted.map(renderItem)}</div>
  }

  const groups = new Map<string, Item[]>()
  const keyFor = (it: Item) => {
    if (groupBy === 'source') return it.source || 'Unknown'
    if (groupBy === 'visible') return it.visible ? 'Published' : 'Unpublished'
    if (groupBy === 'feedDay') return (it.published_at || '').slice(0, 10) || 'Unknown date'
    // appDay: prefer updated_at, fallback to created_at
    return (it.updated_at || it.created_at || '').slice(0, 10) || 'Unknown date'
  }
  for (const it of sorted) {
    const k = keyFor(it)
    groups.set(k, [...(groups.get(k) || []), it])
  }
  // Render groups sorted by label
  const groupEntries = Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  return (
    <div className="space-y-6">
      {groupEntries.map(([label, arr]) => (
        <section key={label}>
          <h2 className="font-semibold mb-2">{label} <span className="text-xs text-gray-500">({arr.length})</span></h2>
          <div className="space-y-3">
            {arr.map(renderItem)}
          </div>
        </section>
      ))}
    </div>
  )
}


