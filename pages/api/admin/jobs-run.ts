import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getServiceRoleClient } from '@/lib/db'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

async function upsertJob(job: any) {
  const client = getClient()
  const { error } = await client
    .from('jobs')
    .upsert({ ...job, updated_at: new Date().toISOString() }, { onConflict: 'link' })
  if (error) throw error
}

function stripHtml(html?: string) {
  return String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

async function runGreenhouse(org: string, label?: string, tags?: string[], auto = true) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(org)}/jobs?content=true`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Greenhouse ${org} HTTP ${res.status}`)
  const data = await res.json()
  const jobs = Array.isArray((data as any).jobs) ? (data as any).jobs : []
  for (const j of jobs) {
    const link = j.absolute_url || ''
    if (!link) continue
    await upsertJob({
      title: j.title || 'Untitled',
      company: label || org,
      location: (j.location && j.location.name) || '',
      link,
      description: j.content ? stripHtml(j.content).slice(0, 2000) : '',
      source: 'greenhouse',
      tags,
      published_at: j.updated_at || new Date().toISOString(),
      visible: !!auto,
    })
  }
}

async function runLever(org: string, label?: string, tags?: string[], auto = true) {
  const url = `https://api.lever.co/v0/postings/${encodeURIComponent(org)}?mode=json`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Lever ${org} HTTP ${res.status}`)
  const jobs = await res.json()
  for (const j of jobs as any[]) {
    const link = j.hostedUrl || ''
    if (!link) continue
    await upsertJob({
      title: j.text || 'Untitled',
      company: label || org,
      location: j.categories?.location || '',
      link,
      description: (j.descriptionPlain || '').slice(0, 2000),
      source: 'lever',
      tags,
      published_at: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(),
      visible: !!auto,
    })
  }
}

async function runAdzuna(query: string, label?: string, tags?: string[], auto = true) {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) throw new Error('Missing Adzuna credentials')
  const endpoint = `https://api.adzuna.com/v1/api/jobs/us/search/1` // US; adjust as needed
  const url = `${endpoint}?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}&results_per_page=50&what=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Adzuna HTTP ${res.status}`)
  const data = await res.json()
  const jobs = Array.isArray((data as any).results) ? (data as any).results : []
  for (const j of jobs) {
    const link = j.redirect_url || j.apply_url || ''
    if (!link) continue
    await upsertJob({
      title: j.title || 'Untitled',
      company: j.company?.display_name || label || 'Adzuna',
      location: j.location?.display_name || '',
      link,
      description: (j.description || '').slice(0, 2000),
      source: 'adzuna',
      tags,
      published_at: j.created || new Date().toISOString(),
      visible: !!auto,
    })
  }
}

async function runJSearch(query: string, label?: string, tags?: string[], auto = true) {
  const rapidKey = process.env.RAPIDAPI_KEY
  const rapidHost = process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com'
  if (!rapidKey) throw new Error('Missing RapidAPI key')
  const url = `https://${rapidHost}/search?query=${encodeURIComponent(query)}&page=1&num_pages=1`
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': rapidKey,
      'X-RapidAPI-Host': rapidHost,
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0',
    },
  })
  if (!res.ok) throw new Error(`JSearch HTTP ${res.status}`)
  const data = await res.json()
  const jobs = Array.isArray((data as any).data) ? (data as any).data : []
  for (const j of jobs) {
    const link = j.job_apply_link || j.job_google_link || ''
    if (!link) continue
    const published = j.job_posted_at_datetime_utc || j.job_posted_at_timestamp || null
    // Build a concise snippet using highlights when available
    const hl = (j as any).job_highlights || {}
    const blocks: string[] = []
    for (const key of ['Qualifications','Responsibilities','Benefits']) {
      const arr = Array.isArray(hl[key]) ? hl[key] as string[] : []
      if (arr.length) blocks.push(arr.slice(0,3).join(' • '))
    }
    const snippet = blocks.join(' | ')
    const fallback = (j.job_description || '').replace(/\s+/g, ' ').trim()
    const description = (snippet || fallback).slice(0, 2000)
    await upsertJob({
      title: j.job_title || 'Untitled',
      company: j.employer_name || label || 'JSearch',
      location: j.job_city || j.job_location || '',
      link,
      description,
      source: 'jsearch',
      tags,
      published_at: published ? new Date(published).toISOString() : new Date().toISOString(),
      visible: !!auto,
    })
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const client = getServiceRoleClient()
    const { id } = (req.body || {}) as { id?: string }
    const q = client.from('job_sources').select('*').eq('active', true)
    const { data: sources, error } = id ? await q.eq('id', id) : await q
    if (error) throw error
    if (!sources || sources.length === 0) return res.status(200).json({ ok: true, processed: 0 })
    let processed = 0
    for (const s of sources as any[]) {
      const label = s.label || s.org
      const auto = s.auto_publish ?? true
      if (s.type === 'greenhouse') await runGreenhouse(s.org, label, s.tags, auto)
      else if (s.type === 'lever') await runLever(s.org, label, s.tags, auto)
      else if (s.type === 'adzuna') await runAdzuna(s.org, label, s.tags, auto)
      else if (s.type === 'jsearch') await runJSearch(s.org, label, s.tags, auto)
      processed++
    }
    return res.status(200).json({ ok: true, processed })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to run jobs ingestion', detail })
  }
}


