export async function extractOpenGraphImage(targetUrl: string): Promise<string | null> {
  if (!targetUrl) return null
  try {
    const origin = new URL(targetUrl).origin
    const resp = await fetch(targetUrl, {
      // Use a browser-like UA to improve chances of getting full HTML
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        // Use site origin as referer; some sites require a referer to serve OG tags
        'Referer': origin,
      },
    })
    if (!resp.ok) return null
    const html = await resp.text()

    const candidates = [
      // Common OG/Twitter image meta tags
      { attr: 'property', name: 'og:image:secure_url' },
      { attr: 'property', name: 'og:image' },
      { attr: 'name', name: 'twitter:image:src' },
      { attr: 'name', name: 'twitter:image' },
    ] as const

    for (const c of candidates) {
      const metaRegex = new RegExp(
        `<meta[^>]+${c.attr}=["']${c.name}["'][^>]*>`,
        'i'
      )
      const tagMatch = html.match(metaRegex)
      if (!tagMatch) continue
      const contentMatch = tagMatch[0].match(/content=["']([^"']+)["']/i)
      if (!contentMatch) continue
      const rawUrl = contentMatch[1]
      const absolute = toAbsoluteUrl(rawUrl, targetUrl)
      if (absolute) return absolute
    }

    // As a last resort, look for a large image element near the top of the page
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
    if (imgMatch) {
      const rawUrl = imgMatch[1]
      const absolute = toAbsoluteUrl(rawUrl, targetUrl)
      if (absolute) return absolute
    }
  } catch {
    // ignore network/parse errors
    return null
  }
  return null
}

export type OpenGraphMeta = {
  title?: string | null
  description?: string | null
  image?: string | null
  siteName?: string | null
  canonicalUrl?: string | null
  publishedTime?: string | null
  author?: string | null
}

export async function extractOpenGraph(targetUrl: string): Promise<OpenGraphMeta | null> {
  if (!targetUrl) return null
  try {
    const urlObj = new URL(targetUrl)
    const hostname = urlObj.hostname.replace(/^www\./, '')

    // 1) Platform-specific fallbacks first (often more reliable than raw HTML)
    if (hostname.includes('instagram.com')) {
      const ig = await tryInstagramOEmbed(targetUrl)
      if (ig) return ig
    }
    if (hostname.includes('facebook.com')) {
      const fb = await tryFacebookOEmbed(targetUrl)
      if (fb) return fb
    }

    const origin = new URL(targetUrl).origin
    const resp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': origin,
      },
    })
    if (!resp.ok) return null
    const html = await resp.text()

    function getMetaBy(attr: 'property'|'name', name: string): string | null {
      const re = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*>`, 'i')
      const tag = html.match(re)?.[0]
      if (!tag) return null
      const content = tag.match(/content=["']([^"']+)["']/i)?.[1]
      return content || null
    }

    const ogTitle = getMetaBy('property', 'og:title') || getMetaBy('name', 'twitter:title')
    const ogDesc = getMetaBy('property', 'og:description') || getMetaBy('name', 'twitter:description')
    const ogImage = getMetaBy('property', 'og:image:secure_url') || getMetaBy('property', 'og:image') || getMetaBy('name', 'twitter:image:src') || getMetaBy('name', 'twitter:image')
    const siteName = getMetaBy('property', 'og:site_name')
    const canonical = getMetaBy('property', 'og:url') || html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0]?.match(/href=["']([^"']+)["']/i)?.[1] || null
    const published = getMetaBy('property', 'article:published_time')
    const author = getMetaBy('property', 'article:author') || getMetaBy('name', 'author')

    let title = ogTitle
    if (!title) {
      const m = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      title = m?.[1] || null
    }

    let image = ogImage ? toAbsoluteUrl(ogImage, targetUrl) : null
    if (!image) {
      const m = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
      image = m ? toAbsoluteUrl(m[1], targetUrl) : null
    }

    let meta: OpenGraphMeta = {
      title,
      description: ogDesc || null,
      image: image || null,
      siteName: siteName || null,
      canonicalUrl: canonical ? toAbsoluteUrl(canonical, targetUrl) : null,
      publishedTime: published || null,
      author: author || null,
    }

    // 2) As a last resort, try reader fallback to extract one good image
    if (!meta.image) {
      // Instagram-specific: try ddinstagram proxy which exposes media OG tags publicly
      if (hostname.includes('instagram.com')) {
        const dd = await tryDdInstagramFallback(targetUrl)
        if (dd?.image) {
          meta.image = dd.image
          meta.title = meta.title || dd.title
          meta.siteName = meta.siteName || dd.siteName
        }
      }
      if (!meta.image) {
        const readerImg = await tryReaderFallbackForImage(targetUrl)
        if (readerImg) meta.image = readerImg
      }
    }
    return meta
  } catch {
    return null
  }
}

async function tryInstagramOEmbed(url: string): Promise<OpenGraphMeta | null> {
  try {
    const api = `https://www.instagram.com/oembed/?omitscript=true&url=${encodeURIComponent(url)}`
    const resp = await fetch(api, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!resp.ok) return null
    const data = await resp.json()
    const image = (data.thumbnail_url as string | undefined) || null
    return {
      title: (data.title as string | undefined) || null,
      description: null,
      image,
      siteName: 'Instagram',
      canonicalUrl: (data.author_url as string | undefined) ? null : null,
      publishedTime: null,
      author: (data.author_name as string | undefined) || null,
    }
  } catch {
    return null
  }
}

async function tryFacebookOEmbed(url: string): Promise<OpenGraphMeta | null> {
  try {
    const api = `https://www.facebook.com/plugins/post/oembed.json/?url=${encodeURIComponent(url)}`
    const resp = await fetch(api, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!resp.ok) return null
    const data = await resp.json()
    // Facebook oEmbed doesn't always include a thumbnail; still useful for title/author
    return {
      title: (data.title as string | undefined) || null,
      description: null,
      image: null,
      siteName: 'Facebook',
      canonicalUrl: null,
      publishedTime: null,
      author: (data.author_name as string | undefined) || null,
    }
  } catch {
    return null
  }
}

async function tryReaderFallbackForImage(url: string): Promise<string | null> {
  try {
    // Jina AI reader fetches the page and returns simplified HTML, often bypassing bot blocks
    const reader = `https://r.jina.ai/http://` + url.replace(/^https?:\/\//, '')
    const resp = await fetch(reader, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!resp.ok) return null
    const html = await resp.text()
    const m = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
    return m ? toAbsoluteUrl(m[1], url) : null
  } catch {
    return null
  }
}

async function tryDdInstagramFallback(url: string): Promise<OpenGraphMeta | null> {
  try {
    // ddinstagram redirects IG URLs to a public OG-friendly page
    const ig = new URL(url)
    const proxied = `https://ddinstagram.com${ig.pathname}`
    const resp = await fetch(proxied, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!resp.ok) return null
    const html = await resp.text()
    const title = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] || null
    const image = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] || null
    return {
      title,
      description: null,
      image: image || null,
      siteName: 'Instagram',
      canonicalUrl: null,
      publishedTime: null,
      author: null,
    }
  } catch {
    return null
  }
}

function toAbsoluteUrl(candidate: string, baseUrl: string): string | null {
  try {
    if (!candidate) return null
    if (candidate.startsWith('//')) return `https:${candidate}`
    const abs = new URL(candidate, baseUrl)
    return abs.href
  } catch {
    return null
  }
}


