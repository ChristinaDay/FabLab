import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'
import { extractOpenGraphImage } from '@/lib/extractOg'

async function resolveLink(link?: string): Promise<string | null> {
  if (!link) return null
  try {
    const url = new URL(link)
    if (url.hostname.includes('thefabricator.com')) return url.href
    const paramUrl = url.searchParams.get('url') || url.searchParams.get('u')
    if (paramUrl) return paramUrl
    const resp = await fetch(link, { method: 'HEAD', redirect: 'follow' as RequestRedirect })
    return resp.url || link
  } catch {
    return link || null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const client = getServiceRoleClient()
    const { data, error } = await client
      .from('items')
      .select('id, link, thumbnail')
      .is('thumbnail', null)
      .order('published_at', { ascending: false })
      .limit(50)
    if (error) throw error

    let updated = 0
    for (const it of data || []) {
      const finalLink = await resolveLink(it.link)
      const og = await extractOpenGraphImage(finalLink || it.link)
      if (!og) continue
      const { error: upErr } = await client
        .from('items')
        .update({ thumbnail: og, updated_at: new Date().toISOString() })
        .eq('id', it.id)
      if (upErr) continue
      updated++
    }
    return res.status(200).json({ ok: true, checked: (data || []).length, updated })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to backfill thumbnails', detail })
  }
}


