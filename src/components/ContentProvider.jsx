import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'

// Editable single-blob page content (front-page heading/intro, venue body/facts).
// Rows live in the page_content table, edited at /admin/pages.
const ContentContext = createContext({
  get: (_key, fallback = '') => fallback,
  loading: true,
})

export function ContentProvider({ children }) {
  const [map, setMap] = useState(null)
  // This provider is mounted once for the whole app, so without this it would
  // only ever load page_content at the very first page load. An admin editing
  // the front page or venue text and then clicking through to see it (without
  // a full reload) would still see the old text. Re-fetching on every route
  // change keeps it in sync – cheap, and the old value stays on screen (no
  // flicker) while the new one loads in the background.
  const { pathname } = useLocation()

  useEffect(() => {
    let cancelled = false
    supabase
      .from('page_content')
      .select('key,value')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('page_content load failed:', error)
          setMap((cur) => cur ?? {}) // keep any data already loaded
          return
        }
        const m = {}
        for (const row of data || []) m[row.key] = row.value
        setMap(m)
      })
    return () => {
      cancelled = true
    }
  }, [pathname])

  const get = (key, fallback = '') =>
    map && map[key] != null && map[key] !== '' ? map[key] : fallback

  return (
    <ContentContext.Provider value={{ get, loading: map === null }}>
      {children}
    </ContentContext.Provider>
  )
}

export function usePageContent() {
  return useContext(ContentContext)
}
