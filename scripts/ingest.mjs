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
    const thumbnail = extractImageFromRssItem(it, feedUrl)
    await upsertItem({
      title: it.title || 'Untitled',
      link: it.link || '',
      excerpt: sanitizeExcerpt(it.contentSnippet || it.content || ''),
      source: feed.title || feedUrl,
      thumbnail,
      published_at: publishedAt,
    })
    count++
  }
  return { feed: feed.title, count }
}

function toAbsoluteUrl(candidate, base) {
  try {
    if (!candidate) return null
    if (candidate.startsWith('//')) return `https:${candidate}`
    const abs = new URL(candidate, base || 'https://')
    return abs.href
  } catch {
    return candidate || null
  }
}

function extractImageFromRssItem(item, baseUrl) {
  const enc = item.enclosure
  if (enc && (enc.type ? /^image\//i.test(enc.type) : true) && enc.url) {
    const abs = toAbsoluteUrl(enc.url, baseUrl)
    if (abs) return abs
  }
  const mediaContent = item['media:content']
  if (mediaContent) {
    const arr = Array.isArray(mediaContent) ? mediaContent : [mediaContent]
    const withSizes = arr.map(m => ({ url: m?.url, width: Number(m?.width || 0), height: Number(m?.height || 0) }))
    withSizes.sort((a,b) => (b.width*b.height) - (a.width*a.height))
    for (const m of withSizes) {
      const abs = toAbsoluteUrl(m.url, baseUrl)
      if (abs) return abs
    }
  }
  const mediaThumb = item['media:thumbnail']
  if (mediaThumb) {
    const t = Array.isArray(mediaThumb) ? mediaThumb[0] : mediaThumb
    const abs = toAbsoluteUrl(t?.url, baseUrl)
    if (abs) return abs
  }
  const itunesImg = item['itunes:image']
  if (itunesImg && itunesImg.href) {
    const abs = toAbsoluteUrl(itunesImg.href, baseUrl)
    if (abs) return abs
  }
  const contentHtml = item['content:encoded'] || item.content || item.description || ''
  if (contentHtml) {
    const m = contentHtml.match(/<img[^>]+src=["']([^"']+)["']/i)
    if (m && m[1]) {
      const abs = toAbsoluteUrl(m[1], baseUrl)
      if (abs) return abs
    }
  }
  if (item.image && item.image.url) {
    const abs = toAbsoluteUrl(item.image.url, baseUrl)
    if (abs) return abs
  }
  return null
}

function sanitizeExcerpt(text) {
  if (!text) return ''
  const withoutTags = text.replace(/<[^>]+>/g, ' ')
  return withoutTags.replace(/\s+/g, ' ').trim()
}

async function main() {
  // Load active feeds from DB
  const { data: feedsRows, error: feedsErr } = await client
    .from('feeds')
    .select('url')
    .eq('active', true)
    .order('created_at', { ascending: true })
  if (feedsErr) {
    console.error('Failed to load feeds:', feedsErr.message)
    process.exit(1)
  }
  const feeds = (feedsRows || []).map((r) => r.url).filter(Boolean)
  if (feeds.length === 0) {
    console.error('No active feeds found in table. Add rows to public.feeds.')
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


