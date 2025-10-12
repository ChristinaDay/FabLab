import React from 'react'
import { supabase } from '@/lib/db'

export default function LikeButton({ itemId }: { itemId: string }) {
  const [liked, setLiked] = React.useState(false)
  const [count, setCount] = React.useState(0)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user?.id
      if (!uid) return
      const res = await fetch(`/api/user/likes-status?user_id=${uid}&item_id=${itemId}`)
      const json = await res.json()
      if (res.ok) { setLiked(!!json.liked); setCount(json.count || 0) }
    })()
  }, [itemId])

  async function toggle() {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user?.id
      if (!uid) return
      const res = await fetch('/api/user/likes-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
        body: JSON.stringify({ user_id: uid, item_id: itemId })
      })
      const json = await res.json()
      if (res.ok) { setLiked(!!json.liked); setCount(json.count || 0) }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={liked ? 'Unlike' : 'Like'}
      className={`inline-flex items-center gap-1 text-xs h-8 px-1 hover:opacity-80 
        ${liked ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white/85'}`}
    >
      {liked ? (
        // Filled, rounder heart
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6.01 4.01 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.59 4.81 14.26 4 16 4 18.49 4 20.5 6.01 20.5 8.5c0 3.78-3.4 6.86-8.05 11.54L12 21.35z"/>
        </svg>
      ) : (
        // Outline, rounder heart
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M16 4c-1.74 0-3.41.81-4.5 2.09C10.41 4.81 8.74 4 7 4 4.51 4 2.5 6.01 2.5 8.5c0 3.78 3.4 6.86 8.05 11.54l1.45 1.31 1.45-1.31C18.1 15.36 21.5 12.28 21.5 8.5 21.5 6.01 19.49 4 17 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {count > 0 ? <span className="tabular-nums">{count}</span> : null}
    </button>
  )
}


