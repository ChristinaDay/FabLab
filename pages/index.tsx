import React from 'react'
import Nav from '@/components/Nav'
import { fetchVisibleItemsFiltered, fetchFeatured, fetchPicks, fetchRecentExcluding, fetchByTagExcluding } from '@/lib/db'

export default function Home({ items }: { items: any[] }) {
  const [featuredItem, ...restItems] = items
  const picks = restItems.slice(0, 3)
  const recent = restItems.slice(3, 10)

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
            </aside>

            {/* Center: Hero */}
            <section className="col-span-12 md:col-span-8 lg:col-span-6">
              {featuredItem && (
                <article>
                  {featuredItem.thumbnail && (
                    <img src={featuredItem.thumbnail} alt={featuredItem.title} className="w-full h-[420px] object-cover" />
                  )}
                  <a href={featuredItem.link} target="_blank" rel="noreferrer" className="block headline-condensed text-[2rem] sm:text-[2.5rem] mt-4">
                    {featuredItem.title}
                  </a>
                  <p className="text-gray-500 mt-2">{featuredItem.excerpt?.slice(0, 200)}...</p>
                  <div className="text-xs text-gray-500 mt-2">{featuredItem.source} • {new Date(featuredItem.published_at).toLocaleDateString()}</div>
                </article>
              )}
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
            </aside>
          </div>

          {/* Divider */}
          <div className="separator my-6" />

          {/* Secondary sections: Blog roll style with mini cards and side notes */}
          <section className="section">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-6">
                {restItems.slice(10, 22).map((item: any) => (
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

              <aside className="col-span-12 md:col-span-4 lg:col-span-3">
                <div className="badge-dark mb-3 inline-block">From the Blog</div>
                <div className="space-y-5">
                  {restItems.slice(22, 30).map((item: any) => (
                    <article key={item.id} className="border-b pb-5 last:border-b-0">
                      <a href={item.link} target="_blank" rel="noreferrer" className="block text-sm font-semibold leading-snug hover:underline">
                        {item.title}
                      </a>
                      <div className="text-[11px] text-gray-500 mt-1">{new Date(item.published_at).toLocaleDateString()}</div>
                    </article>
                  ))}
                </div>
              </aside>
            </div>
          </section>

          {/* Divider */}
          <div className="separator my-6" />

          {/* Knowledge bites */}
          <section className="section">
            <div className="badge-dark mb-4 inline-block">Quick Reads</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {restItems.slice(30, 38).map((item: any) => (
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
  return { props: { items } }
}


