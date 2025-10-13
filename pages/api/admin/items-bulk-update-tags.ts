import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

type Body = {
  ids?: string[]
  addTag?: string
  removeTag?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { ids, addTag, removeTag } = req.body as Body
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'Missing ids' })

  try {
    const client = getServiceRoleClient()

    const { data, error } = await client
      .from('items')
      .select('id,tags')
      .in('id', ids)
    if (error) throw error

    const updates = (data || []).map((row: any) => {
      const current = Array.isArray(row.tags) ? (row.tags as string[]) : []
      let next = current
      if (addTag && addTag.trim()) {
        const t = addTag.trim()
        if (!next.includes(t)) next = [...next, t]
      }
      if (removeTag && removeTag.trim()) {
        const r = removeTag.trim()
        next = next.filter((x) => x !== r)
      }
      return { id: row.id as string, tags: next, updated_at: new Date().toISOString() }
    })

    // Batch upsert
    const chunk = 200
    let updated = 0
    for (let i = 0; i < updates.length; i += chunk) {
      const slice = updates.slice(i, i + chunk)
      const { error: upErr } = await client.from('items').upsert(slice, { onConflict: 'id' })
      if (upErr) throw upErr
      updated += slice.length
    }

    return res.status(200).json({ ok: true, updated })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to update tags', detail })
  }
}


