import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { articleImageUrl } from '../lib/articleImage.js'

// "Vickie's Oslo" – a listing of admin-written articles (edited at /admin/oslo).
export default function Oslo() {
  const [items, setItems] = useState(null) // null = loading
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('articles')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error("Loading Vickie's Oslo failed:", error)
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
    <Container className="page oslo-page">
      <h1 className="list-title">Vickie's Oslo</h1>
      <p className="page-lead">
        A few of my favourite places and stories from the city.
      </p>

      {items === null && !error && (
        <p className="admin-status">Loading …</p>
      )}
      {error && (
        <p className="admin-status">
          This couldn't be loaded right now. Please try again shortly.
        </p>
      )}
      {items !== null && !error && items.length === 0 && (
        <p className="admin-status">Nothing here yet.</p>
      )}

      {items !== null && !error && items.length > 0 && (
        <div className="oslo-list">
          {items.map((a) => {
            const src = articleImageUrl(a.image_path)
            return (
              <Link className="oslo-card" to={`/oslo/${a.id}`} key={a.id}>
                {src && (
                  <img
                    className="oslo-card__img"
                    src={src}
                    alt=""
                    loading="lazy"
                  />
                )}
                <div className="oslo-card__body">
                  <h2 className="oslo-card__title">{a.title}</h2>
                  {a.excerpt && (
                    <p className="oslo-card__excerpt">{a.excerpt}</p>
                  )}
                  <span className="oslo-card__more">Read more →</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </Container>
  )
}
