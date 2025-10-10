import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { id, featured_rank, pick_rank } = req.body as { id?: string; featured_rank?: number | null; pick_rank?: number | null }
    if (!id) return res.status(400).json({ error: 'Missing id' })

    const update: Record<string, any> = { updated_at: new Date().toISOString() }
    if (featured_rank === null || typeof featured_rank === 'number') update.featured_rank = featured_rank
    if (pick_rank === null || typeof pick_rank === 'number') update.pick_rank = pick_rank
    if (!('featured_rank' in update) && !('pick_rank' in update)) {
      return res.status(400).json({ error: 'Nothing to update' })
    }

    const client = getServiceRoleClient()
    const { data, error } = await client
      .from('items')
      .update(update)
      .eq('id', id)
      .select()
      .limit(1)
    if (error) throw error
    return res.status(200).json({ ok: true, item: (data || [])[0] })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to update curation', detail })
  }
}


