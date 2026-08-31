import { useState } from 'react'
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap'
import { supabase } from '../lib/supabaseClient.js'
import { site } from '../content/site.js'

const emptyPerson = () => ({ name: '', days: [], allergies: '' })

export default function RsvpForm() {
  const [people, setPeople] = useState([emptyPerson()])
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const updatePerson = (index, field, value) =>
    setPeople((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    )

  const toggleDay = (index, day) =>
    setPeople((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p
        const has = p.days.includes(day)
        return {
          ...p,
          days: has ? p.days.filter((d) => d !== day) : [...p.days, day],
        }
      }),
    )

  const addPerson = () => setPeople((prev) => [...prev, emptyPerson()])
  const removePerson = (index) =>
    setPeople((prev) => prev.filter((_, i) => i !== index))

  function validate() {
    for (const p of people) {
      if (!p.name.trim()) return 'Alle personer må ha et navn.'
      if (p.days.length === 0) return 'Velg minst én dag for hver person.'
    }
    if (email && !email.includes('@')) {
      return 'Sjekk at e-postadressen ser riktig ut.'
    }
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const msg = validate()
    if (msg) {
      setErrorMsg(msg)
      return
    }
    setErrorMsg('')
    setStatus('submitting')

    const payload = {
      contact_email: email.trim() || null,
      comment: comment.trim() || null,
      people: people.map((p) => ({
        name: p.name.trim(),
        days: p.days,
        allergies: p.allergies.trim() || null,
      })),
    }

    const { error } = await supabase.from('rsvp').insert(payload)
    if (error) {
      console.error('RSVP-innsending feilet:', error)
      setStatus('error')
      return
    }
    setStatus('success')
  }

  function reset() {
    setPeople([emptyPerson()])
    setEmail('')
    setComment('')
    setStatus('idle')
    setErrorMsg('')
  }

  if (status === 'success') {
    return (
      <div className="rsvp-done">
        <h2>Takk for påmeldingen! 🎉</h2>
        <p>Vi har registrert svaret ditt. Vi gleder oss til å se deg.</p>
        <Button variant="outline-primary" onClick={reset}>
          Send en ny påmelding
        </Button>
      </div>
    )
  }

  return (
    <Form className="rsvp-form" onSubmit={handleSubmit} noValidate>
      {people.map((person, index) => (
        <Card className="rsvp-person" key={index}>
          <Card.Body>
            <div className="rsvp-person-header">
              <h2 className="rsvp-person-title">
                {index === 0 ? 'Deg selv' : `Person ${index + 1}`}
              </h2>
              {index > 0 && (
                <Button
                  variant="link"
                  className="rsvp-remove"
                  onClick={() => removePerson(index)}
                >
                  Fjern
                </Button>
              )}
            </div>

            <Form.Group className="mb-3" controlId={`rsvp-name-${index}`}>
              <Form.Label>Fullt navn</Form.Label>
              <Form.Control
                type="text"
                value={person.name}
                onChange={(e) => updatePerson(index, 'name', e.target.value)}
                placeholder="Fornavn Etternavn"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hvilke dager?</Form.Label>
              <div className="rsvp-days">
                {site.partyDays.map((day) => (
                  <Form.Check
                    inline
                    key={day}
                    type="checkbox"
                    id={`rsvp-day-${index}-${day}`}
                    label={day}
                    checked={person.days.includes(day)}
                    onChange={() => toggleDay(index, day)}
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group controlId={`rsvp-allergies-${index}`}>
              <Form.Label>Allergier eller hensyn (valgfritt)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={person.allergies}
                onChange={(e) =>
                  updatePerson(index, 'allergies', e.target.value)
                }
                placeholder="F.eks. nøtteallergi, vegetar, laktoseintolerant"
              />
            </Form.Group>
          </Card.Body>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline-primary"
        className="rsvp-add"
        onClick={addPerson}
      >
        + Legg til en person
      </Button>

      <Row className="g-3 mt-2">
        <Col xs={12}>
          <Form.Group controlId="rsvp-email">
            <Form.Label>E-post (valgfritt)</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="så vi kan nå deg ved spørsmål"
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group controlId="rsvp-comment">
            <Form.Label>Kommentar (valgfritt)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Noe vi bør vite?"
            />
          </Form.Group>
        </Col>
      </Row>

      {errorMsg && (
        <Alert variant="warning" className="mt-3">
          {errorMsg}
        </Alert>
      )}
      {status === 'error' && (
        <Alert variant="danger" className="mt-3">
          Noe gikk galt under innsendingen. Prøv igjen om litt. Hvis det
          fortsetter: sjekk at «rsvp»-tabellen er opprettet i Supabase (se
          <code> supabase/rsvp.sql</code>).
        </Alert>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="rsvp-submit mt-3 w-100"
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? 'Sender …' : 'Send påmelding'}
      </Button>
    </Form>
  )
}
