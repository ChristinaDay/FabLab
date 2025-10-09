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


