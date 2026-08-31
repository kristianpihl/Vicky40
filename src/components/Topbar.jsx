import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { site } from '../content/site.js'

// Toppbar som følger med når man scroller. Kollapser til en «hamburger»-meny
// på mobil. Lenkene styres fra src/content/site.js.
export default function Topbar() {
  return (
    <Navbar expand="lg" sticky="top" className="topbar">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="topbar-brand">
          {site.personName} <span className="topbar-brand-age">40</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="hovedmeny" />

        <Navbar.Collapse id="hovedmeny">
          <Nav className="me-auto">
            {site.navLinks.map((link) => (
              <Nav.Link key={link.to} as={NavLink} to={link.to}>
                {link.label}
              </Nav.Link>
            ))}
          </Nav>

          {/* Her kan «Last opp bilder» bli en egen knapp senere. */}
          <Button as={NavLink} to="/bilder" variant="primary" className="topbar-cta">
            Last opp bilder
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
