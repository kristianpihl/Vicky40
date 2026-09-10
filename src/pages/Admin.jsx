import { useEffect, useState } from 'react'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAdminAuth, takeLogoutReason } from '../components/AdminAuthProvider.jsx'

export default function Admin() {
  const { isAuthed, login, logout } = useAdminAuth()

  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [status, setStatus] = useState('idle') // idle | checking | error
  const [notice, setNotice] = useState('')

  // Show the "you were signed out automatically" message once, if there is one.
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

  if (isAuthed) {
    return (
      <Container className="page admin-page">
        <h1>Admin</h1>
        <p className="page-lead">You're logged in.</p>
        <nav className="admin-links d-grid gap-2">
          <Button as={Link} to="/admin/rsvps" variant="primary" size="lg">
            RSVPs
          </Button>
          <Button as={Link} to="/admin/photos" variant="primary" size="lg">
            Uploaded photos
          </Button>
          <Button as={Link} to="/admin/program" variant="primary" size="lg">
            Edit programme
          </Button>
          <Button as={Link} to="/admin/faq" variant="primary" size="lg">
            Edit F&amp;Q
          </Button>
        </nav>
        <Button
          variant="link"
          className="admin-logout"
          onClick={() => logout()}
        >
          Log out
        </Button>
      </Container>
    )
  }

  return (
    <Container className="page admin-page admin-login-page">
      <h1>Admin</h1>
      <p className="page-lead">
        Enter your username and password to see RSVPs and photos.
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
