import { useEffect, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { supabase } from '../lib/supabaseClient.js'
import { guestImageUrl } from '../lib/guestImage.js'

// "Get to know my guests" – a grid of guest cards (photo, name, short text),
// edited at /admin/guests.
export default function Guests() {
  const [people, setPeople] = useState(null) // null = loading
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('guests')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('Loading the guest list failed:', error)
          setError(true)
          return
        }
        setPeople(data || [])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Container className="page guests-page">
      <h1 className="guests-title">Get to know my guests</h1>
      <p className="page-lead">
        A little about the people you'll meet during the weekend.
      </p>

      {people === null && !error && (
        <p className="admin-status">Loading …</p>
      )}
      {error && (
        <p className="admin-status">
          This couldn't be loaded right now. Please try again shortly.
        </p>
      )}
      {people !== null && !error && people.length === 0 && (
        <p className="admin-status">Nothing here yet.</p>
      )}

      {people !== null && !error && people.length > 0 && (
        <Row className="g-4 mt-1">
          {people.map((p) => (
            <Col xs={12} sm={6} lg={4} key={p.id}>
              <article className="guest-card">
                <img
                  className="guest-image"
                  src={guestImageUrl(p.image_path) || '/images/gjest.svg'}
                  alt=""
                  loading="lazy"
                />
                <div className="guest-card-body">
                  <h2 className="guest-name">{p.name}</h2>
                  {p.blurb && <p className="guest-text">{p.blurb}</p>}
                </div>
              </article>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  )
}
