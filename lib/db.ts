import { createClient } from '@supabase/supabase-js'

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


