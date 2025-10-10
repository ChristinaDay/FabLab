import React from 'react'
import Nav from '@/components/Nav'
import { fetchVisibleItemsFiltered } from '@/lib/db'

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
          <div className="grid grid-cols-12 gap-6">
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
        )}
      </main>
    </>
  )
}

export async function getServerSideProps(context: { query: { [key: string]: any } }) {
  const category = context.query.category ? String(context.query.category) : undefined
  const items = await fetchVisibleItemsFiltered({ limit: 50, category })
  return { props: { items } }
}


