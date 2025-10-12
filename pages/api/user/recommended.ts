import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const tagsParam = (req.query.tags as string) || ''
    const limit = Number(req.query.limit || 24)
    const excludeParam = (req.query.exclude as string) || ''
    const tags = tagsParam.split(',').map((t) => t.trim()).filter(Boolean)
    const exclude = new Set(excludeParam.split(',').map((t) => t.trim()).filter(Boolean))
    if (tags.length === 0) return res.status(200).json({ items: [] })

    const client = getServiceRoleClient()
    // Fetch a recent slice and filter by (tag-overlap OR keyword in title/excerpt/source)
    const { data, error } = await client
      .from('items')
      .select('*')
      .eq('visible', true)
      .order('published_at', { ascending: false })
      .limit(Math.max(limit * 5, 100))
    if (error) throw error

    const lowerTags = tags.map((t) => t.toLowerCase())

    function matchesText(it: any) {
      const blob = `${it.title || ''} ${it.excerpt || ''} ${it.source || ''}`.toLowerCase()
      return lowerTags.some((k) => blob.includes(k))
    }

    function overlapsTags(it: any) {
      const itTags: string[] = Array.isArray(it.tags) ? it.tags : []
      return itTags.some((t) => lowerTags.includes(String(t).toLowerCase()))
    }

    const filtered = (data || [])
      .filter((it: any) => !exclude.has(it.id))
      .filter((it: any) => overlapsTags(it) || matchesText(it))
      .slice(0, limit)

    return res.status(200).json({ items: filtered })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to load recommended items', detail })
  }
}


