import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { type, query, label } = req.body as { type?: string; query?: string; label?: string }
  if (!type || !query) return res.status(400).json({ error: 'Missing type or query' })
  if (!['adzuna', 'jsearch'].includes(type)) return res.status(400).json({ error: 'Unsupported type' })
  try {
    const client = getServiceRoleClient()
    const row = {
      type,
      org: query,
      label: label || `${type === 'adzuna' ? 'Adzuna' : 'JSearch'}: ${query}`,
      auto_publish: true,
      active: true,
    }
    const { data, error } = await client.from('job_sources').upsert(row, { onConflict: 'type,org' }).select('id')
    if (error) throw error
    return res.status(200).json({ ok: true, id: data?.[0]?.id })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to add source', detail })
  }
}


