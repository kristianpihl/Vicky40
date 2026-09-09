import { useState } from 'react'
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap'
import { supabase } from '../lib/supabaseClient.js'
import { site } from '../content/site.js'

const emptyPerson = () => ({ name: '', phone: '', allergies: '' })

export default function RsvpForm() {
  const [people, setPeople] = useState([emptyPerson()])
  const [sleeping, setSleeping] = useState('') // '' | 'yes' | 'no'
  const [arrivalDay, setArrivalDay] = useState('') // one of site.arrivalDays
  const [events, setEvents] = useState([]) // subset of site.eventDays
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const updatePerson = (index, field, value) =>
    setPeople((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    )

  const addPerson = () => setPeople((prev) => [...prev, emptyPerson()])
  const removePerson = (index) =>
    setPeople((prev) => prev.filter((_, i) => i !== index))

  // Switching the "sleeping at the cabin?" answer clears the other branch.
  function chooseSleeping(value) {
    setSleeping(value)
    if (value === 'yes') setEvents([])
    if (value === 'no') setArrivalDay('')
  }

  const toggleEvent = (day) =>
    setEvents((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )

  function validate() {
    if (cancelling) {
      if (!people[0].name.trim()) return 'Please enter your name.'
      if (!email.trim()) return 'Please enter your email.'
      if (!email.includes('@')) {
        return 'Please check that the email address looks right.'
      }
      return ''
    }

    for (const p of people) {
      if (!p.name.trim()) return 'Everyone needs a name.'
      if (!p.phone.trim()) return 'Everyone needs a phone number.'
    }
    if (sleeping !== 'yes' && sleeping !== 'no') {
      return 'Please answer whether you are sleeping at the cabin.'
    }
    if (sleeping === 'yes' && !arrivalDay) {
      return 'Please choose when you are arriving.'
    }
    if (sleeping === 'no' && events.length === 0) {
      return 'Please choose at least one event.'
    }
    if (!email.trim()) {
      return 'Please enter your email.'
    }
    if (!email.includes('@')) {
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

    const payload = cancelling
      ? {
          contact_email: email.trim(),
          comment: comment.trim() || null,
          cancelled: true,
          sleeping_at_cabin: null,
          arrival_day: null,
          events: null,
          people: [
            { name: people[0].name.trim(), phone: null, allergies: null },
          ],
        }
      : {
          contact_email: email.trim(),
          comment: comment.trim() || null,
          cancelled: false,
          sleeping_at_cabin: sleeping === 'yes',
          arrival_day: sleeping === 'yes' ? arrivalDay : null,
          events: sleeping === 'no' ? events : null,
          people: people.map((p) => ({
            name: p.name.trim(),
            phone: p.phone.trim(),
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
    setSleeping('')
    setArrivalDay('')
    setEvents([])
    setEmail('')
    setComment('')
    setCancelling(false)
    setStatus('idle')
    setErrorMsg('')
  }

  if (status === 'success') {
    return (
      <div className="rsvp-done">
        {cancelling ? (
          <>
            <h2>Your RSVP has been cancelled</h2>
            <p>Sorry you can't make it – we've noted it.</p>
          </>
        ) : (
          <>
            <h2>Thanks for your RSVP! 🎉</h2>
            <p>We've got your answer. We can't wait to see you.</p>
          </>
        )}
        <Button variant="outline-primary" onClick={reset}>
          Back to the form
        </Button>
      </div>
    )
  }

  return (
    <Form className="rsvp-form" onSubmit={handleSubmit} noValidate>
      <Form.Check
        type="checkbox"
        id="rsvp-cancel"
        className="rsvp-cancel-toggle"
        label="We can no longer come – cancel our RSVP"
        checked={cancelling}
        onChange={(e) => {
          setCancelling(e.target.checked)
          setErrorMsg('')
        }}
      />

      {cancelling ? (
        <div className="rsvp-cancel-fields">
          <Form.Group className="mb-3" controlId="rsvp-cancel-name">
            <Form.Label>Full name</Form.Label>
            <Form.Control
              type="text"
              value={people[0].name}
              onChange={(e) => updatePerson(0, 'name', e.target.value)}
              placeholder="First Last"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="rsvp-cancel-email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="the email you used when you signed up"
            />
          </Form.Group>

          <Form.Group controlId="rsvp-cancel-reason">
            <Form.Label>Reason (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Form.Group>
        </div>
      ) : (
        <>
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
                  <Form.Label>Write in your full name</Form.Label>
                  <Form.Control
                    type="text"
                    value={person.name}
                    onChange={(e) => updatePerson(index, 'name', e.target.value)}
                    placeholder="First Last"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId={`rsvp-phone-${index}`}>
                  <Form.Label>Phone number</Form.Label>
                  <Form.Control
                    type="tel"
                    value={person.phone}
                    onChange={(e) => updatePerson(index, 'phone', e.target.value)}
                    placeholder="+47 900 00 000"
                    required
                  />
                </Form.Group>

                <Form.Group controlId={`rsvp-allergies-${index}`}>
                  <Form.Label>Do you have any allergies?</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={person.allergies}
                    onChange={(e) =>
                      updatePerson(index, 'allergies', e.target.value)
                    }
                    placeholder="E.g. nut allergy, vegetarian, lactose intolerant – leave blank if none"
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

          <div className="rsvp-section">
            <Form.Group className="mb-3">
              <Form.Label>Are you sleeping at the cabin?</Form.Label>
              <div className="rsvp-days">
                <Form.Check
                  inline
                  type="radio"
                  name="sleeping"
                  id="rsvp-sleeping-yes"
                  label="Yes"
                  checked={sleeping === 'yes'}
                  onChange={() => chooseSleeping('yes')}
                />
                <Form.Check
                  inline
                  type="radio"
                  name="sleeping"
                  id="rsvp-sleeping-no"
                  label="No"
                  checked={sleeping === 'no'}
                  onChange={() => chooseSleeping('no')}
                />
              </div>
            </Form.Group>

            {sleeping === 'yes' && (
              <Form.Group className="mb-3">
                <Form.Label>When are you arriving?</Form.Label>
                <div className="rsvp-days">
                  {site.arrivalDays.map((day) => (
                    <Form.Check
                      inline
                      key={day}
                      type="radio"
                      name="arrivalDay"
                      id={`rsvp-arrival-${day}`}
                      label={day}
                      checked={arrivalDay === day}
                      onChange={() => setArrivalDay(day)}
                    />
                  ))}
                </div>
              </Form.Group>
            )}

            {sleeping === 'no' && (
              <Form.Group className="mb-3">
                <Form.Label>Which events are you joining?</Form.Label>
                <div className="rsvp-days">
                  {site.eventDays.map((day) => (
                    <Form.Check
                      inline
                      key={day}
                      type="checkbox"
                      id={`rsvp-event-${day}`}
                      label={day}
                      checked={events.includes(day)}
                      onChange={() => toggleEvent(day)}
                    />
                  ))}
                </div>
              </Form.Group>
            )}
          </div>

          <Row className="g-3 mt-2">
            <Col xs={12}>
              <Form.Group controlId="rsvp-email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="so we can reach you with questions"
                  required
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
        </>
      )}

      {errorMsg && (
        <Alert variant="warning" className="mt-3">
          {errorMsg}
        </Alert>
      )}
      {status === 'error' && (
        <Alert variant="danger" className="mt-3">
          Something went wrong while submitting. Try again in a moment. If it
          keeps happening, check that the <code>rsvp</code> table in Supabase has
          the latest columns (run <code>supabase/rsvp.sql</code> again).
        </Alert>
      )}

      <Button
        type="submit"
        variant={cancelling ? 'outline-danger' : 'primary'}
        size="lg"
        className="rsvp-submit mt-3 w-100"
        disabled={status === 'submitting'}
      >
        {status === 'submitting'
          ? 'Sending …'
          : cancelling
            ? 'Confirm cancellation'
            : 'Send RSVP'}
      </Button>
    </Form>
  )
}
