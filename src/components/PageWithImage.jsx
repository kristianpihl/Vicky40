import { Container, Row, Col } from 'react-bootstrap'

// Two-column layout like the front page: an image on the left and the page
// content on the right. On mobile the image moves above the content.
//
//   <PageWithImage image={{ src, alt }}>
//     <h1>...</h1>
//     ...page content...
//   </PageWithImage>
export default function PageWithImage({ image, children }) {
  return (
    <Container className="page side-image-layout">
      <Row className="g-4 g-lg-5 align-items-start">
        <Col lg={6} className="side-image-media">
          <img className="side-image" src={image.src} alt={image.alt} />
        </Col>
        <Col lg={6} className="side-image-body">
          {children}
        </Col>
      </Row>
    </Container>
  )
}
