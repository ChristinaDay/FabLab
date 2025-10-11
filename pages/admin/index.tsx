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
  tags?: string[]
  featured_rank?: number | null
  pick_rank?: number | null
}

export default function AdminPage() {
  const TAGS = [
    { key: 'industrial-design', label: 'Industrial Design' },
    { key: 'architecture', label: 'Architecture' },
    { key: 'fabrication', label: 'Fabrication' },
    { key: 'design', label: 'Design' },
    { key: 'tools', label: 'Tools' },
    { key: 'materials', label: 'Materials' },
    { key: 'guides', label: 'Guides' },
  ]
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [feedUrl, setFeedUrl] = useState('')
  const [ingesting, setIngesting] = useState(false)
  const [ingestMsg, setIngestMsg] = useState<string | null>(null)
  const [opml, setOpml] = useState('')
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const [ingestTags, setIngestTags] = useState<string[]>([])
  const [bfSource, setBfSource] = useState('')
  const [bfTag, setBfTag] = useState('')
  const [bfMsg, setBfMsg] = useState<string | null>(null)
  const [addItem, setAddItem] = useState({ title: '', link: '', excerpt: '', source: '', thumbnail: '', tags: [] as string[], visible: true })
  const [addMsg, setAddMsg] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'published_at'|'source'|'title'>('published_at')
  const [sortDir, setSortDir] = useState<'desc'|'asc'>('desc')
  const [groupBy, setGroupBy] = useState<'none'|'date'|'source'|'topic'>('none')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email || ''
      const allow = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean)
      if (allow.length && !allow.includes(email)) {
        window.location.href = '/signin'
        return
      }
      fetchItems()
    })
  }, [])

  async function authedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const headers = {
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    } as Record<string, string>
    return fetch(input, { ...(init || {}), headers })
  }

  async function fetchItems() {
    setLoading(true)
    try {
      const res = await authedFetch('/api/admin/list')
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
      const res = await authedFetch('/api/admin/toggle-visible', {
        method: 'POST',
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
      const res = await authedFetch('/api/ingest', {
        method: 'POST',
        body: JSON.stringify({ feedUrl: targetUrl, tags: ingestTags.length ? ingestTags : undefined }),
      })
      const json = await res.json()
      if (!res.ok) {
        setIngestMsg(`Error: ${json.detail || json.error || 'Failed'}`)
      } else {
        setIngestMsg(`Imported ${json.count} from ${json.feed || targetUrl}${ingestTags.length ? ` • tags: ${ingestTags.join(', ')}` : ''}`)
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

  async function runBackfill() {
    setBfMsg(null)
    try {
      const res = await authedFetch('/api/admin/backfill-tags', {
        method: 'POST',
        body: JSON.stringify({ sourceContains: bfSource || undefined, addTag: bfTag }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed')
      setBfMsg(`Updated ${json.updated} items`)
      fetchItems()
    } catch (e: any) {
      setBfMsg(e.message || 'Failed to backfill')
    }
  }

  async function handleImportFeeds() {
    const urls = extractUrlsFromOpmlOrText(opml)
    if (urls.length === 0) {
      setImportMsg('No URLs found')
      return
    }
    try {
      const res = await authedFetch('/api/admin/feeds-bulk-add', {
        method: 'POST',
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
      const res = await authedFetch('/api/admin/backfill-thumbnails', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed')
      setImportMsg(`Backfilled ${json.updated} thumbnails (checked ${json.checked})`)
      fetchItems()
    } catch (e: any) {
      setImportMsg(e.message || 'Failed to backfill')
    }
  }

  async function saveIndividualItem() {
    setAddMsg(null)
    if (!addItem.title.trim() || !addItem.link.trim()) {
      setAddMsg('Title and Link are required')
      return
    }
    try {
      const res = await authedFetch('/api/admin/items-upsert', {
        method: 'POST',
        body: JSON.stringify({
          title: addItem.title.trim(),
          link: addItem.link.trim(),
          excerpt: addItem.excerpt || undefined,
          source: addItem.source || undefined,
          thumbnail: addItem.thumbnail || undefined,
          tags: addItem.tags.length ? addItem.tags : undefined,
          visible: addItem.visible,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed to save')
      setAddMsg('Saved')
      setAddItem({ title: '', link: '', excerpt: '', source: '', thumbnail: '', tags: [], visible: true })
      fetchItems()
    } catch (e: any) {
      setAddMsg(e.message || 'Failed')
    }
  }

  return (
    <>
      <Nav />
      <div className="px-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 mt-6">Editorial Admin</h1>
      <div className="mb-6 space-y-3">
        <div className="flex gap-2 flex-wrap items-center">
          <input
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            placeholder="https://example.com/feed.xml"
            className="flex-1 border rounded px-3 py-2"
          />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {TAGS.map((t) => (
              <label key={t.key} className="flex items-center gap-1 border rounded px-2 py-1">
                <input
                  type="checkbox"
                  checked={ingestTags.includes(t.key)}
                  onChange={(e) => setIngestTags((prev) => e.target.checked ? [...prev, t.key] : prev.filter((x) => x !== t.key))}
                />
                {t.label}
              </label>
            ))}
          </div>
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
              Ingest {f.label}{ingestTags.length ? ` → ${ingestTags.join(', ')}` : ''}
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
      {/* Backfill categories */}
      <div className="mb-8 space-y-2 border rounded p-4">
        <div className="font-medium">Backfill categories</div>
        <div className="text-sm text-gray-600">Add a tag to items matching a source substring.</div>
        <div className="flex flex-wrap gap-2 items-center">
          <input className="border rounded px-3 py-2" placeholder="Source contains (e.g. Core77)" value={bfSource} onChange={(e) => setBfSource(e.target.value)} />
          <select className="border rounded px-2 py-2" value={bfTag} onChange={(e) => setBfTag(e.target.value)}>
            <option value="">Choose tag…</option>
            <option value="industrial-design">Industrial Design</option>
            <option value="architecture">Architecture</option>
            <option value="fabrication">Fabrication</option>
            <option value="design">Design</option>
            <option value="tools">Tools</option>
            <option value="materials">Materials</option>
            <option value="guides">Guides</option>
          </select>
          <button onClick={runBackfill} className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700" disabled={!bfTag}>Run backfill</button>
          {bfMsg ? <div className="text-sm text-gray-700">{bfMsg}</div> : null}
        </div>
      </div>

      {/* Add individual item */}
      <div className="mb-8 space-y-2 border rounded p-4">
        <div className="font-medium">Add individual article/link</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input className="border rounded px-3 py-2" placeholder="Title" value={addItem.title} onChange={(e) => setAddItem({ ...addItem, title: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Link (URL)" value={addItem.link} onChange={(e) => setAddItem({ ...addItem, link: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Source (optional)" value={addItem.source} onChange={(e) => setAddItem({ ...addItem, source: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Thumbnail URL (optional)" value={addItem.thumbnail} onChange={(e) => setAddItem({ ...addItem, thumbnail: e.target.value })} />
          <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Excerpt (optional)" value={addItem.excerpt} onChange={(e) => setAddItem({ ...addItem, excerpt: e.target.value })} />
          <div className="flex items-center gap-2 md:col-span-2 flex-wrap">
            {TAGS.map((t) => (
              <label key={t.key} className="flex items-center gap-1 border rounded px-2 py-1">
                <input
                  type="checkbox"
                  checked={addItem.tags.includes(t.key)}
                  onChange={(e) => setAddItem({ ...addItem, tags: e.target.checked ? [...addItem.tags, t.key] : addItem.tags.filter((x) => x !== t.key) })}
                />
                {t.label}
              </label>
            ))}
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={addItem.visible} onChange={(e) => setAddItem({ ...addItem, visible: e.target.checked })} /> Publish immediately
            </label>
            <button onClick={saveIndividualItem} className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700">Save</button>
            {addMsg ? <div className="text-sm text-gray-700">{addMsg}</div> : null}
          </div>
        </div>
      </div>
      {/* Sort / Group controls */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <label className="text-sm flex items-center gap-2">
          <span>Sort by</span>
          <select className="border rounded px-2 py-1" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="published_at">Date published</option>
            <option value="source">Source</option>
            <option value="title">Title</option>
          </select>
        </label>
        <label className="text-sm flex items-center gap-2">
          <span>Order</span>
          <select className="border rounded px-2 py-1" value={sortDir} onChange={(e) => setSortDir(e.target.value as any)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </label>
        <label className="text-sm flex items-center gap-2">
          <span>Group by</span>
          <select className="border rounded px-2 py-1" value={groupBy} onChange={(e) => setGroupBy(e.target.value as any)}>
            <option value="none">None</option>
            <option value="date">Date</option>
            <option value="source">Source</option>
            <option value="topic">Topic</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <AdminItemsList items={items} sortBy={sortBy} sortDir={sortDir} groupBy={groupBy} onToggleVisible={toggleVisible} />
      )}
      </div>
    </>
  )
}

type AdminItemsListProps = {
  items: Item[]
  sortBy: 'published_at'|'source'|'title'
  sortDir: 'asc'|'desc'
  groupBy: 'none'|'date'|'source'|'topic'
  onToggleVisible: (id: string, current: boolean) => void
}

function AdminItemsList({ items, sortBy, sortDir, groupBy, onToggleVisible }: AdminItemsListProps) {
  const sorted = [...items].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    if (sortBy === 'published_at') {
      const av = a.published_at || ''
      const bv = b.published_at || ''
      return (av > bv ? 1 : av < bv ? -1 : 0) * dir
    }
    if (sortBy === 'source') {
      const av = (a.source || '').toLowerCase()
      const bv = (b.source || '').toLowerCase()
      return (av > bv ? 1 : av < bv ? -1 : 0) * dir
    }
    const av = (a.title || '').toLowerCase()
    const bv = (b.title || '').toLowerCase()
    return (av > bv ? 1 : av < bv ? -1 : 0) * dir
  })

  if (groupBy === 'none') {
    return (
      <div className="space-y-4">
        {sorted.map((it) => (
          <AdminItemRow key={it.id} it={it} onToggleVisible={onToggleVisible} />
        ))}
      </div>
    )
  }

  const groups: Record<string, Item[]> = {}
  for (const it of sorted) {
    let key = 'Other'
    if (groupBy === 'date') key = (it.published_at || '').slice(0, 10) || 'Unknown date'
    else if (groupBy === 'source') key = it.source || 'Unknown source'
    else if (groupBy === 'topic') key = (it.tags && it.tags[0]) || 'Untagged'
    if (!groups[key]) groups[key] = []
    groups[key].push(it)
  }

  const groupKeys = Object.keys(groups)
  return (
    <div className="space-y-8">
      {groupKeys.map((k) => (
        <section key={k}>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{k}</h3>
          <div className="space-y-4">
            {groups[k].map((it) => (
              <AdminItemRow key={it.id} it={it} onToggleVisible={onToggleVisible} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function AdminItemRow({ it, onToggleVisible }: { it: Item; onToggleVisible: (id: string, current: boolean) => void }) {
  const TAGS = [
    { key: 'industrial-design', label: 'Industrial Design' },
    { key: 'architecture', label: 'Architecture' },
    { key: 'fabrication', label: 'Fabrication' },
    { key: 'design', label: 'Design' },
    { key: 'tools', label: 'Tools' },
    { key: 'materials', label: 'Materials' },
    { key: 'guides', label: 'Guides' },
  ]
  const [tags, setTags] = React.useState<string[]>(Array.isArray(it.tags) ? it.tags : [])
  const [saving, setSaving] = React.useState(false)
  const [fRank, setFRank] = React.useState<string>(it.featured_rank == null ? '' : String(it.featured_rank))
  const [pRank, setPRank] = React.useState<string>(it.pick_rank == null ? '' : String(it.pick_rank))

  async function saveTags() {
    setSaving(true)
    try {
      const res = await authedFetch('/api/admin/items-update-tags', {
        method: 'POST',
        body: JSON.stringify({ id: it.id, tags }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed to save tags')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function saveCuration() {
    try {
      const featured_rank = fRank.trim() === '' ? null : Number(fRank)
      const pick_rank = pRank.trim() === '' ? null : Number(pRank)
      const res = await fetch('/api/admin/items-update-curation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: it.id, featured_rank, pick_rank }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed to save curation')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  return (
    <div className="p-3 border rounded-lg flex gap-4 items-start">
      {it.thumbnail ? <img src={it.thumbnail} alt="" className="w-24 h-24 object-cover rounded" /> : null}
      <div className="flex-1">
        <a href={it.link} target="_blank" rel="noreferrer" className="text-lg font-semibold link">
          {it.title}
        </a>
        <div className="text-sm text-gray-600">{it.source} • {it.published_at?.slice(0,10)}</div>
        <p className="mt-2 text-sm">{it.excerpt?.slice(0,200)}</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs underline">Edit tags</summary>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {TAGS.map((t) => (
              <label key={t.key} className="flex items-center gap-1 border rounded px-2 py-1">
                <input
                  type="checkbox"
                  checked={tags.includes(t.key)}
                  onChange={(e) => setTags((prev) => e.target.checked ? [...prev, t.key] : prev.filter((x) => x !== t.key))}
                />
                {t.label}
              </label>
            ))}
            <button onClick={saveTags} disabled={saving} className={`px-2 py-1 rounded ${saving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}>
              {saving ? 'Saving…' : 'Save tags'}
            </button>
          </div>
        </details>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs items-center">
          <label className="flex items-center gap-1">
            <span className="text-gray-600">Featured rank</span>
            <input value={fRank} onChange={(e) => setFRank(e.target.value)} placeholder="" className="w-16 border rounded px-2 py-1" />
          </label>
          <label className="flex items-center gap-1">
            <span className="text-gray-600">Pick rank</span>
            <input value={pRank} onChange={(e) => setPRank(e.target.value)} placeholder="" className="w-16 border rounded px-2 py-1" />
          </label>
          <button onClick={saveCuration} className="px-2 py-1 rounded border hover:bg-gray-50">Save curation</button>
        </div>
      </div>
      <div>
        <button
          onClick={() => onToggleVisible(it.id, !!it.visible)}
          className={`px-3 py-1 rounded ${it.visible ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
        >
          {it.visible ? 'Unpublish' : 'Publish'}
        </button>
      </div>
    </div>
  )
}


