import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { id, auto_publish, active } = req.body as { id?: string; auto_publish?: boolean; active?: boolean }
  if (!id) return res.status(400).json({ error: 'Missing id' })
  try {
    const client = getServiceRoleClient()
    const updates: Record<string, any> = {}
    if (typeof auto_publish === 'boolean') updates.auto_publish = auto_publish
    if (typeof active === 'boolean') updates.active = active
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updates provided' })
    const { error } = await client.from('job_sources').update(updates).eq('id', id)
    if (error) throw error
    return res.status(200).json({ ok: true })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to update job_source', detail })
  }
}


