import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { buildFeed } from '../lib/updatesFeed.js'

const UpdatesContext = createContext({ items: [], loading: true })

// Loads "when did the programme / F&Q last change" once, merges it with the
// hand-written updates.js entries, and provides the combined feed to the
// front-page card, the subpage bells and the /updates page.
export function UpdatesProvider({ children }) {
  const [contentTimes, setContentTimes] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('content_last_updated').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('content_last_updated failed:', error)
        setContentTimes({}) // fall back to just the hand-written entries
        return
      }
      setContentTimes(Array.isArray(data) ? data[0] || {} : data || {})
    })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({ items: buildFeed(contentTimes), loading: contentTimes === null }),
    [contentTimes],
  )

  return (
    <UpdatesContext.Provider value={value}>{children}</UpdatesContext.Provider>
  )
}

export function useUpdates() {
  return useContext(UpdatesContext)
}
