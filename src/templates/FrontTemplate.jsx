import { Container, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Countdown from '../components/Countdown.jsx'
import SubpageButtons from '../components/SubpageButtons.jsx'
import LatestUpdate from '../components/LatestUpdate.jsx'

// Front-page template: two columns on desktop, stacked on mobile.
//   Left:   the large image.
//   Right:  heading (date is part of it now), intro text, countdown,
//           all the buttons, and the "latest update" feed at the bottom.
// The content itself (heading, image, text) is passed in as props.
export default function FrontTemplate({ heading, imageSrc, imageAlt, intro }) {
  return (
    <Container className="front page">
      <Row className="g-4 g-lg-5 align-items-start">
        {/* Left column: image only */}
        <Col lg={6} className="front-left">
          <img className="front-image" src={imageSrc} alt={imageAlt} />
        </Col>

        {/* Right column: heading, text, countdown, buttons, then the feed */}
        <Col lg={6} className="front-right">
          <h1 className="front-heading">{heading}</h1>

          <div className="front-intro">{intro}</div>

          <Countdown />

          {/* The two prominent actions, grouped together below the countdown. */}
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

          {/* "What's new" feed, at the very bottom of the column. */}
          <LatestUpdate />
        </Col>
      </Row>
    </Container>
  )
}
