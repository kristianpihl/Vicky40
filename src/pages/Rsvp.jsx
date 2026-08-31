import { Container } from 'react-bootstrap'
import RsvpForm from '../forms/RsvpForm.jsx'

export default function Rsvp() {
  return (
    <Container className="page rsvp-page">
      <h1>Meld deg på</h1>
      <p className="page-lead">
        Fyll inn navn og hvilke dager du blir med. Du kan melde på flere
        personer i samme skjema.
      </p>
      <RsvpForm />
    </Container>
  )
}
