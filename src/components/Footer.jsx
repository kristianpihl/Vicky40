import { Container } from 'react-bootstrap'
import { site } from '../content/site.js'

export default function Footer() {
  return (
    <footer className="footer">
      <Container className="text-center">
        <p className="mb-0">
          {site.title} &middot; Vi gleder oss til å se deg!
        </p>
      </Container>
    </footer>
  )
}
