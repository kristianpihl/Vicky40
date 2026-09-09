import { Navbar, Container } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { site } from '../content/site.js'

// Minimal top bar: the name on the left, an "Admin" link on the right.
// Sticky at the top. The name links back to the front page.
export default function Topbar() {
  return (
    <Navbar sticky="top" className="topbar">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="topbar-brand">
          {site.personName} <span className="topbar-brand-age">40</span>
        </Navbar.Brand>
        <NavLink to="/admin" className="topbar-admin">
          Admin
        </NavLink>
      </Container>
    </Navbar>
  )
}
