import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { buildFeed } from '../lib/updatesFeed.js'
import { usePageContent } from './ContentProvider.jsx'

const UpdatesContext = createContext({ items: [], loading: true })

// Loads "when did the programme / F&Q / venue / ... last change", merges it
// with the hand-written updates.js entries, and provides the combined feed to
// the front-page card, the subpage bells and the /updates page.
export function UpdatesProvider({ children }) {
  const { get } = usePageContent()
  const osloUnlocked = get('oslo.unlocked') === 'true'
  const guestsUnlocked = get('guests.unlocked') === 'true'
  const [contentTimes, setContentTimes] = useState(null)
  // Mounted once for the whole app, so without this an admin who edits e.g.
  // the programme and then navigates (no full reload) to check the bell
  // would still see the pre-edit times. Re-fetching on every route change
  // keeps it current; the old value stays visible while the new one loads.
  const { pathname } = useLocation()

  useEffect(() => {
    let cancelled = false
    supabase.rpc('content_last_updated').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('content_last_updated failed:', error)
        setContentTimes((cur) => cur ?? {}) // fall back to just the hand-written entries
        return
      }
      setContentTimes(Array.isArray(data) ? data[0] || {} : data || {})
    })
    return () => {
      cancelled = true
    }
  }, [pathname])

  const value = useMemo(
    () => ({
      items: buildFeed(contentTimes, {
        '/oslo': osloUnlocked,
        '/guests': guestsUnlocked,
      }),
      loading: contentTimes === null,
    }),
    [contentTimes, osloUnlocked, guestsUnlocked],
  )

  return (
    <UpdatesContext.Provider value={value}>{children}</UpdatesContext.Provider>
  )
}

export function useUpdates() {
  return useContext(UpdatesContext)
}
