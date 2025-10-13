import React from 'react'
import Nav from '@/components/Nav'
import dynamic from 'next/dynamic'
import EmbedOrImage from '@/components/EmbedOrImage'
import { fetchVisibleItemsFiltered } from '@/lib/db'

const BookmarkButton = dynamic(() => import('@/components/BookmarkButton'), { ssr: false })
const LikeButton = dynamic(() => import('@/components/LikeButton'), { ssr: false })

export default function SocialPage({ items }: { items: any[] }) {
  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">From Social</h1>
        {items.length === 0 ? (
          <div className="text-gray-600">No social posts yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it: any) => (
              <article key={it.id} className="border p-3 flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <LikeButton itemId={it.id} />
                  <BookmarkButton itemId={it.id} />
                </div>
                <EmbedOrImage
                  embedHtml={it.embed_html}
                  thumbnail={it.thumbnail}
                  title={it.title}
                  className={it.embed_html ? '' : 'w-full h-48 object-cover'}
                  lazy
                  maxHeight={420}
                  collapsible
                />
                <div className="text-[11px] text-gray-500 mt-2">{it.source} • {new Date(it.published_at).toLocaleDateString()}</div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export async function getServerSideProps() {
  const items = await fetchVisibleItemsFiltered({ limit: 100, category: 'social' }).catch(() => [])
  return { props: { items } }
}


