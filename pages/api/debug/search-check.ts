import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const q = String((req.query.query ?? req.query.q) || '').trim()
    const loc = String((req.query.location ?? req.query.loc) || '').trim()
    const strict = String(req.query.strict || '').toLowerCase() === '1'
    const page = Number(req.query.page || 1)
    const radius = Number(req.query.radius || 0)

    const protocol = (req.headers['x-forwarded-proto'] as string) || 'http'
    const host = req.headers.host
    const base = `${protocol}://${host}`

    const params = new URLSearchParams()
    if (q) params.set('query', q)
    if (loc) params.set('location', loc)
    if (strict) params.set('strict', '1')
    if (page) params.set('page', String(page))
    if (radius) params.set('radius', String(radius))

    const url = `${base}/api/jobs/search?${params.toString()}`
    const started = Date.now()
    const resp = await fetch(url)
    const durationMs = Date.now() - started
    const data = await resp.json()

    const xCache = resp.headers.get('x-cache') || 'NONE'

    return res.status(200).json({
      ok: resp.ok,
      status: resp.status,
      x_cache: xCache,
      duration_ms: durationMs,
      total_count: data?.total_count ?? (data?.jobs?.length || data?.data?.length || 0),
      params: { q, location: loc, strict, page, radius }
    })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Debug check failed', detail })
  }
}


