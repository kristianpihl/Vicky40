import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { site } from '../content/site.js'
import { pageMeta } from '../content/pageMeta.js'

// Sets <title> and the meta description based on which page you're on.
// The titles live in src/content/pageMeta.js.
export default function RouteMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const base = `${site.personName} 40`
    const meta = pageMeta[pathname] || {}

    document.title = meta.title ? `${meta.title} – ${base}` : base

    if (meta.description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', meta.description)
    }
  }, [pathname])

  return null
}
