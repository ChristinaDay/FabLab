import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { ids } = req.body as { ids?: string[] }
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'Missing ids' })
  try {
    const client = getServiceRoleClient()
    const { error } = await client.from('items').delete().in('id', ids)
    if (error) throw error
    return res.status(200).json({ ok: true, count: ids.length })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to bulk delete items', detail })
  }
}


