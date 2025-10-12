import React, { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import dynamic from 'next/dynamic'
const BookmarkButton = dynamic(() => import('@/components/BookmarkButton'), { ssr: false })
const LikeButton = dynamic(() => import('@/components/LikeButton'), { ssr: false })
import { supabase } from '@/lib/db'

type Item = { id: string; title: string; link: string; source?: string; thumbnail?: string | null; published_at?: string; excerpt?: string }

export default function Dashboard() {
  const TAGS = [
    { key: 'industrial-design', label: 'Industrial Design' },
    { key: 'architecture', label: 'Architecture' },
    { key: 'fabrication', label: 'Fabrication' },
    { key: 'design', label: 'Design' },
    { key: 'tools', label: 'Tools' },
    { key: 'materials', label: 'Materials' },
    { key: 'guides', label: 'Guides' },
  ]
  const [userId, setUserId] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [prefs, setPrefs] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [recommended, setRecommended] = useState<Item[]>([])
  const [liked, setLiked] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id || null
      setUserId(uid)
      if (uid) loadData(uid)
    })
  }, [])

  async function authedFetch(path: string, init?: RequestInit) {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const headers = { ...(init?.headers || {}), ...(token ? { 'x-user-id': session?.user?.id || '' } : {}), 'Content-Type': 'application/json' }
    return fetch(path, { ...(init || {}), headers })
  }

  async function loadData(uid: string) {
    const [bRes, pRes, lRes] = await Promise.all([
      authedFetch(`/api/user/bookmarks-list?user_id=${uid}`),
      authedFetch(`/api/user/prefs-get?user_id=${uid}`),
      authedFetch(`/api/user/likes-list?user_id=${uid}`)
    ])
    const [bJson, pJson, lJson] = await Promise.all([bRes.json(), pRes.json(), lRes.json()])
    if (bRes.ok) setBookmarks(bJson.items || [])
    if (pRes.ok) {
      setPrefs(pJson.tags || [])
      await refreshRecommended(pJson.tags || [])
    }
    if (lRes.ok) setLiked(lJson.items || [])
  }

  async function savePrefs(tags: string[]) {
    if (!userId) return
    await authedFetch('/api/user/prefs-upsert', { method: 'POST', body: JSON.stringify({ user_id: userId, tags }) })
    setPrefs(tags)
    await refreshRecommended(tags)
  }

  async function removeTag(tag: string) {
    const next = prefs.filter((t) => t !== tag)
    await savePrefs(next)
  }

  async function toggleTag(tag: string, checked: boolean) {
    const next = checked ? Array.from(new Set([...prefs, tag])) : prefs.filter((t) => t !== tag)
    await savePrefs(next)
  }

  async function refreshRecommended(tags: string[]) {
    if (tags.length === 0) { setRecommended([]); return }
    const excludeIds = bookmarks.map((b) => b.item_id).join(',')
    const res = await fetch(`/api/user/recommended?tags=${encodeURIComponent(tags.join(','))}&exclude=${encodeURIComponent(excludeIds)}`)
    const json = await res.json()
    if (res.ok) setRecommended(json.items || [])
  }

  if (!userId) {
    return (
      <>
        <Nav />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">Sign in to see your dashboard.</div>
        </main>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 md:col-span-4 lg:col-span-3 md:sticky md:top-20 self-start">
            <section className="mb-6">
              <div className="text-sm text-black/70 dark:text-white/80">Your interests</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {prefs.map((t) => (
                  <span key={t} className="px-2 py-1 text-sm border rounded text-black dark:text-white border-black/30 dark:border-white/30">
                    {t}
                    <button onClick={() => removeTag(t)} className="ml-1 text-black/60 dark:text-white/60" title="Remove">×</button>
                  </span>
                ))}
              </div>
            </section>
            <section id="edit-interests" className="border rounded p-4 border-black/20 dark:border-white/20">
              <div className="font-semibold mb-3">Manage interests</div>
              <div className="grid grid-cols-1 gap-2 mb-3 text-sm">
                {TAGS.map((t) => (
                  <label key={t.key} className="flex items-center gap-2 border rounded px-2 py-1 border-black/20 dark:border-white/20">
                    <input
                      type="checkbox"
                      checked={prefs.includes(t.key)}
                      onChange={(e) => toggleTag(t.key, e.target.checked)}
                    />
                    {t.label}
                  </label>
                ))}
              </div>
              <form onSubmit={async (e) => { e.preventDefault(); const tag = newTag.trim().toLowerCase(); if (!tag) return; const next = Array.from(new Set([...prefs, tag])); await savePrefs(next); setNewTag('') }} className="flex gap-2">
                <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add a tag (e.g. fabrication)" className="border rounded px-3 py-2 flex-1" />
                <button className="px-3 py-2 border rounded">Add</button>
              </form>
            </section>
          </aside>
          <section className="col-span-12 md:col-span-8 lg:col-span-6">
            <h1 className="text-2xl font-bold mb-4">Your Reading List</h1>
            {bookmarks.length > 0 ? (
              <section className="mb-8">
                <div className="font-semibold mb-2">Your bookmarks</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {bookmarks.map((b) => {
                        const it = (b.items || {}) as Item
                        return (
                          <article key={`bm-${b.item_id}`} className="border p-3 hover:bg-black/5 flex flex-col h-full">
                            <div className="mb-2 flex items-center justify-between">
                              <LikeButton itemId={it.id} />
                              <BookmarkButton itemId={it.id} />
                            </div>
                            {it.thumbnail ? <img src={it.thumbnail} alt="" className="w-full h-36 object-cover mb-3" /> : null}
                            <a href={it.link} target="_blank" rel="noreferrer" className="block font-semibold leading-snug hover:underline">{it.title}</a>
                            <div className="text-[11px] text-gray-500 mt-1">{it.source} • {it.published_at?.slice(0,10)}</div>
                          </article>
                        )
                      })}
                    </div>
                <div className="mt-6 border-t border-white/30" />
              </section>
            ) : null}
            {recommended.length > 0 ? (
              <section className="mb-8">
                <div className="font-semibold mb-2">Recommended for you</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {recommended.map((it) => (
                        <article key={it.id} className="border p-3 hover:bg-black/5 flex flex-col h-full">
                          <div className="mb-2 flex items-center justify-between">
                            <LikeButton itemId={it.id} />
                            <BookmarkButton itemId={it.id} />
                          </div>
                          {it.thumbnail ? <img src={it.thumbnail} alt="" className="w-full h-36 object-cover mb-3" /> : null}
                          <a href={it.link} target="_blank" rel="noreferrer" className="block font-semibold leading-snug hover:underline">{it.title}</a>
                          <div className="text-[11px] text-gray-500 mt-1">{it.source} • {it.published_at?.slice(0,10)}</div>
                        </article>
                      ))}
                    </div>
              </section>
            ) : null}
          </section>
          <aside className="col-span-12 lg:col-span-3">
            {liked.length > 0 ? (
              <div>
                <div className="badge-dark mb-3 inline-block">Liked by you</div>
                <div className="space-y-5">
                  {liked.map((b) => {
                    const it = (b.items || {}) as Item
                    return (
                      <article key={`lklist-${b.item_id}`} className="grid grid-cols-5 gap-3 items-start">
                        {it.thumbnail ? (
                          <img src={it.thumbnail} alt="" className="col-span-2 w-full h-16 object-cover" />
                        ) : null}
                        <div className={it.thumbnail ? 'col-span-3' : 'col-span-5'}>
                          <a href={it.link} target="_blank" rel="noreferrer" className="block text-sm font-semibold leading-snug hover:underline">
                            {it.title}
                          </a>
                          <div className="text-[11px] text-gray-500 mt-1">{it.published_at?.slice(0,10)}</div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </main>
    </>
  )
}


