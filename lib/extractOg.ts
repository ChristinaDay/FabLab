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

// Lightweight parser to pull a reasonable title and site from raw embed HTML
export function parseEmbedMeta(embedHtml: string): { title: string | null; siteName: string | null } {
  const siteName = embedHtml.includes('instagram-media') ? 'Instagram' : embedHtml.includes('fb-post') ? 'Facebook' : null

  // Prefer the first <p> inside a blockquote as the human-readable caption/text
  const firstP = embedHtml.match(/<blockquote[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1] || null
  const textFromP = firstP ? firstP.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : null

  // Fallback to all text inside blockquote
  const blockInner = embedHtml.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i)?.[1] || ''
  const textFromBlock = blockInner.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  let title = textFromP || textFromBlock || null
  if (title && title.length > 200) title = title.slice(0, 200) + '…'
  // Normalize common IG boilerplate
  if (siteName === 'Instagram' && title && /^view (this|on) instagram/i.test(title)) {
    title = null
  }
  return { title, siteName }
}

export async function extractOpenGraph(targetUrl: string): Promise<OpenGraphMeta | null> {
  if (!targetUrl) return null
  try {
    const urlObj = new URL(targetUrl)
    const hostname = urlObj.hostname.replace(/^www\./, '')

    // 1) Try Graph API first (most reliable for FB/IG)
    if (hostname.includes('instagram.com') || hostname.includes('facebook.com')) {
      const graphResult = await fetchGraphOEmbed(targetUrl)
      if (graphResult) return graphResult
    }

    // 2) Platform-specific fallbacks (public endpoints, less reliable)
    if (hostname.includes('instagram.com')) {
      const ig = await tryInstagramOEmbed(targetUrl)
      if (ig) return ig
    }
    if (hostname.includes('facebook.com')) {
      const fb = await tryFacebookOEmbed(targetUrl)
      if (fb) return fb
    }

    const origin = new URL(targetUrl).origin
    let html = ''
    let resp: Response | null = null
    try {
      resp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': origin,
      },
    })
      if (resp.ok) {
        html = await resp.text()
      }
    } catch {
      // ignore fetch error; we'll try fallbacks below
    }

    function getMetaBy(attr: 'property'|'name', name: string): string | null {
      const re = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*>`, 'i')
      const tag = html.match(re)?.[0]
      if (!tag) return null
      const content = tag.match(/content=["']([^"']+)["']/i)?.[1]
      return content || null
    }

    const ogTitle = html ? (getMetaBy('property', 'og:title') || getMetaBy('name', 'twitter:title')) : null
    const ogDesc = html ? (getMetaBy('property', 'og:description') || getMetaBy('name', 'twitter:description')) : null
    const ogImage = html ? (getMetaBy('property', 'og:image:secure_url') || getMetaBy('property', 'og:image') || getMetaBy('name', 'twitter:image:src') || getMetaBy('name', 'twitter:image')) : null
    const siteName = html ? getMetaBy('property', 'og:site_name') : null
    const canonical = html ? (getMetaBy('property', 'og:url') || html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0]?.match(/href=["']([^"']+)["']/i)?.[1] || null) : null
    const published = html ? getMetaBy('property', 'article:published_time') : null
    const author = html ? (getMetaBy('property', 'article:author') || getMetaBy('name', 'author')) : null

    let title = ogTitle
    if (!title) {
      const m = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      title = m?.[1] || null
    }

    let image = ogImage ? toAbsoluteUrl(ogImage, targetUrl) : null
    if (!image && html) {
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

export async function fetchGraphOEmbed(targetUrl: string): Promise<OpenGraphMeta | null> {
  try {
    const appId = process.env.FB_APP_ID
    const appSecret = process.env.FB_APP_SECRET
    if (!appId || !appSecret) return null
    const accessToken = `${appId}|${appSecret}`
    const host = new URL(targetUrl).hostname.replace(/^www\./, '')
    let endpoint: string | null = null
    if (/instagram\.com$/i.test(host)) {
      endpoint = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(targetUrl)}&access_token=${encodeURIComponent(accessToken)}`
    } else if (/facebook\.com$/i.test(host)) {
      endpoint = `https://graph.facebook.com/v19.0/oembed_post?url=${encodeURIComponent(targetUrl)}&access_token=${encodeURIComponent(accessToken)}`
    } else {
      return null
    }
    const resp = await fetch(endpoint, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    if (!resp.ok) {
      const errorText = await resp.text().catch(() => 'Unknown error')
      console.error(`Graph API error (${resp.status}): ${errorText}`)
      // Graph API requires app review for Instagram oEmbed - fallback to other methods
      return null
    }
    const data = await resp.json() as any
    const image = (data.thumbnail_url as string | undefined) || null
    const title = (data.title as string | undefined) || null
    const author = (data.author_name as string | undefined) || null
    const siteName = /instagram\.com$/i.test(host) ? 'Instagram' : 'Facebook'
    return { title, description: null, image, siteName, canonicalUrl: targetUrl, publishedTime: null, author }
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
    let resp = await fetch(proxied, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    let html = ''
    if (resp.ok) {
      html = await resp.text()
    } else {
      // Try reader proxy of ddinstagram as a fallback
      const readerUrl = `https://r.jina.ai/http://ddinstagram.com${ig.pathname}`
      const r = await fetch(readerUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      if (!r.ok) return null
      html = await r.text()
    }
    const title = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] || null
    let image = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] || null
    if (!image) {
      // Fallback to first <img>
      const m = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
      image = m?.[1] || null
    }
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


