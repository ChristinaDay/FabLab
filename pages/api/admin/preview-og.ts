import type { NextApiRequest, NextApiResponse } from 'next'
import { extractOpenGraph, fetchGraphOEmbed } from '@/lib/extractOg'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const url = String(req.query.url || '')
  if (!url || !/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'Missing or invalid url' })
  try {
    const ogGraph = await fetchGraphOEmbed(url)
    const og = ogGraph || await extractOpenGraph(url)
    if (!og) return res.status(200).json({ ok: true, meta: null })
    return res.status(200).json({ ok: true, meta: og })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to extract OG', detail })
  }
}


