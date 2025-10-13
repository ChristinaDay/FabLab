import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient, upsertItemServer } from '@/lib/db'
import { extractOpenGraph, fetchGraphOEmbed } from '@/lib/extractOg'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { url, tags, visible, override } = req.body as { url?: string; tags?: string[]; visible?: boolean; override?: { title?: string; image?: string } }
    if (!url || !/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'Missing or invalid url' })

    const ogGraph = await fetchGraphOEmbed(url)
    const og = ogGraph || await extractOpenGraph(url)
    const client = getServiceRoleClient()

    const hostname = new URL(url).hostname.replace(/^www\./, '')
    const platformTag = hostname.includes('instagram.com') ? 'instagram' : hostname.includes('facebook.com') ? 'facebook' : undefined

    const allTags = Array.from(new Set([...(tags || []), 'social', ...(platformTag ? [platformTag] : [])]))

    const title = override?.title || og?.title || 'Untitled'
    const source = og?.siteName || hostname
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


