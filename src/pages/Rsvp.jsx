import { Container } from 'react-bootstrap'
import RsvpForm from '../forms/RsvpForm.jsx'

export default function Rsvp() {
  return (
    <Container className="page rsvp-page">
      <h1>RSVP</h1>
      <p className="page-lead">
        Enter your name and which days you're joining. You can sign up several
        people in the same form.
      </p>
      <RsvpForm />
    </Container>
  )
}
