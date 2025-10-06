import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const client = getServiceRoleClient()
    const { data, error } = await client
      .from('job_sources')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return res.status(200).json({ sources: data || [] })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to list job_sources', detail })
  }
}


