import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UpsertItem = {
  title: string
  link: string
  excerpt?: string
  source?: string
  thumbnail?: string | null
  published_at?: string | Date | null
  tags?: string[]
  curated_note?: string
  featured_rank?: number | null
  pick_rank?: number | null
  embed_html?: string | null
  caption?: string | null
}

// upsert item - avoid duplicates by link
export async function upsertItem(item: UpsertItem) {
  const { data, error } = await supabase
    .from('items')
    .upsert(
      {
        ...item,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'link' }
    )
    .select()
  if (error) {
    // eslint-disable-next-line no-console
    console.error('supabase upsert error', error)
    throw error
  }
  return data
}

export async function fetchVisibleItems(limit = 50) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('visible', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

// Homepage helpers
export async function fetchFeatured(limit = 5) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('visible', true)
    .not('featured_rank', 'is', null)
    .order('featured_rank', { ascending: true })
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function fetchPicks(limit = 6) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('visible', true)
    .not('pick_rank', 'is', null)
    .order('pick_rank', { ascending: true })
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function fetchRecentExcluding({ limit = 30, excludeIds = [] as string[] }) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('visible', true)
    .order('published_at', { ascending: false })
    .limit(limit * 2) // overfetch then filter client-side to respect exclusions
  if (error) throw error
  const exclude = new Set<string>(excludeIds)
  const filtered = (data || []).filter((d: any) => !exclude.has((d as any).id)).slice(0, limit)
  return filtered
}

export async function fetchByTagExcluding({ tag, limit = 12, excludeIds = [] as string[] }: { tag: string; limit?: number; excludeIds?: string[] }) {
  let query = supabase
    .from('items')
    .select('*') as any
  query = query.eq('visible', true).contains('tags', [tag]).order('published_at', { ascending: false }).limit(limit * 2)
  const { data, error } = await query
  if (error) throw error
  const exclude = new Set<string>(excludeIds)
  const filtered = (data || []).filter((d: any) => !exclude.has((d as any).id)).slice(0, limit)
  return filtered
}

// Filtered items by category (matches tags array)
export async function fetchVisibleItemsFiltered({ limit = 50, category }: { limit?: number; category?: string }) {
  let query = supabase
    .from('items')
    .select('*')
    .eq('visible', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (category && category.trim()) {
    // Supabase Postgres: use contains on array/jsonb tags
    query = query.contains('tags', [category]) as any
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// Server-only client (uses service role). Call ONLY on the server.
export function getServiceRoleClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(supabaseUrl, serviceKey)
}

export async function upsertItemServer(client: SupabaseClient, item: UpsertItem) {
  const { data, error } = await client
    .from('items')
    .upsert(
      {
        ...item,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'link' }
    )
    .select()
  if (error) {
    // eslint-disable-next-line no-console
    console.error('supabase upsert error (server)', error)
    throw error
  }
  return data
}

// Jobs helpers
export type UpsertJob = {
  title: string
  company?: string
  location?: string
  link: string
  description?: string
  source?: string
  tags?: string[]
  published_at?: string | Date | null
  visible?: boolean
}

export async function upsertJobServer(client: SupabaseClient, job: UpsertJob) {
  const { data, error } = await client
    .from('jobs')
    .upsert(
      {
        ...job,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'link' }
    )
    .select()
  if (error) {
    // eslint-disable-next-line no-console
    console.error('supabase job upsert error (server)', error)
    throw error
  }
  return data
}

export async function fetchVisibleJobs(limit = 50) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('visible', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}


