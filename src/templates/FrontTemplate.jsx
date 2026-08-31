import { Container, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Countdown from '../components/Countdown.jsx'
import SubpageButtons from '../components/SubpageButtons.jsx'

// Fremside-malen: to kolonner på desktop, stablet på mobil.
//   Venstre:  overskrift, deretter et stort bilde.
//   Høyre:    tekst, nedteller, RSVP-knapp, og knapper til undersidene.
// Selve innholdet (overskrift, bilde, tekst) sendes inn som props fra siden.
export default function FrontTemplate({ heading, imageSrc, imageAlt, intro }) {
  return (
    <Container className="front page">
      <Row className="g-4 g-lg-5 align-items-start">
        {/* Venstre kolonne */}
        <Col lg={6} className="front-left">
          <h1 className="front-heading">{heading}</h1>
          <img className="front-image" src={imageSrc} alt={imageAlt} />
        </Col>

        {/* Høyre kolonne */}
        <Col lg={6} className="front-right">
          <div className="front-intro">{intro}</div>

          <Countdown />

          <Button
            as={Link}
            to="/rsvp"
            variant="primary"
            size="lg"
            className="front-rsvp w-100"
          >
            Meld deg på (RSVP)
          </Button>

          <SubpageButtons />
        </Col>
      </Row>
    </Container>
  )
}
