import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { supabase } from '../lib/supabaseClient.js'
import { site } from '../content/site.js'
import PageWithImage from '../components/PageWithImage.jsx'

// The fixed run of days. Dates are worked out from site.partyStart (a Saturday).
export const PROGRAM_DAYS = ['Thursday', 'Friday', 'Saturday', 'Sunday']

export function programDayDate(dayName) {
  const offset = PROGRAM_DAYS.indexOf(dayName) - 2 // Saturday = partyStart
  const d = new Date(site.partyStart)
  d.setDate(d.getDate() + offset)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}`
}

// Programme view: one section per day, with a timeline of events beneath.
// Content is the published rows of program_items in Supabase (edited at
// /admin/program). Pass `sideImage={{ src, alt }}` for a picture in a left
// column, like the front page.
export default function ProgramTemplate({ sideImage }) {
  const [items, setItems] = useState(null) // null = loading, [] = none, [...] = data
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('program_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('Loading the programme failed:', error)
          setError(true)
          return
        }
        setItems(data || [])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const byDay = {}
  for (const it of items || []) {
    ;(byDay[it.day] = byDay[it.day] || []).push(it)
  }

  const content = (
    <>
      <h1 className="program-title">Programme</h1>
      <p className="page-lead">
        Here's what's happening, when and where, day by day.
      </p>

      {items === null && <p className="program-empty">Loading …</p>}

      {error && (
        <p className="program-empty">
          The programme couldn't be loaded right now. Please try again shortly.
        </p>
      )}

      {items !== null &&
        !error &&
        PROGRAM_DAYS.map((day) => {
          const events = byDay[day] || []
          return (
            <section className="program-day" key={day}>
              <header className="program-day-header">
                <h2 className="program-day-name">{day}</h2>
                <span className="program-day-date">{programDayDate(day)}</span>
              </header>

              {events.length === 0 ? (
                <p className="program-empty">
                  The programme for this day is coming.
                </p>
              ) : (
                <div className="program-events">
                  {events.map((event) => (
                    <div className="program-event" key={event.id}>
                      <div className="program-time">{event.time}</div>
                      <div className="program-event-body">
                        <h3 className="program-event-title">{event.title}</h3>
                        {event.location && (
                          <p className="program-location">📍 {event.location}</p>
                        )}
                        {event.description && (
                          <p className="program-desc">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )
        })}
    </>
  )

  if (sideImage) {
    return <PageWithImage image={sideImage}>{content}</PageWithImage>
  }
  return <Container className="page program-page">{content}</Container>
}
