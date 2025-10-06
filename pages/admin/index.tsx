import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/db'

type Item = {
  id: string
  title: string
  link: string
  excerpt?: string
  source?: string
  thumbnail?: string | null
  published_at?: string
  visible?: boolean
}

export default function AdminPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [feedUrl, setFeedUrl] = useState('')
  const [ingesting, setIngesting] = useState(false)
  const [ingestMsg, setIngestMsg] = useState<string | null>(null)
  const [opml, setOpml] = useState('')
  const [importMsg, setImportMsg] = useState<string | null>(null)

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

  return (
    <div className="p-6">
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
            { label: 'The Fabricator (via Google News)', url: 'https://news.google.com/rss/search?q=site:thefabricator.com&hl=en-US&gl=US&ceid=US:en' },
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
          {importMsg ? <div className="text-sm text-gray-700">{importMsg}</div> : null}
        </div>
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="space-y-4">
          {items.map((it) => (
            <div key={it.id} className="p-3 border rounded-lg flex gap-4 items-start">
              {it.thumbnail ? <img src={it.thumbnail} alt="" className="w-24 h-24 object-cover rounded" /> : null}
              <div className="flex-1">
                <a href={it.link} target="_blank" rel="noreferrer" className="text-lg font-semibold link">
                  {it.title}
                </a>
                <div className="text-sm text-gray-600">{it.source} • {it.published_at?.slice(0,10)}</div>
                <p className="mt-2 text-sm">{it.excerpt?.slice(0,200)}</p>
              </div>
              <div>
                <button
                  onClick={() => toggleVisible(it.id, !!it.visible)}
                  className={`px-3 py-1 rounded ${it.visible ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                >
                  {it.visible ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


