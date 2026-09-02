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
      if (!p.name.trim()) return 'Everyone needs a name.'
      if (p.days.length === 0) return 'Pick at least one day for each person.'
    }
    if (email && !email.includes('@')) {
      return 'Please check that the email address looks right.'
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
      console.error('RSVP submission failed:', error)
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
        <h2>Thanks for your RSVP! 🎉</h2>
        <p>We've got your answer. We can't wait to see you.</p>
        <Button variant="outline-primary" onClick={reset}>
          Submit another RSVP
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
                {index === 0 ? 'You' : `Person ${index + 1}`}
              </h2>
              {index > 0 && (
                <Button
                  variant="link"
                  className="rsvp-remove"
                  onClick={() => removePerson(index)}
                >
                  Remove
                </Button>
              )}
            </div>

            <Form.Group className="mb-3" controlId={`rsvp-name-${index}`}>
              <Form.Label>Full name</Form.Label>
              <Form.Control
                type="text"
                value={person.name}
                onChange={(e) => updatePerson(index, 'name', e.target.value)}
                placeholder="First Last"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Which days?</Form.Label>
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
              <Form.Label>Allergies or dietary needs (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={person.allergies}
                onChange={(e) =>
                  updatePerson(index, 'allergies', e.target.value)
                }
                placeholder="E.g. nut allergy, vegetarian, lactose intolerant"
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
        + Add a person
      </Button>

      <Row className="g-3 mt-2">
        <Col xs={12}>
          <Form.Group controlId="rsvp-email">
            <Form.Label>Email (optional)</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="so we can reach you with questions"
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group controlId="rsvp-comment">
            <Form.Label>Comment (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Anything we should know?"
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
          Something went wrong while submitting. Try again in a moment. If it
          keeps happening, check that the <code>rsvp</code> table has been
          created in Supabase (see <code>supabase/rsvp.sql</code>).
        </Alert>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="rsvp-submit mt-3 w-100"
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? 'Sending …' : 'Send RSVP'}
      </Button>
    </Form>
  )
}
