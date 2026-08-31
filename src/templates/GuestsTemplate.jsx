import { Container, Row, Col } from 'react-bootstrap'
import { guests } from '../content/guests.js'

// Gjestevisning: et rutenett av kort – ett per gjest.
// 1 kort i bredden på mobil, 2 på nettbrett, 3 på desktop.
// Data hentes fra src/content/guests.js (kan overstyres med en prop).
export default function GuestsTemplate({ people = guests }) {
  return (
    <Container className="page guests-page">
      <h1 className="guests-title">Litt om alle gjestene</h1>
      <p className="page-lead">
        Bli litt kjent med hvem du møter i løpet av helgen.
      </p>

      <Row className="g-4 mt-1">
        {people.map((person, i) => (
          <Col xs={12} sm={6} lg={4} key={i}>
            <article className="guest-card">
              <img
                className="guest-image"
                src={person.image?.src || '/images/gjest.svg'}
                alt={person.image?.alt || `Bilde av ${person.name}`}
              />
              <div className="guest-card-body">
                <h2 className="guest-name">{person.name}</h2>
                {person.relation && (
                  <p className="guest-relation">{person.relation}</p>
                )}
                {person.text && <p className="guest-text">{person.text}</p>}
              </div>
            </article>
          </Col>
        ))}
      </Row>
    </Container>
  )
}
