import { useState } from 'react'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAdminAuth } from '../components/AdminAuthProvider.jsx'

export default function Admin() {
  const { isAuthed, login, logout } = useAdminAuth()

  const [pass, setPass] = useState('')
  const [status, setStatus] = useState('idle') // idle | checking | error

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('checking')
    const ok = await login(pass.trim())
    if (!ok) {
      setStatus('error')
      return
    }
    setStatus('idle')
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
        </nav>
        <Button
          variant="link"
          className="admin-logout"
          onClick={logout}
        >
          Log out
        </Button>
      </Container>
    )
  }

  return (
    <Container className="page admin-page admin-login-page">
      <h1>Admin</h1>
      <p className="page-lead">Enter the password to see RSVPs and photos.</p>

      <Form onSubmit={handleSubmit} className="admin-login-form">
        <Form.Group className="mb-3" controlId="admin-pass">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoFocus
            required
          />
        </Form.Group>

        {status === 'error' && (
          <Alert variant="warning">Wrong password. Try again.</Alert>
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
