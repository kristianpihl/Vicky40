import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { site } from '../content/site.js'
import { pageMeta } from '../content/pageMeta.js'

// Setter <title> og meta-beskrivelse ut fra hvilken side man er på.
// Titlene ligger i src/content/pageMeta.js.
export default function RouteMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const base = `${site.personName} 40 år`
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
