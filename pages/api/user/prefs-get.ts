import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.user_id as string)
    if (!userId) return res.status(400).json({ error: 'Missing user_id' })
    const client = getServiceRoleClient()
    const { data, error } = await client.from('user_prefs').select('tags').eq('user_id', userId).maybeSingle()
    if (error) throw error
    return res.status(200).json({ tags: (data?.tags as string[]) || [] })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to get prefs', detail })
  }
}


