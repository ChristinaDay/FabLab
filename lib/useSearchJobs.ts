import { useCallback, useEffect, useRef, useState } from 'react'

type Job = any

type CacheEntry = {
  timestamp: number
  data: Job[]
}

const CACHE_TTL_MS = 1000 * 60 * 60 // 1 hour
const cache = new Map<string, CacheEntry>()

function makeKey(query: string, location: string, strict: boolean, curatedOnly?: boolean): string {
  return `${query.trim()}|${location.trim()}|${strict ? '1' : '0'}|curated:${curatedOnly ? '1' : '0'}`
}

function getCached(key: string): Job[] | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCached(key: string, data: Job[]) {
  cache.set(key, { timestamp: Date.now(), data })
}

export function useSearchJobs(options?: { initialJobs?: Job[] }) {
  const [jobs, setJobs] = useState<Job[]>(options?.initialJobs || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lastKeyRef = useRef<string>('')
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const clearCache = useCallback(() => {
    cache.clear()
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  const fetchJobs = useCallback(async (query: string, location: string, strict: boolean, curatedOnly?: boolean) => {
    const key = makeKey(query, location, strict, curatedOnly)
    if (key === lastKeyRef.current) return
    lastKeyRef.current = key

    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setError(null)
      setLoading(true)

      // Cache first
      const cached = getCached(key)
      if (cached) {
        setJobs(cached)
        setLoading(false)
        return
      }

      const params = new URLSearchParams()
      if (query.trim()) params.set('query', query.trim())
      if (location.trim()) params.set('location', location.trim())
      if (strict) params.set('strict', '1')
      if (curatedOnly) params.set('curated_only', '1')

      const res = await fetch(`/api/jobs/search?${params.toString()}`, { signal: controller.signal })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.detail || json.error || 'Search failed')
      }

      const list: Job[] = (json.data || json.jobs || []) as Job[]
      setJobs(list)
      setCached(key, list)
    } catch (e: any) {
      if (e?.name === 'AbortError') return
      setError(e?.message || 'Search failed')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [])

  const searchJobs = useCallback((query: string, location: string, strict: boolean, opts?: { debounceMs?: number; curatedOnly?: boolean }) => {
    const delay = opts?.debounceMs ?? 250
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      fetchJobs(query, location, strict, opts?.curatedOnly)
    }, delay)
  }, [fetchJobs])

  return {
    jobs,
    loading,
    error,
    searchJobs,
    clearCache,
  }
}


