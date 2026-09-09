import { Navbar, Container } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { site } from '../content/site.js'

// Minimal top bar: just the name, sticky at the top. No menu.
// All navigation lives on the front page (the name links back there).
export default function Topbar() {
  return (
    <Navbar sticky="top" className="topbar">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="topbar-brand">
          {site.personName} <span className="topbar-brand-age">40</span>
        </Navbar.Brand>
      </Container>
    </Navbar>
  )
}
