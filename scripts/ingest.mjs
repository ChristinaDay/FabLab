import Parser from 'rss-parser'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const client = createClient(supabaseUrl, serviceKey)
const parser = new Parser()

async function upsertItem(item) {
  const { error } = await client
    .from('items')
    .upsert({ ...item, updated_at: new Date().toISOString() }, { onConflict: 'link' })
  if (error) throw error
}

async function ingest(feedUrl) {
  const feed = await parser.parseURL(feedUrl)
  let count = 0
  for (const it of (feed.items || []).slice(0, 20)) {
    const publishedAt = it.pubDate ? new Date(it.pubDate).toISOString() : new Date().toISOString()
    const thumbnail = (it.enclosure && it.enclosure.url) || (it['media:thumbnail'] && it['media:thumbnail'].url) || null
    await upsertItem({
      title: it.title || 'Untitled',
      link: it.link || '',
      excerpt: it.contentSnippet || it.content || '',
      source: feed.title || feedUrl,
      thumbnail,
      published_at: publishedAt,
    })
    count++
  }
  return { feed: feed.title, count }
}

async function main() {
  const feeds = (process.env.FEEDS || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (feeds.length === 0) {
    console.error('No feeds provided. Set FEEDS env as comma-separated list.')
    process.exit(1)
  }
  let total = 0
  for (const url of feeds) {
    try {
      const { feed, count } = await ingest(url)
      console.log(`OK ${feed}: ${count}`)
      total += count
    } catch (e) {
      console.error(`ERR ${url}:`, e.message || e)
    }
  }
  console.log(`Done. Total imported: ${total}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


