type SimpleJob = {
  id: string
  title: string
  company: string
  location?: string
  description?: string
  link: string
  source: 'adzuna' | 'jsearch'
  published_at?: string
}

function normalizeWhitespace(text?: string): string {
  return String(text || '').replace(/\s+/g, ' ').trim()
}

export async function searchAdzunaJobs(query: string, location?: string): Promise<SimpleJob[]> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) return []

  const country = 'us'
  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`)
  url.searchParams.set('app_id', appId)
  url.searchParams.set('app_key', appKey)
  url.searchParams.set('results_per_page', '100')
  if (query) url.searchParams.set('what', query)
  if (location) url.searchParams.set('where', location)

  const resp = await fetch(url.toString(), { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' } })
  if (!resp.ok) return []
  const data = await resp.json()
  const results = Array.isArray(data.results) ? data.results : []
  return results.map((j: any) => {
    const loc = j.location?.display_name || ''
    return {
      id: String(j.id ?? j.redirect_url ?? ''),
      title: j.title || '',
      company: j.company?.display_name || '',
      location: loc,
      description: normalizeWhitespace(j.description || ''),
      link: j.redirect_url || '',
      source: 'adzuna',
      published_at: j.created || undefined,
    }
  }).filter((j: SimpleJob) => j.link)
}

export async function searchJSearchJobs(query: string, location?: string): Promise<SimpleJob[]> {
  const apiKey = process.env.RAPIDAPI_KEY
  const host = process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com'
  if (!apiKey) return []

  const url = new URL(`https://${host}/search`)
  if (query) url.searchParams.set('query', query)
  if (location) url.searchParams.set('location', location)
  url.searchParams.set('page', '1')
  url.searchParams.set('num_pages', '1')

  const resp = await fetch(url.toString(), {
    headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': host, Accept: 'application/json' },
  })
  if (!resp.ok) return []
  const data = await resp.json()
  const items = Array.isArray(data.data) ? data.data : []
  return items.map((j: any) => {
    const loc = j.job_city || j.job_location || ''
    return {
      id: String(j.job_id ?? j.job_apply_link ?? ''),
      title: j.job_title || '',
      company: j.employer_name || '',
      location: loc,
      description: normalizeWhitespace(j.job_description || ''),
      link: j.job_apply_link || j.job_google_link || '',
      source: 'jsearch',
      published_at: j.job_posted_at_datetime_utc || undefined,
    }
  }).filter((j: SimpleJob) => j.link)
}

export async function searchCombinedJobs(query: string, location?: string): Promise<SimpleJob[]> {
  const [adzuna, jsearch] = await Promise.all([
    searchAdzunaJobs(query, location),
    searchJSearchJobs(query, location),
  ])
  const seen = new Set<string>()
  const all = [...adzuna, ...jsearch].filter((j) => {
    const key = j.link
    if (!key) return false
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return all
}

export type { SimpleJob }


