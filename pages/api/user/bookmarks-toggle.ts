import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.body?.user_id as string)
    const itemId = (req.body?.item_id as string)
    if (!userId || !itemId) return res.status(400).json({ error: 'Missing user_id or item_id' })
    const client = getServiceRoleClient()
    // toggle: if exists delete, else insert
    const exists = await client.from('bookmarks').select('id').eq('user_id', userId).eq('item_id', itemId).maybeSingle()
    if (exists.data) {
      const { error } = await client.from('bookmarks').delete().eq('id', exists.data.id)
      if (error) throw error
      return res.status(200).json({ ok: true, bookmarked: false })
    }
    const { error } = await client.from('bookmarks').insert({ user_id: userId, item_id: itemId })
    if (error) throw error
    return res.status(200).json({ ok: true, bookmarked: true })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to toggle bookmark', detail })
  }
}


