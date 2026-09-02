import { Container, Row, Col } from 'react-bootstrap'
import { guests } from '../content/guests.js'

// Guest view: a grid of cards – one per guest.
// 1 card wide on mobile, 2 on tablet, 3 on desktop.
// Data comes from src/content/guests.js (can be overridden with a prop).
export default function GuestsTemplate({ people = guests }) {
  return (
    <Container className="page guests-page">
      <h1 className="guests-title">About the guests</h1>
      <p className="page-lead">
        Get to know who you'll meet during the weekend.
      </p>

      <Row className="g-4 mt-1">
        {people.map((person, i) => (
          <Col xs={12} sm={6} lg={4} key={i}>
            <article className="guest-card">
              <img
                className="guest-image"
                src={person.image?.src || '/images/gjest.svg'}
                alt={person.image?.alt || `Photo of ${person.name}`}
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
