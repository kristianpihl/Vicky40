import { Navbar, Container } from 'react-bootstrap'
import { NavLink, useLocation } from 'react-router-dom'
import { site } from '../content/site.js'
import { useAdminAuth } from './AdminAuthProvider.jsx'

// Minimal top bar: the name on the left, an "Admin" link on the right.
// Sticky at the top. The name links back to the front page.
// Once signed in to the admin area the bar goes full width so the logo
// lines up with the flush-left sidebar; everywhere else it stays centred.
export default function Topbar() {
  const { pathname } = useLocation()
  const { isAuthed } = useAdminAuth()
  const inAdmin = pathname === '/admin' || pathname.startsWith('/admin/')
  const isAdmin = inAdmin && isAuthed

  return (
    <Navbar
      sticky="top"
      className={`topbar${isAdmin ? ' topbar--admin' : ''}`}
    >
      <Container fluid={isAdmin}>
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
