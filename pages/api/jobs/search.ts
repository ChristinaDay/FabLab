import type { NextApiRequest, NextApiResponse } from 'next'
import { searchCombinedJobs } from '@/lib/jobsProviders'
import { getServiceRoleClient } from '@/lib/db'

// Simple in-memory cache and rate limiter (best-effort; resets on cold start)
type CacheEntry = { timestamp: number; payload: any }
const responseCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 24 hours

const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = 60 // max requests per IP per minute
const ipRequestTimestamps = new Map<string, number[]>()

// Curated fabrication terms cache (augmented by active admin job sources)
type CuratedCache = { terms: string[]; fetchedAt: number }
let curatedCache: CuratedCache | null = null
const CURATED_TTL_MS = 2 * 60 * 1000 // 2 minutes

const DEFAULT_FAB_TERMS = [
  'welder', 'welding', 'tig', 'mig', 'fabricator', 'metal fabricator',
  'sheet metal', 'machinist', 'cnc', 'lathe', 'mill', 'cnc operator',
  'model maker', 'prototype technician', 'composites', 'composite technician',
  'woodworker', 'wood shop', 'cabinetmaker', 'joinery',
  // Carpentry specific
  'carpenter', 'carpentry', 'cabinetry', 'millwork', 'joiner',
  'framer', 'framing', 'finish carpenter', 'finish carpentry',
  'additive manufacturing', '3d printing', '3d print', 'printer technician',
  'ceramics', 'kiln technician', 'studio technician',
  'shop manager', 'fabrication manager', 'fabrication technician',
]

const NEGATIVE_TERMS = [
  'therapist', 'counselor', 'psychologist', 'psychiatrist', 'nurse', 'medical', 'physician',
  'teacher', 'tutor', 'professor', 'educator',
  'driver', 'courier', 'delivery', 'rideshare',
  'sales', 'retail', 'cashier', 'barista', 'server', 'cook', 'chef', 'hospitality',
  'real estate', 'realtor', 'mortgage',
]

async function getCuratedTerms(forceRefresh = false): Promise<{ terms: string[]; windowKey: string }> {
  const now = Date.now()
  if (!forceRefresh && curatedCache && now - curatedCache.fetchedAt < CURATED_TTL_MS) {
    const windowKey = String(Math.floor(curatedCache.fetchedAt / CURATED_TTL_MS))
    return { terms: curatedCache.terms, windowKey }
  }
  try {
    const client = getServiceRoleClient()
    const { data, error } = await client
      .from('job_sources')
      .select('active,org')
      .eq('active', true)
    if (error) throw error
    const STOP_WORDS = new Set(['and','or','the','with','for','near','around','jobs','hiring','urgent','at','in','on'])
    const dynamicTerms = Array.isArray(data)
      ? data
          .map((r: any) => String(r.org || ''))
          .flatMap((s) => s.split(/[^a-zA-Z0-9+#/.\-]+/))
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length >= 3 && !STOP_WORDS.has(t))
      : []
    const terms = Array.from(new Set([...DEFAULT_FAB_TERMS, ...dynamicTerms])).map((t) => t.toLowerCase())
    curatedCache = { terms, fetchedAt: now }
    const windowKey = String(Math.floor(now / CURATED_TTL_MS))
    return { terms, windowKey }
  } catch {
    const nowKey = String(Math.floor(now / CURATED_TTL_MS))
    return { terms: DEFAULT_FAB_TERMS, windowKey: nowKey }
  }
}

function filterByFabricationTerms(jobs: any[], terms: string[]): { filtered: any[]; originalCount: number; filteredCount: number } {
  const positivePhrases = terms.filter((t) => t.includes(' ')).map((t) => t.toLowerCase())
  const positiveWords = terms.filter((t) => !t.includes(' ')).map((t) => t.toLowerCase())
  const negativeWords = NEGATIVE_TERMS.map((t) => t.toLowerCase())

  const filtered = jobs.filter((j: any) => {
    const hay = `${j.title || ''} ${j.description || ''} ${j.company || ''}`.toLowerCase()
    let score = 0
    // Phrase matches are strong
    for (const phrase of positivePhrases) {
      if (hay.includes(phrase)) score += 2
    }
    // Word matches with word boundaries
    for (const w of positiveWords) {
      if (hayIncludesToken(hay, w)) score += 1
    }
    if (score <= 0) return false
    // If obviously negative domain and weak positive score, drop it
    const hasNegative = negativeWords.some((n) => hayIncludesToken(hay, n))
    if (hasNegative && score < 2) return false
    return true
  })
  return { filtered, originalCount: jobs.length, filteredCount: filtered.length }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function tokenizeQuery(q: string): { required: string[]; optional: string[][] } {
  // Parse query into required terms (AND) and optional groups (OR)
  // Example: "welder CNC" -> both required
  // Example: "welder OR fabricator" -> either required
  const normalized = q.toLowerCase().trim()
  if (!normalized) return { required: [], optional: [] }

  // Split by OR (case insensitive) to get optional groups
  const orGroups = normalized.split(/\s+or\s+/i)

  if (orGroups.length > 1) {
    // Has OR operators - each group is optional
    const optional = orGroups.map(group => {
      const parts = (group.match(/"[^"]+"|\S+/g) || []).map((p) => p.replace(/^"|"$/g, '').trim()).filter(Boolean)
      return parts
    })
    return { required: [], optional }
  }

  // No OR operators - all terms required
  const parts = (normalized.match(/"[^"]+"|\S+/g) || []).map((p) => p.replace(/^"|"$/g, '').trim())
  const required = Array.from(new Set(parts.filter(Boolean)))
  return { required, optional: [] }
}

function hayIncludesToken(hay: string, token: string): boolean {
  // More flexible matching: handles plurals, partial word matches, and variations
  const base = token.endsWith('s') ? token.slice(0, -1) : token
  const pattern = token.endsWith('s') ? `${escapeRegex(base)}s?` : escapeRegex(base)

  // Try word boundary match first (most precise)
  const wordBoundaryRe = new RegExp(`\\b${pattern}\\b`, 'i')
  if (wordBoundaryRe.test(hay)) return true

  // Fallback: partial match for compound words (e.g., "CNC" in "CNC-machinist")
  const partialRe = new RegExp(pattern, 'i')
  return partialRe.test(hay)
}

function matchesTokens(hay: string, tokens: { required: string[]; optional: string[][] }): boolean {
  // All required tokens must match
  if (tokens.required.length > 0) {
    const allRequired = tokens.required.every(t => hayIncludesToken(hay, t))
    if (!allRequired) return false
  }

  // At least one token from each optional group must match
  if (tokens.optional.length > 0) {
    return tokens.optional.every(group =>
      group.some(t => hayIncludesToken(hay, t))
    )
  }

  return tokens.required.length > 0 // Only match if we had requirements
}

// --- Location helpers (Updrift-style strict client-side filtering, adapted server-side) ---
const STATE_ABBR: Record<string, string> = {
  ca: 'california', ny: 'new york', wa: 'washington', tx: 'texas', fl: 'florida', il: 'illinois',
  ma: 'massachusetts', pa: 'pennsylvania', az: 'arizona', co: 'colorado', ga: 'georgia', mi: 'michigan',
  or: 'oregon', oh: 'ohio', nc: 'north carolina', sc: 'south carolina', va: 'virginia', md: 'maryland',
  nj: 'new jersey', ct: 'connecticut', mn: 'minnesota', wi: 'wisconsin', ut: 'utah', nv: 'nevada',
}

function normalizeLocationInput(raw: string): { phrase: string; tokens: string[] } {
  const s = (raw || '').trim()
  if (!s) return { phrase: '', tokens: [] }
  // Known aliases
  const alias: Record<string, string> = { 'sf': 'San Francisco', 's.f.': 'San Francisco', 'san fran': 'San Francisco' }
  const aliased = alias[s.toLowerCase()] || s
  const parts = aliased.split(',').map((p) => p.trim()).filter(Boolean)
  const phrase = parts.join(', ')
  const tokensRaw = aliased
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => STATE_ABBR[t] || t)
  const tokens = Array.from(new Set(tokensRaw))
  return { phrase, tokens }
}

function filterJobsByLocation(jobs: any[], location: string): { filtered: any[]; originalCount: number; filteredCount: number } {
  const { phrase, tokens } = normalizeLocationInput(location)
  if (!phrase && tokens.length === 0) return { filtered: jobs, originalCount: jobs.length, filteredCount: jobs.length }
  const filtered = jobs.filter((j: any) => {
    const hay = `${j.location || ''} ${j.description || ''}`.toLowerCase()
    if (phrase && hay.includes(phrase.toLowerCase())) return true
    if (tokens.length === 0) return false
    return tokens.every((t) => hayIncludesToken(hay, t))
  })
  return { filtered, originalCount: jobs.length, filteredCount: filtered.length }
}

function makeCacheKey(params: {
  q: string
  loc: string
  strict: boolean
  limit: number
  page: number
  radius: number
}) {
  return [params.q.trim(), params.loc.trim(), params.strict ? '1' : '0', params.limit, params.page, params.radius].join('|')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    // Support both legacy (q/loc) and Updrift-style (query/location) params
    const q = String((req.query.query ?? req.query.q) || '').trim()
    const strict = String(req.query.strict || '').toLowerCase() === '1' || String(req.query.strict || '').toLowerCase() === 'true'
    const locRaw = String((req.query.location ?? req.query.loc) || '').trim()
    const loc = normalizeLocation(locRaw)
    const limit = Math.min(200, Number(req.query.limit) || 100)
    const page = Math.max(1, Number(req.query.page) || 1)
    const radius = Math.max(0, Number(req.query.radius) || 0)
    const curatedOnly = String(req.query.curated_only || '') === '1'

    // Rate limiting per IP (best-effort)
    const ip = String((req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown')
    const now = Date.now()
    const history = (ipRequestTimestamps.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
    history.push(now)
    ipRequestTimestamps.set(ip, history)
    if (history.length > RATE_LIMIT_MAX) {
      res.setHeader('Retry-After', '60')
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again shortly.' })
    }

    const nocache = String(req.query.nocache || '') === '1'
    const forceCurated = String(req.query.force_curated_refresh || '') === '1'

    // Curated fabrication terms (refreshable)
    const { terms: fabricationTerms, windowKey: curatedWindow } = await getCuratedTerms(forceCurated)

    // Cache lookup (include curated window so updates propagate)
    const cacheKey = `${makeCacheKey({ q, loc, strict, limit, page, radius })}|curated:${curatedWindow}`
    const cached = responseCache.get(cacheKey)
    if (!nocache && cached && now - cached.timestamp < CACHE_TTL_MS) {
      res.setHeader('x-cache', 'HIT')
      return res.status(200).json(cached.payload)
    }

    // Use combined provider search (Adzuna + JSearch)
    // NOTE: Current providers fetch first page only; we expose paging fields for compatibility
    const originalJobs = curatedOnly ? [] : await searchCombinedJobs(q, loc)
    // Step 1: Fabrication relevance filter (based on curated terms)
    const fab = filterByFabricationTerms(originalJobs, fabricationTerms)

    // Step 2: Curated DB jobs (visible = true) -> filter by query terms
    let curatedJobs: any[] = []
    try {
      const client = getServiceRoleClient()
      const { data: dbJobs, error: dbErr } = await client
        .from('jobs')
        .select('id,title,company,location,description,link,source,visible,published_at')
        .eq('visible', true)
        .order('published_at', { ascending: false })
        .limit(500)
      if (dbErr) throw dbErr
      const qTokens = tokenizeQuery(String(q || ''))
      curatedJobs = (dbJobs || []).filter((j: any) => {
        if (qTokens.required.length === 0 && qTokens.optional.length === 0) return true
        const hay = `${(j.title || '')} ${(j.description || '')} ${(j.company || '')}`.toLowerCase()
        // Use the new matchesTokens function for consistent AND/OR logic
        return matchesTokens(hay, qTokens)
      }).map((j: any) => ({
        id: String(j.id || j.link || ''),
        title: j.title || '',
        company: j.company || '',
        location: j.location || '',
        description: j.description || '',
        link: j.link || '',
        // Preserve provider if stored on the job record; otherwise mark curated
        source: j.source || 'curated',
        published_at: j.published_at || null,
        curated: true,
      })).filter((j: any) => j.link)
    } catch {
      curatedJobs = []
    }

    // Step 3: Merge curated + external and de-duplicate by link
    // Prefer curated content structure but preserve provider source when available
    const byLink = new Map<string, any>()
    for (const ext of fab.filtered) {
      if (!ext?.link) continue
      byLink.set(ext.link, ext)
    }
    for (const cur of curatedJobs) {
      if (!cur?.link) continue
      const existing = byLink.get(cur.link)
      if (existing) {
        const merged = {
          ...existing,
          ...cur,
          source: cur.source && cur.source !== 'curated' ? cur.source : (existing.source || 'curated'),
          curated: true,
        }
        byLink.set(cur.link, merged)
      } else {
        byLink.set(cur.link, cur)
      }
    }
    let jobs = Array.from(byLink.values())

    // Apply Updrift-style location filter and scoring
    if (loc) {
      const strictFiltered = filterJobsByLocation(jobs, loc)
      if (strict) {
        jobs = strictFiltered.filtered
      } else {
        // Soft scoring: boost matches but keep others, prioritizing curated
        const { phrase, tokens } = normalizeLocationInput(loc)
        jobs = jobs
          .map((j: any) => {
            const hay = `${j.location || ''} ${j.description || ''}`.toLowerCase()
            let score = 0
            if (phrase && hay.includes(phrase.toLowerCase())) score += 3
            for (const t of tokens) if (hayIncludesToken(hay, t)) score += 1
            if (j.curated || j.source === 'curated') score += 100
            return { j, score }
          })
          .sort((a: any, b: any) => b.score - a.score)
          .map((x: any) => x.j)
      }
    }

    // Trim to limit
    const trimmed = jobs.slice(0, limit)

    // Rich response compatible with Updrift's client expectations
    const response = {
      status: 'success' as const,
      data: trimmed,
      original_data: originalJobs,
      total_count: originalJobs.length,
      client_filtered: Boolean(loc),
      original_count: originalJobs.length,
      filtered_count: trimmed.length,
      fabrication_filtered: true,
      fabrication_original_count: fab.originalCount,
      fabrication_filtered_count: fab.filteredCount,
      page,
      results_per_page: limit,
      // Back-compat for existing UI
      jobs: trimmed,
      // Echo params for debugging/clients
      params: { q, location: loc, strict, radius }
    }

    // Store in cache (unless nocache)
    if (!nocache) responseCache.set(cacheKey, { timestamp: now, payload: response })
    res.setHeader('x-cache', nocache ? 'BYPASS' : 'MISS')
    return res.status(200).json(response)
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


