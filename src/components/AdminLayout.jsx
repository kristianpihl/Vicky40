import { useEffect, useState } from 'react'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { NavLink, Outlet } from 'react-router-dom'
import { useAdminAuth, takeLogoutReason } from './AdminAuthProvider.jsx'

const svg = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const Icon = {
  rsvps: (
    <svg {...svg}>
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  ),
  front: (
    <svg {...svg}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </svg>
  ),
  program: (
    <svg {...svg}>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
      <path d="M8 2.5v4M16 2.5v4M3 10h18" />
    </svg>
  ),
  venue: (
    <svg {...svg}>
      <path d="M20 10c0 5.5-8 11-8 11s-8-5.5-8-11a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  faq: (
    <svg {...svg}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9.2 9a2.8 2.8 0 0 1 5.4 1c0 1.9-2.8 2.5-2.8 2.5" />
      <path d="M12 16.5h.01" />
    </svg>
  ),
  oslo: (
    <svg {...svg}>
      <path d="M12 6.5S9.5 4.5 3 4.5V18c6.5 0 9 2 9 2s2.5-2 9-2V4.5c-6.5 0-9 2-9 2Z" />
      <path d="M12 6.5V22" />
    </svg>
  ),
  guests: (
    <svg {...svg}>
      <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" />
      <circle cx="10" cy="8" r="3.5" />
      <path d="M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4" />
      <path d="M15 4.6a3.5 3.5 0 0 1 0 6.8" />
    </svg>
  ),
  photos: (
    <svg {...svg}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.8" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  ),
  logout: (
    <svg {...svg}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
}

// Left-hand menu for the admin area. Order chosen by the birthday person.
const NAV = [
  { to: '/admin/rsvps', label: 'RSVPs', icon: Icon.rsvps },
  { to: '/admin/front', label: 'Front page', icon: Icon.front },
  { to: '/admin/program', label: 'Programme', icon: Icon.program },
  { to: '/admin/venue', label: 'Venue', icon: Icon.venue },
  { to: '/admin/faq', label: 'F&Q', icon: Icon.faq },
  { to: '/admin/oslo', label: "Vickie's Oslo", icon: Icon.oslo },
  { to: '/admin/guests', label: 'Guest list', icon: Icon.guests },
  { to: '/admin/photos', label: 'Photos', icon: Icon.photos },
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
        <div className="admin-nav__brand">
          <span className="admin-nav__mark">40</span>
          <span className="admin-nav__brandname">Vickie 40</span>
        </div>
        <ul className="admin-nav__list">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                className={({ isActive }) =>
                  `admin-nav__link${isActive ? ' is-active' : ''}`
                }
              >
                <span className="admin-nav__icon">{n.icon}</span>
                <span>{n.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="admin-nav__logout"
          onClick={() => logout()}
        >
          <span className="admin-nav__icon">{Icon.logout}</span>
          <span>Log out</span>
        </button>
      </nav>

      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}
