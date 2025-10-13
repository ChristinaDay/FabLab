import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient, upsertItemServer } from '@/lib/db'
import { extractOpenGraph, parseEmbedMeta } from '@/lib/extractOg'

function extractUrlFromEmbed(input: string): string | null {
  const permalinkMatch = input.match(/data-instgrm-permalink="([^"]+)"/)
  if (permalinkMatch) return permalinkMatch[1].split('?')[0]

  const hrefMatch = input.match(/href="(https:\/\/(?:www\.)?(?:instagram|facebook)\.com\/[^"]+)"/)
  if (hrefMatch) return hrefMatch[1].split('?')[0]

  return null
}

function isEmbedCode(input: string): boolean {
  return input.trim().startsWith('<') && (input.includes('instagram-media') || input.includes('fb-post'))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { url: rawInput, tags, visible, override, caption } = req.body as { url?: string; tags?: string[]; visible?: boolean; override?: { title?: string; image?: string }; caption?: string }
    if (!rawInput) return res.status(400).json({ error: 'Missing url or embed code' })

    let url = rawInput
    let embedHtml: string | null = null

    // Check if input is embed code
    if (isEmbedCode(rawInput)) {
      embedHtml = rawInput
      const extractedUrl = extractUrlFromEmbed(rawInput)
      if (!extractedUrl) return res.status(400).json({ error: 'Could not extract URL from embed code' })
      url = extractedUrl
    }

    if (!/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'Invalid url' })

    const og = await extractOpenGraph(url)
    const client = getServiceRoleClient()

    const hostname = new URL(url).hostname.replace(/^www\./, '')
    const platformTag = hostname.includes('instagram.com') ? 'instagram' : hostname.includes('facebook.com') ? 'facebook' : undefined

    const userTags = Array.isArray(tags) ? tags : []
    const allTags = Array.from(new Set([...userTags, 'social', ...(platformTag ? [platformTag] : [])]))

    // Try to extract a better title directly from the embed HTML when available
    // Fallback local parser in case module export tree-shakes in certain runtimes
    function parseEmbedMetaLocal(html: string): { title: string | null; siteName: string | null } {
      const siteName = html.includes('instagram-media') ? 'Instagram' : html.includes('fb-post') ? 'Facebook' : null
      const firstP = html.match(/<blockquote[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1] || null
      const textFromP = firstP ? firstP.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : null
      const blockInner = html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i)?.[1] || ''
      const textFromBlock = blockInner
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      let title = textFromP || textFromBlock || null
      if (title && title.length > 200) title = title.slice(0, 200) + '…'
      if (siteName === 'Instagram' && title && /^view (this|on) instagram/i.test(title)) title = null
      return { title, siteName }
    }

    const embedMeta = embedHtml ? (typeof parseEmbedMeta === 'function' ? parseEmbedMeta(embedHtml) : parseEmbedMetaLocal(embedHtml)) : { title: null, siteName: null }

    const title = override?.title || embedMeta.title || og?.title || 'Untitled'
    const source = embedMeta.siteName || og?.siteName || hostname
    const image = override?.image || og?.image || null
    const excerpt = og?.description || ''
    const canonical = og?.canonicalUrl || url
    const publishedAt = og?.publishedTime || new Date().toISOString()

    const data = await upsertItemServer(client, {
      title,
      link: canonical,
      excerpt,
      source,
      thumbnail: image,
      published_at: publishedAt,
      tags: allTags,
      embed_html: embedHtml,
      caption: caption || null,
    })

    // toggle visibility if specified, otherwise default to true
    const id = (data && data[0] && (data[0] as any).id) as string | undefined
    if (id) {
      const { error } = await client.from('items').update({ visible: visible !== false }).eq('id', id)
      if (error) throw error
    }

    return res.status(200).json({ ok: true, item: (data || [])[0] || null })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to upsert from URL', detail })
  }
}


