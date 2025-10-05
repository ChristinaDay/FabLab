import type { NextApiRequest, NextApiResponse } from 'next'
import Parser from 'rss-parser'
import { upsertItem } from '@/lib/db'

type Body = { feedUrl?: string }

const parser = new Parser({})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const body = req.body as Body
  const feedUrl = body.feedUrl
  if (!feedUrl) return res.status(400).json({ error: 'Missing feedUrl in body' })

  try {
    const feed = await parser.parseURL(feedUrl)
    const items = feed.items ?? []
    let count = 0
    for (const item of items.slice(0, 20)) {
      const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
      const thumbnail =
        (item.enclosure && (item.enclosure as any).url) ||
        ((item as any)['media:thumbnail'] && ((item as any)['media:thumbnail'] as any).url) ||
        null
      await upsertItem({
        title: item.title || 'Untitled',
        link: item.link || '',
        excerpt: (item as any).contentSnippet || (item as any).content || '',
        source: feed.title || feedUrl,
        thumbnail,
        published_at: publishedAt,
      })
      count++
    }
    return res.status(200).json({ ok: true, feed: feed.title, count })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('ingest error', err)
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to ingest feed', detail })
  }
}


