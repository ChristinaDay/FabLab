import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const client = getServiceRoleClient()
    const { data, error } = await client
      .from('jobs')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(200)
    if (error) throw error
    return res.status(200).json({ jobs: data || [] })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to list jobs', detail })
  }
}


