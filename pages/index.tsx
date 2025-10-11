import React from 'react'
import Nav from '@/components/Nav'
import { fetchVisibleItemsFiltered, fetchFeatured, fetchPicks, fetchRecentExcluding, fetchByTagExcluding, fetchVisibleJobs } from '@/lib/db'

export default function Home({ items, jobs }: { items: any[]; jobs: any[] }) {
  const mainStories = items.slice(0, 3)
  const [mainHero, ...mainOther] = mainStories
  const restItems = items.slice(3)
  const picks = restItems.slice(0, 3)
  const recent = restItems.slice(3, 10)
  const centerSecondaries = mainOther // highlight additional main stories under the hero
  const centerGrid = restItems.slice(0, 8)

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {items.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            No items published yet. Go to{' '}
            <a href="/admin" className="underline text-black hover:text-gray-900">/admin</a> to ingest a feed and publish.
          </div>
        ) : (
          <>
          <div className="grid grid-cols-12 gap-6 section">
            {/* Left: Today's Picks */}
            <aside className="col-span-12 md:col-span-4 lg:col-span-3">
              <div className="badge-dark mb-3 inline-block">Today's Picks</div>
              <div className="space-y-6">
                {picks.map((item: any) => (
                  <article key={item.id} className="border-b pb-6 last:border-b-0">
                    {item.thumbnail && (
                      <img src={item.thumbnail} alt={item.title} className="w-full h-40 object-cover mb-3" />
                    )}
                    <a href={item.link} target="_blank" rel="noreferrer" className="block font-semibold hover:underline">
                      {item.title}
                    </a>
                    <div className="text-xs text-gray-500 mt-2">{item.source} • {new Date(item.published_at).toLocaleDateString()}</div>
                  </article>
                ))}
              </div>

              {/* Latest Jobs */}
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

            {/* Center: Three stacked feature stories (The Fabricator style) */}
            <section className="col-span-12 md:col-span-8 lg:col-span-6">
              {mainStories.map((it: any, idx: number) => (
                <article key={it.id} className={`pb-8 ${idx < mainStories.length - 1 ? 'border-b mb-8' : ''}`}>
                  <div className="text-xs uppercase tracking-wide text-black/70 mb-2">
                    {it.source ? `From ${it.source}` : 'From around the web'}
                  </div>
                  <a href={it.link} target="_blank" rel="noreferrer" className="block headline-condensed leading-tight text-[2.2rem] sm:text-[3rem] md:text-[3.5rem]">
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

            {/* Right: Most Recent */}
            <aside className="col-span-12 lg:col-span-3">
              <div className="badge-dark mb-3 inline-block">Most Recent</div>
              <div className="space-y-5">
                {recent.map((item: any) => (
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
              {/* Promo modules */}
              <div className="mt-6 grid gap-4">
                <div className="border p-4">
                  <div className="text-xs tracking-wide uppercase text-black/70 mb-1">Sponsored</div>
                  <div className="font-semibold">Promote your product</div>
                  <p className="text-sm mt-1">Reach makers and fabricators. Contact us to sponsor.</p>
                </div>
                <div className="border p-4">
                  <div className="text-xs tracking-wide uppercase text-black/70 mb-1">Podcast</div>
                  <div className="font-semibold">ShopTalk Ep. 093</div>
                  <a href="#" className="text-sm underline mt-1 inline-block">Listen now</a>
                </div>
              </div>
            </aside>
          </div>

          {/* Link to all top stories */}
          <div className="mt-2 mb-4 text-center">
            <a href="/topstories" className="text-sm underline">All top stories</a>
          </div>

          {/* Center two‑column grid of story cards */}
          <section className="py-8">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
                <div className="border-t border-black/20 dark:border-white/20 mb-4 flex items-center justify-between">
                  <a href="/topstories" className="text-sm underline ml-auto">All top stories</a>
                </div>
                <div className="badge-dark mb-3 inline-block">More Stories</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {centerGrid.map((it: any) => (
                    <article key={it.id} className="border p-3 hover:bg-black/5">
                      {it.thumbnail ? (
                        <img src={it.thumbnail} alt={it.title} className="w-full h-36 object-cover mb-3" />
                      ) : null}
                      <a href={it.link} target="_blank" rel="noreferrer" className="block font-semibold leading-snug hover:underline">
                        {it.title}
                      </a>
                      <div className="text-[11px] text-gray-500 mt-1">{it.source} • {new Date(it.published_at).toLocaleDateString()}</div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="separator my-6" />

          {/* Secondary sections */}
          <section className="section">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 space-y-6">
                {restItems.slice(21, 33).map((item: any) => (
                  <article key={item.id} className="grid grid-cols-12 gap-4 pb-6 border-b last:border-b-0">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="col-span-4 md:col-span-3 w-full h-28 object-cover" />
                    ) : null}
                    <div className={item.thumbnail ? 'col-span-8 md:col-span-9' : 'col-span-12'}>
                      <a href={item.link} target="_blank" rel="noreferrer" className="block font-semibold hover:underline">
                        {item.title}
                      </a>
                      {item.excerpt ? (
                        <p className="text-sm mt-1">{item.excerpt.slice(0, 180)}...</p>
                      ) : null}
                      <div className="text-[11px] text-gray-500 mt-1">{item.source} • {new Date(item.published_at).toLocaleDateString()}</div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="separator my-6" />

          {/* Knowledge bites */}
          <section className="section">
            <div className="badge-dark mb-4 inline-block">Quick Reads</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {restItems.slice(33, 41).map((item: any) => (
                <a key={item.id} href={item.link} target="_blank" rel="noreferrer" className="block border p-3 hover:bg-black/5">
                  <div className="text-sm font-semibold leading-snug">{item.title}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{item.source}</div>
                </a>
              ))}
            </div>
          </section>
          </>
        )}
      </main>
    </>
  )
}

export async function getServerSideProps(context: { query: { [key: string]: any } }) {
  const category = context.query.category ? String(context.query.category) : undefined
  // Pull curated featured and picks; fall back to filtered feed if needed
  const [curatedFeatured, curatedPicks] = await Promise.all([
    fetchFeatured(5).catch(() => []),
    fetchPicks(6).catch(() => []),
  ])

  const usedIds = new Set<string>([...curatedFeatured, ...curatedPicks].map((i: any) => i.id))
  const recent = await fetchRecentExcluding({ limit: 30, excludeIds: Array.from(usedIds) }).catch(() => [])

  let categoryItems: any[] = []
  if (category) {
    const exclude = new Set<string>([...usedIds, ...recent.map((r: any) => r.id)])
    categoryItems = await fetchByTagExcluding({ tag: category, limit: 24, excludeIds: Array.from(exclude) }).catch(() => [])
  }

  // Compose items list for current UI while keeping previous structure working
  const composed = [
    ...(curatedFeatured.length ? curatedFeatured : []),
    ...curatedPicks,
    ...recent,
    ...categoryItems,
  ]

  const fallback = await fetchVisibleItemsFiltered({ limit: 50, category }).catch(() => [])
  const items = composed.length ? composed : fallback
  const jobs = await fetchVisibleJobs(12).catch(() => [])
  return { props: { items, jobs } }
}


