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

async function fetchGreenhouse(org, label, tags) {
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
    await upsertJob({
      title: j.title || 'Untitled',
      company: label || org,
      location: (j.location && j.location.name) || '',
      link,
      description: (j.content && stripHtml(j.content).slice(0, 2000)) || '',
      source: 'greenhouse',
      tags,
      published_at: j.updated_at || new Date().toISOString(),
      visible: false,
    })
    count++
  }
  return count
}

async function fetchLever(org, label, tags) {
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
      visible: false,
    })
    count++
  }
  return count
}

function stripHtml(html) {
  return String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

async function main() {
  // job_sources: { type: 'greenhouse'|'lever', org: 'acme', label?, tags?, active }
  const { data: sources, error } = await client
    .from('job_sources')
    .select('type, org, label, tags')
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
      if (s.type === 'greenhouse') c = await fetchGreenhouse(s.org, label, tags)
      else if (s.type === 'lever') c = await fetchLever(s.org, label, tags)
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


