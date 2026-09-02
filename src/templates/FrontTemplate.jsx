import { Container, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Countdown from '../components/Countdown.jsx'
import SubpageButtons from '../components/SubpageButtons.jsx'

// Front-page template: two columns on desktop, stacked on mobile.
//   Left:   heading, then a large image.
//   Right:  text, countdown, RSVP button, and buttons to the other pages.
// The content itself (heading, image, text) is passed in as props from the page.
export default function FrontTemplate({ heading, imageSrc, imageAlt, intro }) {
  return (
    <Container className="front page">
      <Row className="g-4 g-lg-5 align-items-start">
        {/* Left column */}
        <Col lg={6} className="front-left">
          <h1 className="front-heading">{heading}</h1>
          <img className="front-image" src={imageSrc} alt={imageAlt} />
        </Col>

        {/* Right column */}
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
            RSVP
          </Button>

          <SubpageButtons />
        </Col>
      </Row>
    </Container>
  )
}
