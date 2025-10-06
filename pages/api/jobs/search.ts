import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const q = String(req.query.q || '').trim()
    const strict = String(req.query.strict || '').toLowerCase() === '1' || String(req.query.strict || '').toLowerCase() === 'true'
    const locRaw = String(req.query.loc || '').trim()
    const loc = normalizeLocation(locRaw)
    const limit = Math.min(100, Number(req.query.limit) || 50)
    const client = getServiceRoleClient()
    let query = client.from('jobs').select('*').eq('visible', true)
    if (q) {
      // Support simple boolean OR syntax (e.g., "welder OR welding OR \"metal fabricator\"")
      const tokens = Array.from(new Set(
        q
          .split(/\s+OR\s+/i) // split on OR
          .flatMap((part) => part.split(/\s+/)) // also split remaining words
          .map((t) => t.replace(/^"|"$/g, '').trim())
          .filter(Boolean)
      ))

      if (tokens.length === 1) {
        const t = tokens[0]
        query = query.or(`title.ilike.%${t}%,company.ilike.%${t}%,description.ilike.%${t}%`)
      } else if (tokens.length > 1) {
        // Build a big OR across all tokens and fields
        const parts: string[] = []
        for (const t of tokens) {
          parts.push(`title.ilike.%${t}%`)
          parts.push(`company.ilike.%${t}%`)
          parts.push(`description.ilike.%${t}%`)
        }
        query = query.or(parts.join(','))
      }
    }
    if (loc) {
      // Match location tokens across location and description (city/state often in either)
      const locTokens = Array.from(new Set(
        loc
          .split(/[,\s]+/)
          .map((t) => t.replace(/^"|"$/g, '').trim())
          .filter(Boolean)
      ))
      if (locTokens.length === 1) {
        const t = locTokens[0]
        query = query.or(`location.ilike.%${t}%,description.ilike.%${t}%`)
      } else if (locTokens.length > 1) {
        const parts: string[] = []
        for (const t of locTokens) {
          parts.push(`location.ilike.%${t}%`)
          parts.push(`description.ilike.%${t}%`)
        }
        query = query.or(parts.join(','))
      }
    }
    query = query.order('published_at', { ascending: false }).limit(limit)
    const { data, error } = await query
    if (error) throw error
    let rows = data || []
    if (loc) {
      const phrase = loc.toLowerCase().trim()
      const tokens = Array.from(new Set(
        phrase
          .split(/[,"\s]+/)
          .map((t) => t.trim())
          .filter(Boolean)
      ))
      if (strict && tokens.length > 0) {
        // Strict: require phrase or ALL tokens present
        rows = rows.filter((r: any) => {
          const hay = `${r.location || ''} ${r.description || ''}`.toLowerCase()
          if (phrase && hay.includes(phrase)) return true
          return tokens.every((t) => hay.includes(t))
        })
      } else {
        // Rank by relevance
        rows = rows
          .map((r: any) => {
            const hay = `${r.location || ''} ${r.description || ''}`.toLowerCase()
            let score = 0
            if (phrase && hay.includes(phrase)) score += 3
            for (const t of tokens) if (hay.includes(t)) score += 1
            return { r, score }
          })
          .sort((a: any, b: any) => b.score - a.score)
          .map((x: any) => x.r)
      }
    }
    return res.status(200).json({ jobs: rows })
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


