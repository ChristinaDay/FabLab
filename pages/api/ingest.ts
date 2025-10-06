import type { NextApiRequest, NextApiResponse } from 'next'
import Parser from 'rss-parser'
import { getServiceRoleClient, upsertItemServer } from '@/lib/db'

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
    // Some sites block default fetchers; fetch with a browser-like UA then parse the XML
    const resp = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.thefabricator.com/'
      },
    })
    if (!resp.ok) {
      return res.status(500).json({ error: 'Failed to ingest feed', detail: `HTTP ${resp.status}` })
    }
    const xml = await resp.text()
    const feed = await parser.parseString(xml)
    const items = feed.items ?? []
    let count = 0
    const client = getServiceRoleClient()
    for (const item of items.slice(0, 20)) {
      const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
      const thumbnail =
        (item.enclosure && (item.enclosure as any).url) ||
        ((item as any)['media:thumbnail'] && ((item as any)['media:thumbnail'] as any).url) ||
        null
      await upsertItemServer(client, {
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


