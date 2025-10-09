import React from 'react'
import Nav from '@/components/Nav'
import { fetchVisibleItems } from '@/lib/db'

export default function Home({ items }: { items: any[] }) {
  return (
    <>
      <Nav />
      <main className="max-w-4xl mx-auto px-6 pt-4 md:pt-6">
      <h1 className="text-3xl font-bold mb-6">FabMurmur</h1>
      <p className="text-gray-700 mb-8">
        A curated digest featuring cross‑disciplinary topics and articles from the professional worlds
        of fabrication, industrial design, civil engineering, art, architecture, and entertainment.
      </p>
      {items.length === 0 ? (
        <div className="text-gray-600">
          No items published yet. Go to{' '}
          <a href="/admin" className="underline">/admin</a> to ingest a feed and publish.
        </div>
      ) : (
        <div className="grid gap-6">
          {items.map((it: any) => (
            <article key={it.id} className="border rounded-lg p-4 flex gap-4">
              {it.thumbnail ? <img src={it.thumbnail} alt="" className="w-32 h-24 object-cover rounded" /> : null}
              <div>
                <a href={it.link} target="_blank" rel="noreferrer" className="text-lg font-semibold link">{it.title}</a>
                <div className="text-sm text-gray-600">{it.source} • {new Date(it.published_at).toLocaleDateString()}</div>
                <p className="mt-2 text-sm text-gray-700">{it.excerpt?.slice(0,200)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
      </main>
    </>
  )
}

export async function getServerSideProps() {
  const items = await fetchVisibleItems(50)
  return { props: { items } }
}


