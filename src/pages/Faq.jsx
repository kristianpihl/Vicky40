import { useEffect, useState } from 'react'
import ArticleTemplate from '../templates/ArticleTemplate.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { renderMarkdown } from '../lib/markdown.jsx'

// Practical info / frequently asked questions. Image on the left (like the front page).
// The entries are edited at /admin/faq (stored in Supabase).
// Save the side photo as public/images/faq.jpg (or change the path here).
const image = { src: '/images/faq.jpg', alt: 'Vickie as a baby' }

export default function Faq() {
  const [items, setItems] = useState(null) // null = loading
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('faq_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('Loading the practical info failed:', error)
          setError(true)
          return
        }
        setItems(data || [])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <ArticleTemplate title="Practical info" sideImage={image}>
      {items === null && <p>Loading …</p>}

      {error && (
        <p>
          The practical info couldn't be loaded right now. Please try again
          shortly.
        </p>
      )}

      {items !== null && !error && items.length === 0 && <p>Nothing here yet.</p>}

      {items !== null &&
        !error &&
        items.map((it) => (
          <section key={it.id}>
            <h2>{it.heading}</h2>
            {renderMarkdown(it.body)}
          </section>
        ))}
    </ArticleTemplate>
  )
}
