import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.user_id as string)
    if (!userId) return res.status(400).json({ error: 'Missing user_id' })
    const client = getServiceRoleClient()

    // 1) Get bookmark rows
    const { data: rows, error: bErr } = await client
      .from('bookmarks')
      .select('item_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (bErr) throw bErr

    const itemIds = Array.from(new Set((rows || []).map((r: any) => r.item_id)))
    if (itemIds.length === 0) {
      return res.status(200).json({ items: [] })
    }

    // 2) Fetch items for those IDs
    const { data: items, error: iErr } = await client
      .from('items')
      .select('*')
      .in('id', itemIds)
    if (iErr) throw iErr
    const idToItem: Record<string, any> = {}
    for (const it of items || []) idToItem[(it as any).id] = it

    // 3) Merge back preserving bookmark order
    const merged = (rows || []).map((r: any) => ({ item_id: r.item_id, created_at: r.created_at, items: idToItem[r.item_id] || null }))

    return res.status(200).json({ items: merged })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to list bookmarks', detail })
  }
}


