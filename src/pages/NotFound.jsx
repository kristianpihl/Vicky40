import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

// Shown when none of the routes in routes.jsx match the address.
export default function NotFound() {
  return (
    <Container className="page text-center">
      <h1>Page not found</h1>
      <p className="page-lead mx-auto">This address doesn't exist.</p>
      <Link to="/">Back to the front page</Link>
    </Container>
  )
}
