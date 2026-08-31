import { Container } from 'react-bootstrap'
import { program } from '../content/program.js'

// Programvisning: én seksjon per dag, med en tidslinje av hendelser under.
// Data hentes fra src/content/program.js (kan overstyres med en prop).
export default function ProgramTemplate({ days = program }) {
  return (
    <Container className="page program-page">
      <h1 className="program-title">Program</h1>
      <p className="page-lead">
        Her ser du hva som skjer når og hvor, dag for dag.
      </p>

      {days.map((day) => (
        <section className="program-day" key={day.day}>
          <header className="program-day-header">
            <h2 className="program-day-name">{day.day}</h2>
            <span className="program-day-date">{day.date}</span>
          </header>

          {day.events.length === 0 ? (
            <p className="program-empty">Program for denne dagen kommer.</p>
          ) : (
            <div className="program-events">
              {day.events.map((event, i) => (
                <div className="program-event" key={i}>
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
      ))}
    </Container>
  )
}
