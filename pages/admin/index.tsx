import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/db'
// Ensure admin API requests include the Supabase session token in production
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
import Nav from '@/components/Nav'
import EmbedOrImage from '@/components/EmbedOrImage'

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
  embed_html?: string | null
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
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [undoData, setUndoData] = useState<Item[] | null>(null)
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
  const [embedTitleMsg, setEmbedTitleMsg] = useState<string | null>(null)
  const [addItem, setAddItem] = useState({ title: '', link: '', excerpt: '', source: '', thumbnail: '', tags: [] as string[], visible: true })
  const [addMsg, setAddMsg] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'published_at'|'source'|'title'>('published_at')
  const [sortDir, setSortDir] = useState<'desc'|'asc'>('desc')
  const [groupBy, setGroupBy] = useState<'none'|'date'|'source'|'topic'|'visibility'>('none')
  const [addUrl, setAddUrl] = useState('')
  const [preview, setPreview] = useState<any | null>(null)
  const [previewMsg, setPreviewMsg] = useState<string | null>(null)
  const [publishTags, setPublishTags] = useState<string[]>([])
  const [manualTitle, setManualTitle] = useState('')
  const [manualImage, setManualImage] = useState('')
  const [customTag, setCustomTag] = useState('')
  const [showImageFallback, setShowImageFallback] = useState(false)

  useEffect(() => {
    let unsub: { unsubscribe: () => void } | null = null
    let redirectTimer: any
    async function init() {
      const allow = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean)
      const { data: { session } } = await supabase.auth.getSession()
      const email = session?.user?.email || ''
      if (email) {
        if (allow.length && !allow.includes(email)) {
          window.location.href = '/signin'
          return
        }
        fetchItems()
        return
      }
      // Wait for magic-link session establishment before deciding
      unsub = supabase.auth.onAuthStateChange((_event, sess) => {
        const em = sess?.user?.email || ''
        if (em) {
          if (allow.length && !allow.includes(em)) {
            window.location.href = '/signin'
            return
          }
          clearTimeout(redirectTimer)
          fetchItems()
        }
      }).data.subscription
      // Fallback: if no session after 8s, go to signin
      redirectTimer = setTimeout(() => {
        window.location.href = '/signin'
      }, 8000)
    }
    init()
    return () => {
      if (unsub) unsub.unsubscribe()
      if (redirectTimer) clearTimeout(redirectTimer)
    }
  }, [])

  // (helper defined at module scope for use in child components)

  async function fetchItems() {
    setLoading(true)
    try {
      const res = await authedFetch('/api/admin/list')
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed to load')
      setItems((json.items || []) as Item[])
      setSelectedIds([])
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function isEmbedCode(input: string): boolean {
    return input.trim().startsWith('<') && (input.includes('instagram-media') || input.includes('fb-post'))
  }

  async function previewOg() {
    setPreview(null)
    setPreviewMsg(null)
    const input = addUrl.trim()
    if (!input) return

    // If it's embed code, set it as preview with special flag
    if (isEmbedCode(input)) {
      setPreview({ embedHtml: input, title: 'Embedded content', siteName: 'Instagram/Facebook' } as any)
      setPreviewMsg('✓ Embed code detected - preview shown below')

      // Load Instagram embed script if needed
      if (input.includes('instagram-media') && !(window as any).instgrm) {
        const script = document.createElement('script')
        script.src = '//www.instagram.com/embed.js'
        script.async = true
        document.body.appendChild(script)
      }

      // Trigger Instagram embed processing after a short delay
      setTimeout(() => {
        if ((window as any).instgrm) {
          (window as any).instgrm.Embeds.process()
        }
      }, 500)

      return
    }

    // Otherwise try to fetch preview
    try {
      const res = await authedFetch(`/api/admin/preview-og?url=${encodeURIComponent(input)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed to preview')
      setPreview(json.meta)
      if (!json.meta) setPreviewMsg('No metadata found')
    } catch (e: any) {
      setPreviewMsg(e.message || 'Failed to preview')
    }
  }

  async function publishFromUrl() {
    const url = addUrl.trim()
    if (!url) return
    try {
      const res = await authedFetch('/api/admin/items-upsert-from-url', {
        method: 'POST',
        body: JSON.stringify({ url, tags: publishTags, visible: true, override: { title: manualTitle || undefined, image: manualImage || undefined } })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed to publish')
      setAddUrl('')
      setPreview(null)
      setPublishTags([])
      setManualTitle('')
      setManualImage('')
      setPreviewMsg('✓ Published successfully!')
      fetchItems()
    } catch (e: any) {
      setPreviewMsg(e.message || 'Failed to publish')
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
      {/* Bulk actions & Backfill categories */}
      <div className="mb-8 space-y-2 border rounded p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="font-medium">Backfill categories</div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if (!selectedIds.length) return
                if (!confirm(`Delete ${selectedIds.length} selected item(s)?`)) return
                // capture undo payload
                const undoPayload = items.filter((it) => selectedIds.includes(it.id))
                const res = await authedFetch('/api/admin/items-bulk-delete', {
                  method: 'POST',
                  body: JSON.stringify({ ids: selectedIds })
                })
                const json = await res.json()
                if (!res.ok) {
                  alert(json.detail || json.error || 'Failed to delete')
                  return
                }
                setUndoData(undoPayload)
                fetchItems()
              }}
              disabled={!selectedIds.length}
              className={`px-3 py-2 rounded ${selectedIds.length ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-300 text-gray-600'}`}
            >
              Delete selected
            </button>
            <button
              onClick={async () => {
                setEmbedTitleMsg(null)
                try {
                  const res = await authedFetch('/api/admin/backfill-embed-titles', { method: 'POST' })
                  const json = await res.json()
                  if (!res.ok) throw new Error(json.detail || json.error || 'Failed')
                  setEmbedTitleMsg(`Updated ${json.updated} of ${json.scanned} items`)
                  fetchItems()
                } catch (e: any) {
                  setEmbedTitleMsg(e.message || 'Failed to backfill')
                }
              }}
              className="px-3 py-2 rounded border hover:bg-gray-50"
            >
              Backfill embed titles
            </button>
          </div>
        </div>
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

      {embedTitleMsg ? (
        <div className="mb-4 text-sm text-gray-700">{embedTitleMsg}</div>
      ) : null}

      {undoData && undoData.length ? (
        <div className="mb-4 p-3 rounded border bg-yellow-50 text-yellow-800 flex items-center justify-between gap-3">
          <div>
            Deleted {undoData.length} item(s).
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded border border-yellow-700 hover:bg-yellow-100"
              onClick={async () => {
                // restore via upsert
                try {
                  const res = await authedFetch('/api/admin/items-upsert', {
                    method: 'POST',
                    body: JSON.stringify({
                      // restore first item only for simplicity?
                    })
                  })
                } catch {}
              }}
              disabled
            >
              Undo (coming soon)
            </button>
            <button className="px-3 py-1 rounded border" onClick={() => setUndoData(null)}>Dismiss</button>
          </div>
        </div>
      ) : null}

      {/* Add by URL (social or any share link) */}
      <div className="mb-8 space-y-2 border rounded p-4">
        <div className="font-medium">Add content by URL</div>
        <div className="text-sm text-gray-400 mb-2">
          Paste a URL or Instagram/Facebook embed code (click "Embed" on the post and copy the entire code)
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input className="flex-1 border rounded px-3 py-2" placeholder="https://... or <blockquote class=..." value={addUrl} onChange={(e) => setAddUrl(e.target.value)} />
          <button onClick={previewOg} className="px-3 py-2 rounded border hover:bg-gray-50">Preview</button>
          <button onClick={publishFromUrl} className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700" disabled={!addUrl.trim()}>Publish</button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {TAGS.map((t) => (
            <label key={t.key} className="flex items-center gap-1 border rounded px-2 py-1">
              <input
                type="checkbox"
                checked={publishTags.includes(t.key)}
                onChange={(e) => setPublishTags((prev) => e.target.checked ? [...prev, t.key] : prev.filter((x) => x !== t.key))}
              />
              {t.label}
            </label>
          ))}
          <div className="flex items-center gap-2">
            <input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Add tag"
              className="border rounded px-2 py-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const t = customTag.trim()
                  if (t && !publishTags.includes(t)) setPublishTags((prev) => [...prev, t])
                  setCustomTag('')
                }
              }}
            />
            <button
              type="button"
              className="px-2 py-1 rounded border hover:bg-gray-50"
              onClick={() => {
                const t = customTag.trim()
                if (t && !publishTags.includes(t)) setPublishTags((prev) => [...prev, t])
                setCustomTag('')
              }}
            >
              Add
            </button>
          </div>
          {publishTags.length ? (
            <div className="flex flex-wrap items-center gap-1">
              {publishTags.map((t) => (
                <span key={`sel-${t}`} className="inline-flex items-center gap-1 px-2 py-0.5 border rounded">
                  {t}
                  <button type="button" onClick={() => setPublishTags((prev) => prev.filter((x) => x !== t))}>×</button>
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {preview ? (
          <div className="mt-3 p-3 border border-gray-600 rounded">
            <div className="text-xs uppercase tracking-wide text-gray-400">{preview.siteName || ((preview as any).embedHtml?.includes('instagram-media') ? 'Instagram' : (preview as any).embedHtml?.includes('fb-post') ? 'Facebook' : '')}</div>
            <div className="font-semibold">{preview.title || ((preview as any).embedHtml ? 'Embedded content' : <span className="text-red-500">⚠️ No title found</span>)}</div>
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-3">
              <label className="flex items-center gap-1">
                <input type="radio" name="preview-media-mode" checked={!showImageFallback} onChange={() => setShowImageFallback(false)} />
                <span>Embed</span>
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" name="preview-media-mode" checked={showImageFallback} onChange={() => setShowImageFallback(true)} />
                <span>Thumbnail fallback</span>
              </label>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded p-2">
                <div className="text-xs uppercase tracking-wide text-gray-500">Main story</div>
                {(showImageFallback ? !!preview.image : (Boolean((preview as any).embedHtml) || !!preview.image)) ? (
                  <div className="mt-2">
                    <EmbedOrImage
                      embedHtml={showImageFallback ? undefined : (preview as any).embedHtml}
                      thumbnail={preview.image}
                      title={preview.title || 'Embedded content'}
                      lazy={false}
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-800 mt-2 rounded flex items-center justify-center text-gray-400 text-sm">⚠️ No media</div>
                )}
              </div>
              <div className="border rounded p-2">
                <div className="text-xs uppercase tracking-wide text-gray-500">Sidebar: From Social</div>
                {(showImageFallback ? !!preview.image : (Boolean((preview as any).embedHtml) || !!preview.image)) ? (
                  <div className="mt-2">
                    <EmbedOrImage
                      embedHtml={showImageFallback ? undefined : (preview as any).embedHtml}
                      thumbnail={preview.image}
                      title={preview.title || 'Embedded content'}
                      lazy={false}
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-800 mt-2 rounded flex items-center justify-center text-gray-400 text-sm">⚠️ No media</div>
                )}
              </div>
              <div className="border rounded p-2">
                <div className="text-xs uppercase tracking-wide text-gray-500">Grid card</div>
                {(showImageFallback ? !!preview.image : (Boolean((preview as any).embedHtml) || !!preview.image)) ? (
                  <div className="mt-2">
                    <EmbedOrImage
                      embedHtml={showImageFallback ? undefined : (preview as any).embedHtml}
                      thumbnail={preview.image}
                      title={preview.title || 'Embedded content'}
                      lazy={false}
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-800 mt-2 rounded flex items-center justify-center text-gray-400 text-sm">⚠️ No media</div>
                )}
              </div>
            </div>
            {preview.description ? <p className="text-sm mt-3 text-gray-300">{preview.description}</p> : null}
          </div>
        ) : null}
        {previewMsg ? <div className="text-sm text-green-700 bg-green-50 p-2 rounded mt-2">{previewMsg}</div> : null}
        {/* Manual title/caption overrides always available */}
        <div className="mt-3 p-3 border rounded border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="text-xs block mb-1">Title override</label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder={preview?.title || 'Enter title'}
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs block mb-1">Caption (optional)</label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Add a caption"
                value={manualImage}
                onChange={(e) => setManualImage(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* Manual overrides - only show if NOT embed code */}
        {(preview && !(preview as any).embedHtml) || (!preview && previewMsg && !previewMsg.includes('Embed code detected')) ? (
          <div className={`mt-3 p-3 border rounded ${(!preview?.title || !preview?.image) ? 'border-amber-500' : 'border-gray-600'}`}>
            <div className="text-sm font-medium mb-2">
              {(!preview?.title || !preview?.image) ? (
                <span className="text-amber-500">⚠️ Preview incomplete - Add missing info manually:</span>
              ) : (
                <span>✓ Preview loaded - Optionally override below:</span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="text-xs block mb-1">Title {!preview?.title && <span className="text-red-500">*</span>}</label>
                <input
                  className={`w-full border rounded px-3 py-2 ${!preview?.title ? 'border-amber-500' : 'border-gray-600'}`}
                  placeholder={preview?.title || "Enter title manually"}
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs block mb-1">Image URL {!preview?.image && <span className="text-red-500">*</span>}</label>
                <input
                  className={`w-full border rounded px-3 py-2 ${!preview?.image ? 'border-amber-500' : 'border-gray-600'}`}
                  placeholder={preview?.image || "Paste image URL manually"}
                  value={manualImage}
                  onChange={(e) => setManualImage(e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : null}
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
            <option value="visibility">Visibility</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <>
          {/* Embedded content section */}
          {items.some((it) => !!(it as any).embed_html) ? (
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Embedded Content</h2>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <input id="bulk-add-tag" placeholder="Add tag to selected" className="border rounded px-2 py-1" onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    const t = (e.target as HTMLInputElement).value.trim()
                    if (!t || selectedIds.length === 0) return
                    await authedFetch('/api/admin/items-bulk-update-tags', { method: 'POST', body: JSON.stringify({ ids: selectedIds, addTag: t }) })
                    ;(e.target as HTMLInputElement).value = ''
                    fetchItems()
                  }
                }} />
                <button
                  className="px-2 py-1 rounded border hover:bg-gray-50"
                  onClick={async () => {
                    const input = document.getElementById('bulk-add-tag') as HTMLInputElement
                    const t = input?.value.trim()
                    if (!t || selectedIds.length === 0) return
                    await authedFetch('/api/admin/items-bulk-update-tags', { method: 'POST', body: JSON.stringify({ ids: selectedIds, addTag: t }) })
                    if (input) input.value = ''
                    fetchItems()
                  }}
                >Add tag</button>
                <input id="bulk-remove-tag" placeholder="Remove tag from selected" className="border rounded px-2 py-1" onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    const t = (e.target as HTMLInputElement).value.trim()
                    if (!t || selectedIds.length === 0) return
                    await authedFetch('/api/admin/items-bulk-update-tags', { method: 'POST', body: JSON.stringify({ ids: selectedIds, removeTag: t }) })
                    ;(e.target as HTMLInputElement).value = ''
                    fetchItems()
                  }
                }} />
                <button
                  className="px-2 py-1 rounded border hover:bg-gray-50"
                  onClick={async () => {
                    const input = document.getElementById('bulk-remove-tag') as HTMLInputElement
                    const t = input?.value.trim()
                    if (!t || selectedIds.length === 0) return
                    await authedFetch('/api/admin/items-bulk-update-tags', { method: 'POST', body: JSON.stringify({ ids: selectedIds, removeTag: t }) })
                    if (input) input.value = ''
                    fetchItems()
                  }}
                >Remove tag</button>
              </div>
              <AdminEmbedsList
                items={items.filter((it) => !!(it as any).embed_html)}
                onToggleVisible={toggleVisible}
                onDeleted={fetchItems}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            </section>
          ) : null}

          {/* Regular items (non-embed) */}
          <section>
            <h2 className="text-lg font-semibold mb-3">All Items</h2>
            <AdminItemsList
              items={items.filter((it) => !(it as any).embed_html)}
              sortBy={sortBy}
              sortDir={sortDir}
              groupBy={groupBy}
              onToggleVisible={toggleVisible}
              onDeleted={fetchItems}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
            />
          </section>
        </>
      )}
      </div>
    </>
  )
}

type AdminItemsListProps = {
  items: Item[]
  sortBy: 'published_at'|'source'|'title'
  sortDir: 'asc'|'desc'
  groupBy: 'none'|'date'|'source'|'topic'|'visibility'
  onToggleVisible: (id: string, current: boolean) => void
  onDeleted: () => void
  selectedIds: string[]
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
}

function AdminItemsList({ items, sortBy, sortDir, groupBy, onToggleVisible, onDeleted, selectedIds, setSelectedIds }: AdminItemsListProps) {
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
          <AdminItemRow key={it.id} it={it} onToggleVisible={onToggleVisible} onDeleted={onDeleted} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
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
    else if (groupBy === 'visibility') key = it.visible ? 'Published' : 'Unpublished'
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
              <AdminItemRow key={it.id} it={it} onToggleVisible={onToggleVisible} onDeleted={onDeleted} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function AdminItemRow({ it, onToggleVisible, onDeleted, selectedIds, setSelectedIds }: { it: Item; onToggleVisible: (id: string, current: boolean) => void; onDeleted: () => void; selectedIds: string[]; setSelectedIds: React.Dispatch<React.SetStateAction<string[]>> }) {
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
      const res = await authedFetch('/api/admin/items-update-curation', {
        method: 'POST',
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
      <input
        type="checkbox"
        className="mt-1"
        checked={selectedIds.includes(it.id)}
        onChange={(e) => setSelectedIds((prev) => e.target.checked ? [...prev, it.id] : prev.filter((x) => x !== it.id))}
      />
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
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onToggleVisible(it.id, !!it.visible)}
          className={`px-3 py-1 rounded ${it.visible ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
        >
          {it.visible ? 'Unpublish' : 'Publish'}
        </button>
        <DeleteItemButton id={it.id} onDeleted={onDeleted} />
      </div>
    </div>
  )
}

function AdminEmbedsList({ items, onToggleVisible, onDeleted, selectedIds, setSelectedIds }: { items: Item[]; onToggleVisible: (id: string, current: boolean) => void; onDeleted: () => void; selectedIds: string[]; setSelectedIds: React.Dispatch<React.SetStateAction<string[]>> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it) => (
        <AdminEmbedCard key={it.id} it={it} onToggleVisible={onToggleVisible} onDeleted={onDeleted} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
      ))}
    </div>
  )
}

function AdminEmbedCard({ it, onToggleVisible, onDeleted, selectedIds, setSelectedIds }: { it: Item; onToggleVisible: (id: string, current: boolean) => void; onDeleted: () => void; selectedIds: string[]; setSelectedIds: React.Dispatch<React.SetStateAction<string[]>> }) {
  const [tags, setTags] = React.useState<string[]>(Array.isArray((it as any).tags) ? ((it as any).tags as string[]) : [])
  const [newTag, setNewTag] = React.useState('')

  async function saveTags() {
    try {
      const res = await authedFetch('/api/admin/items-update-tags', { method: 'POST', body: JSON.stringify({ id: it.id, tags }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed to save tags')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  return (
    <div className="p-3 border rounded-lg flex flex-col">
      <div className="flex items-start gap-2 mb-2">
        <input
          type="checkbox"
          className="mt-1"
          checked={selectedIds.includes(it.id)}
          onChange={(e) => setSelectedIds((prev) => e.target.checked ? [...prev, it.id] : prev.filter((x) => x !== it.id))}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <a href={it.link} target="_blank" rel="noreferrer" className="text-sm font-semibold link">{it.title || 'Embedded content'}</a>
              <div className="text-xs text-gray-600">{it.source} • {it.published_at?.slice(0,10)}</div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onToggleVisible(it.id, !!it.visible)}
                className={`px-2 py-1 rounded text-xs ${it.visible ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
              >
                {it.visible ? 'Unpublish' : 'Publish'}
              </button>
              <DeleteItemButton id={it.id} onDeleted={onDeleted} />
            </div>
          </div>
        </div>
      </div>
      <EmbedOrImage
        embedHtml={(it as any).embed_html as any}
        thumbnail={it.thumbnail}
        title={it.title || ''}
        lazy={false}
        maxHeight={360}
        collapsible
      />
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs items-center">
        <label className="flex items-center gap-1">
          <span className="text-gray-600">Featured rank</span>
          <input defaultValue={it.featured_rank == null ? '' : String(it.featured_rank)} placeholder="" className="w-16 border rounded px-2 py-1" onBlur={(e) => {
            const v = e.target.value
            const detail = { id: it.id, f: v.trim() === '' ? null : Number(v) }
            fetch('/api/admin/items-update-curation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: detail.id, featured_rank: detail.f, pick_rank: it.pick_rank == null ? null : Number(it.pick_rank) }) })
          }} />
        </label>
        <label className="flex items-center gap-1">
          <span className="text-gray-600">Pick rank</span>
          <input defaultValue={it.pick_rank == null ? '' : String(it.pick_rank)} placeholder="" className="w-16 border rounded px-2 py-1" onBlur={(e) => {
            const v = e.target.value
            const detail = { id: it.id, p: v.trim() === '' ? null : Number(v) }
            fetch('/api/admin/items-update-curation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: detail.id, featured_rank: it.featured_rank == null ? null : Number(it.featured_rank), pick_rank: detail.p }) })
          }} />
        </label>
      </div>
      <div className="mt-3">
        <div className="text-xs text-gray-600 mb-1">Tags</div>
        <div className="flex flex-wrap items-center gap-1 mb-2">
          {tags.map((t) => (
            <span key={`${it.id}-tag-${t}`} className="inline-flex items-center gap-1 px-2 py-0.5 border rounded">
              {t}
              <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))}>×</button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add tag" className="border rounded px-2 py-1 text-sm flex-1" onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const t = newTag.trim()
              if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
              setNewTag('')
            }
          }} />
          <button className="px-2 py-1 rounded border text-xs hover:bg-gray-50" onClick={() => {
            const t = newTag.trim()
            if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
            setNewTag('')
          }}>Add</button>
          <button className="px-2 py-1 rounded border text-xs hover:bg-gray-50" onClick={saveTags}>Save tags</button>
        </div>
      </div>
    </div>
  )
}

function DeleteItemButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [busy, setBusy] = React.useState(false)
  async function doDelete() {
    if (!confirm('Delete this item permanently? This cannot be undone.')) return
    setBusy(true)
    try {
      const res = await authedFetch('/api/admin/items-delete', {
        method: 'POST',
        body: JSON.stringify({ id })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || 'Failed to delete')
      onDeleted()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete')
    } finally {
      setBusy(false)
    }
  }
  return (
    <button onClick={doDelete} disabled={busy} className={`px-3 py-1 rounded ${busy ? 'bg-gray-400' : 'bg-black text-white hover:bg-gray-800'}`}>
      {busy ? 'Deleting…' : 'Delete'}
    </button>
  )
}


