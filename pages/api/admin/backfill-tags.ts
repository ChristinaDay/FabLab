import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { sourceContains, addTag } = req.body as { sourceContains?: string; addTag?: string }
    if (!addTag) return res.status(400).json({ error: 'Missing addTag' })
    const client = getServiceRoleClient()

    // Fetch items that match and are missing the tag
    let query = client.from('items').select('id, tags, source').limit(2000)
    if (sourceContains && sourceContains.trim()) {
      query = query.ilike('source', `%${sourceContains.trim()}%`)
    }
    const { data, error } = await query
    if (error) throw error

    const updates = (data || []).filter((row: any) => {
      const tags: string[] = Array.isArray(row.tags) ? row.tags : []
      return !tags.includes(addTag as string)
    }).map((row: any) => ({
      id: row.id,
      tags: [...(Array.isArray(row.tags) ? row.tags : []), addTag as string],
      updated_at: new Date().toISOString(),
    }))

    if (updates.length === 0) return res.status(200).json({ ok: true, updated: 0 })
    const { error: upErr } = await client.from('items').upsert(updates, { onConflict: 'id' })
    if (upErr) throw upErr
    return res.status(200).json({ ok: true, updated: updates.length })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to backfill tags', detail })
  }
}


