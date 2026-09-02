import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { site } from '../content/site.js'

// Top bar that stays in view when you scroll. Collapses to a "hamburger" menu
// on mobile. The links are controlled from src/content/site.js.
export default function Topbar() {
  return (
    <Navbar expand="lg" sticky="top" className="topbar">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="topbar-brand">
          {site.personName} <span className="topbar-brand-age">40</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-menu" />

        <Navbar.Collapse id="main-menu">
          <Nav className="me-auto">
            {site.navLinks.map((link) => (
              <Nav.Link key={link.to} as={NavLink} to={link.to}>
                {link.label}
              </Nav.Link>
            ))}
          </Nav>

          {/* This can become a dedicated "Upload photos" button later. */}
          <Button as={NavLink} to="/photos" variant="primary" className="topbar-cta">
            Upload photos
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
