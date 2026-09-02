import { Container } from 'react-bootstrap'
import { site } from '../content/site.js'

export default function Footer() {
  return (
    <footer className="footer">
      <Container className="text-center">
        <p className="mb-0">{site.title} &middot; We can't wait to see you!</p>
      </Container>
    </footer>
  )
}
