import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

// Editable single-blob page content (front-page heading/intro, venue body/facts).
// Rows live in the page_content table, edited at /admin/pages.
const ContentContext = createContext({
  get: (_key, fallback = '') => fallback,
  loading: true,
})

export function ContentProvider({ children }) {
  const [map, setMap] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('page_content')
      .select('key,value')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('page_content load failed:', error)
          setMap({}) // fall back to the built-in text
          return
        }
        const m = {}
        for (const row of data || []) m[row.key] = row.value
        setMap(m)
      })
    return () => {
      cancelled = true
    }
  }, [])

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
