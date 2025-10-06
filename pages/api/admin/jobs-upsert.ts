import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient, upsertJobServer } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const client = getServiceRoleClient()
    const job = req.body
    await upsertJobServer(client, job)
    return res.status(200).json({ ok: true })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to upsert job', detail })
  }
}


