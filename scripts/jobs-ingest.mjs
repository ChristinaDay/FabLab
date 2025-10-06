import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const client = createClient(supabaseUrl, serviceKey)

async function upsertJob(job) {
  const { error } = await client
    .from('jobs')
    .upsert({ ...job, updated_at: new Date().toISOString() }, { onConflict: 'link' })
  if (error) throw error
}

async function fetchGreenhouse(org, label, tags, autoPublish) {
  // Public API: https://boards-api.greenhouse.io/v1/boards/{org}/jobs
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(org)}/jobs?content=true`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json, text/plain, */*'
    }
  })
  if (!res.ok) throw new Error(`Greenhouse ${org} HTTP ${res.status}`)
  const data = await res.json()
  const jobs = Array.isArray(data.jobs) ? data.jobs : []
  let count = 0
  for (const j of jobs) {
    const link = j.absolute_url || ''
    if (!link) continue
    const raw = (j.content || '')
    const decoded = decodeHtml(raw)
    const plain = stripHtml(decoded)
    const snippet = greenhouseSnippet(plain, j.title)
    await upsertJob({
      title: j.title || 'Untitled',
      company: label || org,
      location: (j.location && j.location.name) || '',
      link,
      description: snippet,
      source: 'greenhouse',
      tags,
      published_at: j.updated_at || new Date().toISOString(),
      visible: !!autoPublish,
    })
    count++
  }
  return count
}

async function fetchLever(org, label, tags, autoPublish) {
  // Public API: https://api.lever.co/v0/postings/{org}?mode=json
  const url = `https://api.lever.co/v0/postings/${encodeURIComponent(org)}?mode=json`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json, text/plain, */*'
    }
  })
  if (!res.ok) throw new Error(`Lever ${org} HTTP ${res.status}`)
  const jobs = await res.json()
  let count = 0
  for (const j of jobs) {
    const link = j.hostedUrl || ''
    if (!link) continue
    const location = j.categories?.location || ''
    await upsertJob({
      title: j.text || 'Untitled',
      company: label || org,
      location,
      link,
      description: (j.descriptionPlain && j.descriptionPlain.slice(0, 2000)) || '',
      source: 'lever',
      tags,
      published_at: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(),
      visible: !!autoPublish,
    })
    count++
  }
  return count
}

async function fetchAdzuna(query, label, tags, autoPublish, opts = {}) {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) throw new Error('Missing ADZUNA_APP_ID/ADZUNA_APP_KEY')
  const pages = Math.max(1, opts.pages || 1)
  const region = (opts.region || 'US').toLowerCase()
  const include = opts.include_keywords || []
  const exclude = opts.exclude_keywords || []
  const maxAge = opts.max_age_days || 0
  let count = 0
  for (let p = 1; p <= pages; p++) {
    const endpoint = `https://api.adzuna.com/v1/api/jobs/${region}/search/${p}`
    const url = `${endpoint}?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}&results_per_page=50&what=${encodeURIComponent(query)}`
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } })
    if (!res.ok) throw new Error(`Adzuna HTTP ${res.status}`)
    const data = await res.json()
    const jobs = Array.isArray(data.results) ? data.results : []
    for (const j of jobs) {
      const link = j.redirect_url || j.apply_url || ''
      if (!link) continue
      const title = j.title || 'Untitled'
      const company = j.company?.display_name || label || 'Adzuna'
      const location = j.location?.display_name || ''
      const description = (j.description || '').slice(0, 2000)
      const text = `${title} ${company} ${location} ${description}`
      if (!withinMaxAge(j.created, maxAge)) continue
      const score = buildScore(text, tags, include, exclude)
      const gatingEnabled = (include.length > 0 || exclude.length > 0)
      await upsertJob({
        title,
        company,
        location,
        city: (j.location && Array.isArray(j.location.area) && j.location.area.length > 0) ? j.location.area[j.location.area.length - 1] : undefined,
        state: (j.location && Array.isArray(j.location.area) && j.location.area.length > 1) ? j.location.area[j.location.area.length - 2] : undefined,
        country: (j.location && Array.isArray(j.location.area) && j.location.area.length > 2) ? j.location.area[0] : undefined,
        is_remote: /\bremote\b/i.test(`${title} ${description}`),
        lat: typeof j.latitude === 'number' ? j.latitude : undefined,
        lon: typeof j.longitude === 'number' ? j.longitude : undefined,
        link,
        description,
        source: 'adzuna',
        tags,
        published_at: j.created || new Date().toISOString(),
        visible: gatingEnabled ? (!!autoPublish && score >= 3) : !!autoPublish,
      })
      count++
    }
  }
  return count
}

async function fetchJSearch(query, label, tags, autoPublish, opts = {}) {
  const rapidKey = process.env.RAPIDAPI_KEY
  const rapidHost = process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com'
  if (!rapidKey) throw new Error('Missing RAPIDAPI_KEY')
  const pages = Math.max(1, opts.pages || 1)
  const include = opts.include_keywords || []
  const exclude = opts.exclude_keywords || []
  const maxAge = opts.max_age_days || 0
  let count = 0
  for (let p = 1; p <= pages; p++) {
    const url = `https://${rapidHost}/search?query=${encodeURIComponent(query)}&page=${p}&num_pages=1`
    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': rapidKey,
        'X-RapidAPI-Host': rapidHost,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    })
    if (!res.ok) throw new Error(`JSearch HTTP ${res.status}`)
    const data = await res.json()
    const jobs = Array.isArray(data.data) ? data.data : []
    for (const j of jobs) {
      const link = j.job_apply_link || j.job_google_link || ''
      if (!link) continue
      const title = j.job_title || 'Untitled'
      const company = j.employer_name || label || 'JSearch'
      const location = j.job_city || j.job_location || ''
      const description = (j.job_description && j.job_description.replace(/\s+/g, ' ').trim().slice(0,2000)) || jsearchSnippet(j)
      const published = j.job_posted_at_datetime_utc || j.job_posted_at_timestamp || null
      const text = `${title} ${company} ${location} ${description}`
      if (!withinMaxAge(published, maxAge)) continue
      const score = buildScore(text, tags, include, exclude)
      const gatingEnabled = (include.length > 0 || exclude.length > 0)
      await upsertJob({
        title,
        company,
        location,
        city: j.job_city || undefined,
        state: j.job_state || undefined,
        country: j.job_country || undefined,
        is_remote: !!j.job_is_remote,
        lat: typeof j.job_latitude === 'number' ? j.job_latitude : undefined,
        lon: typeof j.job_longitude === 'number' ? j.job_longitude : undefined,
        link,
        description,
        source: 'jsearch',
        tags,
        published_at: published ? new Date(published).toISOString() : new Date().toISOString(),
        visible: gatingEnabled ? (!!autoPublish && score >= 3) : !!autoPublish,
      })
      count++
    }
  }
  return count
}

function stripHtml(html) {
  return String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function decodeHtml(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function greenhouseSnippet(plain, title) {
  const maxLen = 2000
  if (!plain) return ''
  const boilerplate = [
    'to reinvent an industry, you have to build the best team',
    'join formlabs',
    'our printers are used by',
  ]
  const sentences = plain
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  // Prefer a sentence that is not boilerplate and mentions the role or responsibilities
  const lowerTitle = String(title || '').toLowerCase()
  const pick =
    sentences.find((s) => s.toLowerCase().includes('responsibil') || s.toLowerCase().startsWith('as a')) ||
    sentences.find((s) => lowerTitle && s.toLowerCase().includes(lowerTitle.split(' ')[0])) ||
    sentences.find((s) => !boilerplate.some((b) => s.toLowerCase().includes(b))) ||
    sentences[0]

  return (pick || plain).slice(0, maxLen)
}

function withinMaxAge(iso, maxDays) {
  if (!maxDays) return true
  const ts = iso ? new Date(iso).getTime() : Date.now()
  const ageDays = (Date.now() - ts) / (1000 * 60 * 60 * 24)
  return ageDays <= maxDays
}

function buildScore(text, tags = [], include = [], exclude = []) {
  const hay = (text || '').toLowerCase()
  let score = 0
  const strong = [
    'welder','welding','fabricator','fabrication','cnc','machinist','model maker','prototype',
    'composite','additive','3d printing','woodworker','metal shop','shop manager','ceramic','kiln'
  ]
  for (const k of strong) if (hay.includes(k)) score += 2
  for (const t of tags) if (hay.includes(String(t).toLowerCase())) score += 1
  for (const inc of include) if (hay.includes(String(inc).toLowerCase())) score += 1
  for (const exc of exclude) if (hay.includes(String(exc).toLowerCase())) score -= 2
  return score
}

function jsearchSnippet(j) {
  const hl = j.job_highlights || {}
  const blocks = []
  for (const key of ['Qualifications', 'Responsibilities', 'Benefits']) {
    if (Array.isArray(hl[key]) && hl[key].length) blocks.push(hl[key].slice(0, 3).join(' • '))
  }
  const snippet = blocks.join(' | ')
  const desc = (j.job_description || '').replace(/\s+/g, ' ').trim()
  return (snippet || desc).slice(0, 2000)
}

async function main() {
  // job_sources rows shape by type:
  // greenhouse|lever: { type, org, label?, tags? }
  // adzuna|jsearch: { type, org: query string, label?, tags? }
  const { data: sources, error } = await client
    .from('job_sources')
    .select('type, org, label, tags, auto_publish, include_keywords, exclude_keywords, region, remote_only, max_age_days, pages')
    .eq('active', true)
  if (error) {
    console.error('Failed to load job_sources:', error.message)
    process.exit(1)
  }
  if (!sources || sources.length === 0) {
    console.log('No active job_sources found.')
    return
  }

  let total = 0
  for (const s of sources) {
    const label = s.label || s.org
    const tags = s.tags || null
    try {
      let c = 0
      const auto = s.auto_publish ?? true
      const opts = {
        include_keywords: s.include_keywords || [],
        exclude_keywords: s.exclude_keywords || [],
        region: s.region || 'US',
        remote_only: !!s.remote_only,
        max_age_days: s.max_age_days || 0,
        pages: s.pages || 1,
      }
      if (s.type === 'greenhouse') c = await fetchGreenhouse(s.org, label, tags, auto)
      else if (s.type === 'lever') c = await fetchLever(s.org, label, tags, auto)
      else if (s.type === 'adzuna') c = await fetchAdzuna(s.org, label, tags, auto, opts)
      else if (s.type === 'jsearch') c = await fetchJSearch(s.org, label, tags, auto, opts)
      else {
        console.log(`Skipping unsupported source type: ${s.type}`)
        continue
      }
      total += c
      console.log(`OK ${s.type}:${s.org} → ${c}`)
    } catch (e) {
      console.error(`ERR ${s.type}:${s.org}`, e.message || e)
    }
  }
  console.log(`Done. Total jobs processed: ${total}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


