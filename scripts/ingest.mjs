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
  // Map Facebook page URLs to RSSHub feeds
  const mapped = mapFacebookUrlToRss(feedUrl) || feedUrl
  const candidates = buildRsshubCandidates(mapped)
  // Try to fetch URL and auto-discover feed if needed
  let resp = await fetch(candidates[0], {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })
  let chosen = candidates[0]
  if (!resp.ok) {
    for (const c of candidates.slice(1)) {
      const r = await fetch(c, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      })
      if (r.ok) { resp = r; chosen = c; break }
    }
  }
  if (!resp.ok) throw new Error(`HTTP ${resp.status} at ${candidates[candidates.length - 1]}`)
  let body = await resp.text()
  const contentType = (resp.headers.get('content-type') || '').toLowerCase()
  const looksLikeXml = contentType.includes('xml') || /^<\?xml|<rss|<feed/i.test(body)
  let targetUrl = chosen
  if (!looksLikeXml) {
    const discovered = discoverFeedUrlFromHtml(body, feedUrl)
    if (discovered) {
      targetUrl = discovered
    }
  }
  const feed = targetUrl === feedUrl ? await parser.parseString(sanitizeXml(body)) : await parser.parseURL(targetUrl)
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

function discoverFeedUrlFromHtml(html, baseUrl) {
  try {
    const linkRegex = /<link[^>]+rel=["']alternate["'][^>]*>/gi
    const typeRegex = /type=["'](application\/(rss\+xml|atom\+xml|xml))["']/i
    const hrefRegex = /href=["']([^"']+)["']/i
    const matches = html.match(linkRegex) || []
    for (const tag of matches) {
      if (!typeRegex.test(tag)) continue
      const hrefMatch = tag.match(hrefRegex)
      if (!hrefMatch) continue
      const candidate = hrefMatch[1]
      const abs = toAbsoluteUrl(candidate, baseUrl)
      if (abs) return abs
    }
  } catch {}
  return null
}

function sanitizeXml(xml) {
  return xml.replace(/&(?!#\d+;|#x[0-9a-fA-F]+;|[a-zA-Z]+;)/g, '&amp;')
}

function mapFacebookUrlToRss(inputUrl) {
  if (!inputUrl) return null
  try {
    const url = new URL(inputUrl)
    const host = url.hostname.replace(/^www\./, '')
    if (!/^(m\.)?facebook\.com$|^facebook\.com$/.test(host) && !host.endsWith('facebook.com')) {
      return null
    }
    const base = process.env.RSSHUB_BASE || 'https://rsshub.app'
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return null
    if (segments[0].toLowerCase() === 'pages' && segments.length >= 2) {
      const candidateId = segments[2] || segments[1]
      return candidateId ? `${base}/facebook/page/${candidateId}` : null
    }
    const pageName = segments[0]
    if (!pageName || pageName.toLowerCase() === 'profile.php') return null
    return `${base}/facebook/page/${pageName}`
  } catch {
    return null
  }
}

function getRsshubBases() {
  const multi = (process.env.RSSHUB_BASES || '').split(',').map(s => s.trim()).filter(Boolean)
  const single = process.env.RSSHUB_BASE ? [process.env.RSSHUB_BASE.trim()] : []
  const defaults = ['https://rsshub.app']
  const all = [...multi, ...single, ...defaults]
  const seen = new Set()
  const cleaned = []
  for (const b of all) {
    const base = b.replace(/\/$/, '')
    if (!seen.has(base)) { seen.add(base); cleaned.push(base) }
  }
  return cleaned
}

function buildRsshubCandidates(urlStr) {
  try {
    const url = new URL(urlStr)
    if (!/rsshub/i.test(url.hostname)) return [urlStr]
    const bases = getRsshubBases()
    const pathAndQuery = url.pathname + (url.search || '')
    return bases.map(b => `${b}${pathAndQuery}`)
  } catch {
    return [urlStr]
  }
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


