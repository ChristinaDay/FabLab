import React from 'react'
import Nav from '@/components/Nav'
import { fetchFeatured, fetchPicks, fetchVisibleItemsFiltered, fetchVisibleJobs } from '@/lib/db'

export default function TopStoriesPage({ items, jobs, recent }: { items: any[]; jobs: any[]; recent: any[] }) {
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
          <div className="grid grid-cols-12 gap-6">
            <section className="col-span-12 lg:col-span-9">
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
                  <a href={it.link} target="_blank" rel="noreferrer" className="text-sm underline mt-2 inline-block">Read more →</a>
                </article>
              ))}
            </section>
            <aside className="col-span-12 lg:col-span-3">
              <div className="badge-dark mb-3 inline-block">Most Recent</div>
              <div className="space-y-5">
                {recent.slice(0,8).map((item: any) => (
                  <article key={item.id} className="grid grid-cols-5 gap-3 items-start">
                    {item.thumbnail && (
                      <img src={item.thumbnail} alt={item.title} className="col-span-2 w-full h-16 object-cover" />
                    )}
                    <div className={item.thumbnail ? 'col-span-3' : 'col-span-5'}>
                      <a href={item.link} target="_blank" rel="noreferrer" className="block text-sm font-semibold leading-snug hover:underline">
                        {item.title}
                      </a>
                      <div className="text-[11px] text-gray-500 mt-1">{new Date(item.published_at).toLocaleDateString()}</div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-10">
                <div className="badge-dark mb-3 inline-block">Latest Jobs</div>
                <div className="space-y-4">
                  {jobs.slice(0,6).map((j: any) => (
                    <article key={j.id} className="border-b pb-4 last:border-b-0">
                      <a href={j.link} target="_blank" rel="noreferrer" className="block text-sm font-semibold leading-snug hover:underline">
                        {j.title}
                      </a>
                      <div className="text-[11px] text-gray-500 mt-1">{[j.company, j.location].filter(Boolean).join(' • ')}</div>
                    </article>
                  ))}
                  <a href="/jobs" className="text-sm underline inline-block mt-2">View all jobs</a>
                </div>
              </div>
            </aside>
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
  const recentFill = await fetchVisibleItemsFiltered({ limit: 50 }).catch(() => [])
  for (const it of recentFill as any[]) {
    const id = (it as any).id
    if (!used.has(id)) {
      used.add(id)
      merged.push(it)
    }
    if (merged.length >= 30) break
  }
  const items = merged
  const jobs = await fetchVisibleJobs(12).catch(() => [])
  const recent = await fetchVisibleItemsFiltered({ limit: 20 }).catch(() => [])
  return { props: { items, jobs, recent } }
}


