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


