import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceRoleClient } from '@/lib/db'
import { parseEmbedMeta } from '@/lib/extractOg'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const client = getServiceRoleClient()
    const { data, error } = await client
      .from('items')
      .select('id,title,source,embed_html,link')
      .neq('embed_html', null)
      .limit(1000)
    if (error) throw error
    const items = (data || []) as { id: string; title: string | null; source: string | null; embed_html: string | null; link: string }[]

    const updates: { id: string; title?: string | null; source?: string | null; link: string }[] = []
    for (const it of items) {
      const html = it.embed_html || ''
      if (!html) continue
      const meta = (typeof parseEmbedMeta === 'function') ? parseEmbedMeta(html) : (function(html: string){
        const siteName = html.includes('instagram-media') ? 'Instagram' : html.includes('fb-post') ? 'Facebook' : null
        const firstP = html.match(/<blockquote[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1] || null
        const textFromP = firstP ? firstP.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : null
        const blockInner = html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i)?.[1] || ''
        const textFromBlock = blockInner.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        let title = textFromP || textFromBlock || null
        if (title && title.length > 200) title = title.slice(0, 200) + '…'
        if (siteName === 'Instagram' && title && /^view (this|on) instagram/i.test(title)) title = null
        return { title, siteName }
      })(html)
      const newTitle = !it.title || it.title === 'Untitled' ? (meta.title || it.title) : it.title
      const newSource = !it.source || it.source.toLowerCase() === 'instagram.com' || it.source.toLowerCase() === 'facebook.com' ? (meta.siteName || it.source) : it.source
      if (newTitle !== it.title || newSource !== it.source) {
        updates.push({ id: it.id, title: newTitle, source: newSource, link: it.link })
      }
    }

    let updated = 0
    // Batch updates in chunks to avoid payload limits
    const chunkSize = 200
    for (let i = 0; i < updates.length; i += chunkSize) {
      const chunk = updates.slice(i, i + chunkSize)
      const { error: upErr } = await client.from('items').upsert(
        chunk.map((u) => ({ id: u.id, link: u.link, title: u.title, source: u.source, updated_at: new Date().toISOString() })),
        { onConflict: 'id' }
      )
      if (upErr) throw upErr
      updated += chunk.length
    }

    return res.status(200).json({ ok: true, scanned: items.length, updated })
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    return res.status(500).json({ error: 'Failed to backfill embed titles', detail })
  }
}


