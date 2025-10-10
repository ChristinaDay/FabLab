import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const client = getServiceRoleClient()
    const { title, link, excerpt, source, thumbnail, tags, visible } = req.body as any
    if (!title || !link) return res.status(400).json({ error: 'Missing title or link' })
    const { data, error } = await client
      .from('items')
      .upsert({
        title,
        link,
        excerpt: excerpt || null,
        source: source || null,
        thumbnail: thumbnail || null,
        tags: Array.isArray(tags) ? tags : (tags ? [String(tags)] : null),
        visible: !!visible,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'link' })
      .select()
    if (error) throw error
    return res.status(200).json({ ok: true, item: (data || [])[0] })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to upsert item', detail })
  }
}


