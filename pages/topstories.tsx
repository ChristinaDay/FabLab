import React from 'react'
import Nav from '@/components/Nav'
import { fetchFeatured, fetchPicks, fetchVisibleItemsFiltered } from '@/lib/db'

export default function TopStoriesPage({ items }: { items: any[] }) {
  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="headline-condensed text-3xl">Top Stories</h1>
          <a href="/" className="text-sm underline">Back to home</a>
        </div>
        {items.length === 0 ? (
          <div className="text-gray-600">No featured stories yet.</div>
        ) : (
          <div>
            {items.map((it: any, idx: number) => (
              <article key={it.id} className={`pb-8 ${idx < items.length - 1 ? 'border-b mb-8' : ''}`}>
                <div className="text-xs uppercase tracking-wide text-black/70 mb-2">
                  {it.source ? `From ${it.source}` : 'From around the web'}
                </div>
                <a href={it.link} target="_blank" rel="noreferrer" className="block headline-condensed leading-tight text-[2rem] sm:text-[2.6rem] md:text-[3rem]">
                  {it.title}
                </a>
                <div className="text-xs text-gray-500 mt-2">{it.source ? `${it.source} • ` : ''}{new Date(it.published_at).toLocaleDateString()}</div>
                {it.thumbnail ? (
                  <img src={it.thumbnail} alt={it.title} className="w-full h-[420px] object-cover mt-4" />
                ) : null}
                {it.excerpt ? (
                  <p className="text-gray-500 mt-4">{it.excerpt.slice(0, 240)}...</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export async function getServerSideProps() {
  // Include all curated top stories: featured + picks, de-duplicated
  const [featured, picks] = await Promise.all([
    fetchFeatured(50).catch(() => []),
    fetchPicks(50).catch(() => []),
  ])
  const used = new Set<string>()
  const merged: any[] = []
  for (const it of [...featured, ...picks]) {
    const id = (it as any).id
    if (!used.has(id)) {
      used.add(id)
      merged.push(it)
    }
  }
  // Fill with recent visible items to ensure the page has depth, mirroring home fallback
  const recent = await fetchVisibleItemsFiltered({ limit: 50 }).catch(() => [])
  for (const it of recent as any[]) {
    const id = (it as any).id
    if (!used.has(id)) {
      used.add(id)
      merged.push(it)
    }
    if (merged.length >= 30) break
  }
  const items = merged
  return { props: { items } }
}


