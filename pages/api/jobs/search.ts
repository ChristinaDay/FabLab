import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const q = String(req.query.q || '').trim()
    const loc = String(req.query.loc || '').trim()
    const limit = Math.min(100, Number(req.query.limit) || 50)
    const client = getServiceRoleClient()
    let query = client.from('jobs').select('*').eq('visible', true)
    if (q) {
      // basic ilike on title/company/description
      query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%,description.ilike.%${q}%`)
    }
    if (loc) {
      query = query.ilike('location', `%${loc}%`)
    }
    query = query.order('published_at', { ascending: false }).limit(limit)
    const { data, error } = await query
    if (error) throw error
    return res.status(200).json({ jobs: data || [] })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Search failed', detail })
  }
}


