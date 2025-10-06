import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'
import { searchCombinedJobs } from '@/lib/jobsProviders'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const q = String(req.query.q || '').trim()
    const strict = String(req.query.strict || '').toLowerCase() === '1' || String(req.query.strict || '').toLowerCase() === 'true'
    const locRaw = String(req.query.loc || '').trim()
    const loc = normalizeLocation(locRaw)
    const limit = Math.min(100, Number(req.query.limit) || 50)

    // Use combined provider search (Adzuna + JSearch), ignoring local DB rows
    const jobs = await searchCombinedJobs(q, loc)

    // Optionally trim to limit
    const trimmed = jobs.slice(0, limit)

    return res.status(200).json({ jobs: trimmed })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Search failed', detail })
  }
}

function normalizeLocation(s: string): string {
  const v = s.trim().toLowerCase()
  if (!v) return v
  // Simple aliases
  if (v === 'sf' || v === 's.f.' || v === 'san fran') return 'San Francisco'
  return s
}


