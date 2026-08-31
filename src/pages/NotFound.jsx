import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

// Vises når ingen av rutene i routes.jsx passer adressen.
export default function NotFound() {
  return (
    <Container className="page text-center">
      <h1>Fant ikke siden</h1>
      <p className="page-lead mx-auto">Denne adressen finnes ikke.</p>
      <Link to="/">Tilbake til forsiden</Link>
    </Container>
  )
}
