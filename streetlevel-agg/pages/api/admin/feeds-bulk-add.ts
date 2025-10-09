import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { urls } = req.body as { urls?: string[] }
  if (!urls || !Array.isArray(urls) || urls.length === 0) return res.status(400).json({ error: 'Missing urls' })

  try {
    const client = getServiceRoleClient()
    const rows = urls.map((u) => ({ url: u, active: true }))
    const { error } = await client.from('feeds').upsert(rows, { onConflict: 'url' })
    if (error) throw error
    return res.status(200).json({ ok: true, count: rows.length })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to add feeds', detail })
  }
}


