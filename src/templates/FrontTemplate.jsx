import { Container, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Countdown from '../components/Countdown.jsx'
import SubpageButtons from '../components/SubpageButtons.jsx'
import LatestUpdate from '../components/LatestUpdate.jsx'

// Front-page template: two columns on desktop, stacked on mobile.
//   Left:   heading, then a large image.
//   Right:  text, countdown, the two main buttons (RSVP + Upload photos),
//           then buttons to the other pages.
//   Below both columns: the dates.
// The content itself (heading, image, text, dates) is passed in as props.
export default function FrontTemplate({
  heading,
  imageSrc,
  imageAlt,
  intro,
  dates,
}) {
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

          <LatestUpdate />

          <Countdown />

          {/* The two prominent actions, grouped together right below the countdown. */}
          <div className="front-cta d-grid gap-2">
            <Button
              as={Link}
              to="/rsvp"
              variant="primary"
              size="lg"
              className="front-rsvp"
            >
              RSVP
            </Button>
            <Button
              as={Link}
              to="/photos"
              variant="accent"
              size="lg"
              className="front-upload"
            >
              Upload photos
            </Button>
          </div>

          <SubpageButtons />
        </Col>
      </Row>

      {dates && <p className="front-dates">{dates}</p>}
    </Container>
  )
}
