import { useEffect, useState } from 'react'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { NavLink, Outlet } from 'react-router-dom'
import { useAdminAuth, takeLogoutReason } from './AdminAuthProvider.jsx'

// Left-hand menu for the admin area. Order chosen by the birthday person.
const NAV = [
  { to: '/admin/rsvps', label: 'RSVPs' },
  { to: '/admin/front', label: 'Front page' },
  { to: '/admin/program', label: 'Programme' },
  { to: '/admin/venue', label: 'Venue' },
  { to: '/admin/faq', label: 'F&Q' },
  { to: '/admin/oslo', label: "Vickie's Oslo" },
  { to: '/admin/guests', label: 'Guest list' },
  { to: '/admin/photos', label: 'Photos' },
]

function AdminLogin() {
  const { login } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [status, setStatus] = useState('idle') // idle | checking | error
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const r = takeLogoutReason()
    if (r) setNotice(r)
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('checking')
    const ok = await login(email.trim(), pass.trim())
    if (!ok) {
      setStatus('error')
      return
    }
    setStatus('idle')
    setNotice('')
    setEmail('')
    setPass('')
  }

  return (
    <Container className="page admin-page admin-login-page">
      <h1>Admin</h1>
      <p className="page-lead">
        Enter your username and password to see RSVPs and edit the site.
      </p>

      {notice && <Alert variant="info">{notice}</Alert>}

      <Form onSubmit={handleSubmit} className="admin-login-form">
        <Form.Group className="mb-3" controlId="admin-email">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="username"
            autoFocus
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="admin-pass">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Form.Group>

        {status === 'error' && (
          <Alert variant="warning">
            Wrong username or password. Try again.
          </Alert>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-100"
          disabled={status === 'checking'}
        >
          {status === 'checking' ? 'Checking …' : 'Log in'}
        </Button>
      </Form>
    </Container>
  )
}

export default function AdminLayout() {
  const { isAuthed, logout } = useAdminAuth()

  if (!isAuthed) return <AdminLogin />

  return (
    <div className="admin-shell">
      <nav className="admin-nav" aria-label="Admin sections">
        <span className="admin-nav__title">Admin</span>
        <ul className="admin-nav__list">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                className={({ isActive }) =>
                  `admin-nav__link${isActive ? ' is-active' : ''}`
                }
              >
                {n.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="admin-nav__logout"
          onClick={() => logout()}
        >
          Log out
        </button>
      </nav>

      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}
