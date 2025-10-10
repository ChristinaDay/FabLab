import React from 'react'
import Nav from '@/components/Nav'
import { fetchVisibleItems } from '@/lib/db'

export default function Home({ items }: { items: any[] }) {
  const [featuredItem, ...restItems] = items

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-3 text-gray-900">ShopTalk</h1>
          <p className="text-xl text-gray-600">News and jobs for makers and fabricators</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            No items published yet. Go to{' '}
            <a href="/admin" className="underline text-blue-600 hover:text-blue-800">/admin</a> to ingest a feed and publish.
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredItem && (
              <article className="mb-12 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="grid md:grid-cols-2 gap-0">
                  {featuredItem.thumbnail && (
                    <div className="relative h-64 md:h-auto">
                      <img
                        src={featuredItem.thumbnail}
                        alt={featuredItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-8 flex flex-col justify-center">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                      Featured Story
                    </div>
                    <a
                      href={featuredItem.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-3xl font-bold mb-3 text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {featuredItem.title}
                    </a>
                    <div className="text-sm text-gray-500 mb-4">
                      {featuredItem.source} • {new Date(featuredItem.published_at).toLocaleDateString()}
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {featuredItem.excerpt?.slice(0, 300)}...
                    </p>
                  </div>
                </div>
              </article>
            )}

            {/* Latest Stories Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Latest Stories</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restItems.map((item: any) => (
                  <article
                    key={item.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
                  >
                    {item.thumbnail && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2 block"
                      >
                        {item.title}
                      </a>
                      <div className="text-xs text-gray-500 mb-3">
                        {item.source} • {new Date(item.published_at).toLocaleDateString()}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {item.excerpt?.slice(0, 150)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  )
}

export async function getServerSideProps() {
  const items = await fetchVisibleItems(50)
  return { props: { items } }
}


