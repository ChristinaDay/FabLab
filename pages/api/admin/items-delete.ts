import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { id } = req.body as { id?: string }
  if (!id) return res.status(400).json({ error: 'Missing id' })
  try {
    const client = getServiceRoleClient()
    const { error } = await client.from('items').delete().eq('id', id)
    if (error) throw error
    return res.status(200).json({ ok: true })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to delete item', detail })
  }
}


