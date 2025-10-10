import type { NextApiRequest, NextApiResponse } from 'next'
import Parser from 'rss-parser'
import { getServiceRoleClient, upsertItemServer } from '@/lib/db'
import { extractOpenGraphImage } from '@/lib/extractOg'

type Body = { feedUrl?: string; category?: string; tags?: string[] }

const parser = new Parser({})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const body = req.body as Body
  const feedUrl = body.feedUrl
  if (!feedUrl) return res.status(400).json({ error: 'Missing feedUrl in body' })
  const incomingTags = Array.isArray(body.tags)
    ? body.tags
    : (body.category ? [body.category] : undefined)

  try {
    // Some sites block default fetchers; fetch with a browser-like UA
    let targetUrl = feedUrl
    let resp = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://news.google.com/'
      },
    })
    if (!resp.ok) {
      return res.status(500).json({ error: 'Failed to ingest feed', detail: `HTTP ${resp.status}` })
    }
    let bodyText = await resp.text()

    // Auto-discovery: If not XML-like, parse HTML <link rel="alternate" type="application/rss+xml|application/atom+xml">
    const contentType = (resp.headers.get('content-type') || '').toLowerCase()
    const looksLikeXml = contentType.includes('xml') || /^<\?xml|<rss|<feed/i.test(bodyText)
    if (!looksLikeXml) {
      const discovered = discoverFeedUrlFromHtml(bodyText, feedUrl)
      if (discovered) {
        targetUrl = discovered
        resp = await fetch(discovered, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': feedUrl,
          },
        })
        if (!resp.ok) {
          return res.status(500).json({ error: 'Failed to fetch discovered feed', detail: `HTTP ${resp.status}` })
        }
        bodyText = await resp.text()
      }
    }

    // Sanitize common malformed XML issues (e.g., stray '&' in URLs/text)
    const sanitized = sanitizeXml(bodyText)
    let feed
    try {
      feed = await parser.parseString(sanitized)
    } catch (e) {
      // As a fallback, try parsing the original body in case sanitization altered valid content
      feed = await parser.parseString(bodyText)
    }
    const items = feed.items ?? []
    let count = 0
    const client = getServiceRoleClient()
    for (const item of items.slice(0, 20)) {
      const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
      // Prefer images provided in RSS first
      let thumbnail = await extractImageFromRssItem(item, feedUrl)
      // Resolve Google News redirect links to original article when present
      const resolvedLink = await resolvePossiblyRedirectedLink(item.link || '')
      // Fallback: try to extract Open Graph image from the article page
      if (!thumbnail && resolvedLink) {
        try {
          const og = await extractOpenGraphImage(resolvedLink)
          if (og) thumbnail = og
        } catch {
          // ignore page fetch errors
        }
      }
      await upsertItemServer(client, {
        title: item.title || 'Untitled',
        link: resolvedLink || item.link || '',
        excerpt: sanitizeExcerpt((item as any).contentSnippet || (item as any).content || ''),
        source: normalizeSourceName(feed.title || feedUrl),
        thumbnail,
        published_at: publishedAt,
        tags: incomingTags,
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

function toAbsoluteUrl(candidate?: string | null, base?: string): string | null {
  try {
    if (!candidate) return null
    if (candidate.startsWith('//')) return `https:${candidate}`
    const abs = new URL(candidate, base || 'https://')
    return abs.href
  } catch {
    return candidate || null
  }
}

async function extractImageFromRssItem(item: any, baseUrl: string): Promise<string | null> {
  // enclosure (type image/* preferred)
  const enc = item.enclosure as any
  if (enc && (enc.type ? /^image\//i.test(enc.type) : true) && enc.url) {
    const abs = toAbsoluteUrl(enc.url, baseUrl)
    if (abs) return abs
  }

  // media:content (choose largest if multiple)
  const mediaContent: any = (item as any)['media:content']
  if (mediaContent) {
    const arr = Array.isArray(mediaContent) ? mediaContent : [mediaContent]
    const withSizes = arr.map((m) => ({
      url: m?.url,
      width: Number(m?.width || 0),
      height: Number(m?.height || 0),
    }))
    withSizes.sort((a, b) => (b.width * b.height) - (a.width * a.height))
    for (const m of withSizes) {
      const abs = toAbsoluteUrl(m.url, baseUrl)
      if (abs) return abs
    }
  }

  // media:thumbnail
  const mediaThumb: any = (item as any)['media:thumbnail']
  if (mediaThumb) {
    const thumb = Array.isArray(mediaThumb) ? mediaThumb[0] : mediaThumb
    const abs = toAbsoluteUrl(thumb?.url, baseUrl)
    if (abs) return abs
  }

  // itunes:image (href)
  const itunesImg: any = (item as any)['itunes:image']
  if (itunesImg && itunesImg.href) {
    const abs = toAbsoluteUrl(itunesImg.href, baseUrl)
    if (abs) return abs
  }

  // content or content:encoded first <img>
  const contentHtml: string = (item as any)["content:encoded"] || (item as any).content || (item as any).description || ''
  if (contentHtml) {
    const m = contentHtml.match(/<img[^>]+src=["']([^"']+)["']/i)
    if (m && m[1]) {
      const abs = toAbsoluteUrl(m[1], baseUrl)
      if (abs) return abs
    }
  }

  // image field
  if ((item as any).image && (item as any).image.url) {
    const abs = toAbsoluteUrl((item as any).image.url, baseUrl)
    if (abs) return abs
  }

  return null
}

// Google News and other aggregators often wrap the final URL. Try to resolve redirects.
async function resolvePossiblyRedirectedLink(link?: string): Promise<string | null> {
  if (!link) return null
  try {
    // If it's already a Fabricator link, return as-is
    const url = new URL(link)
    if (url.hostname.includes('thefabricator.com')) return url.href
    // For Google News URLs, sometimes the article URL is in "url" param
    const paramUrl = url.searchParams.get('url') || url.searchParams.get('u')
    if (paramUrl) return paramUrl
    // As a last resort, do a HEAD request to follow redirects
    const resp = await fetch(link, { method: 'HEAD', redirect: 'follow' as RequestRedirect })
    const finalUrl = resp.url || link
    return finalUrl
  } catch {
    return link || null
  }
}

function sanitizeExcerpt(text: string): string {
  if (!text) return ''
  // Remove excessive whitespace and html tags remnants
  const withoutTags = text.replace(/<[^>]+>/g, ' ')
  return withoutTags.replace(/\s+/g, ' ').trim()
}

function normalizeSourceName(name?: string): string {
  if (!name) return ''
  // Normalize Google News sourced feeds to the underlying publication
  if (/google news/i.test(name)) return 'Google News'
  // Basic cleanup for The Fabricator
  return name.replace(/\s+\|\s*Google News.*/i, '').trim()
}

function discoverFeedUrlFromHtml(html: string, baseUrl: string): string | null {
  try {
    // Look for <link rel="alternate" type="application/rss+xml|application/atom+xml" href="...">
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
  } catch {
    // ignore
  }
  return null
}

function sanitizeXml(xml: string): string {
  // Replace ampersands not part of entities with &amp;
  // This avoids "Invalid character in entity name" when feeds include raw '&' in text/URLs
  return xml.replace(/&(?!#\d+;|#x[0-9a-fA-F]+;|[a-zA-Z]+;)/g, '&amp;')
}


