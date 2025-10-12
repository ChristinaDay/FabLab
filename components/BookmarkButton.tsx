import React from 'react'
import { supabase } from '@/lib/db'

export default function BookmarkButton({ itemId }: { itemId: string }) {
  const [bookmarked, setBookmarked] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(false)

  React.useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user?.id
      if (!uid) return
      const res = await fetch(`/api/user/bookmarks-status?user_id=${uid}&item_id=${itemId}`)
      const json = await res.json()
      if (res.ok) setBookmarked(!!json.bookmarked)
    })()
  }, [itemId])

  async function toggle() {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user?.id
      if (!uid) return
      const res = await fetch('/api/user/bookmarks-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
        body: JSON.stringify({ user_id: uid, item_id: itemId })
      })
      const json = await res.json()
      if (res.ok) setBookmarked(!!json.bookmarked)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={bookmarked ? 'Remove bookmark' : 'Save for later'}
      title={bookmarked ? 'Remove bookmark' : 'Save for later'}
      className={`h-8 w-8 grid place-items-center rounded hover:opacity-80 
        ${bookmarked ? 'text-black dark:text-white' : 'text-black dark:text-white/85'}`}
    >
      {bookmarked ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M6 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v18l-6-3-6 3V3z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M7 2h10a1 1 0 0 1 1 1v17l-6-3-6 3V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}


