import { useEffect, useState } from 'react'
import { Container, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAdminAuth, RequireAdmin } from '../components/AdminAuthProvider.jsx'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function attendance(row) {
  if (row.sleeping_at_cabin === true) {
    return `Staying at the cabin · arrives ${row.arrival_day || '?'}`
  }
  if (row.sleeping_at_cabin === false) {
    const days = Array.isArray(row.events) ? row.events.join(', ') : ''
    return `Day guest${days ? ` · ${days}` : ''}`
  }
  return '—'
}

function AdminRsvpsInner() {
  const { password, logout } = useAdminAuth()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('admin_rsvps', { pass: password }).then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('admin_rsvps failed:', error)
        setError(true)
        return
      }
      setRows(data || [])
    })
    return () => {
      cancelled = true
    }
  }, [password])

  const totalPeople = (rows || []).reduce(
    (sum, r) => sum + (Array.isArray(r.people) ? r.people.length : 0),
    0,
  )

  return (
    <Container className="page admin-page">
      <div className="admin-header">
        <h1>RSVPs</h1>
        <Link to="/admin" className="admin-back">
          ← Admin
        </Link>
      </div>

      {error && (
        <Alert variant="danger">
          Could not load the RSVPs.{' '}
          <Button variant="link" className="p-0 align-baseline" onClick={logout}>
            Log in again
          </Button>
          .
        </Alert>
      )}

      {!error && rows === null && <p className="admin-status">Loading …</p>}

      {!error && rows !== null && rows.length === 0 && (
        <p className="admin-status">No RSVPs yet.</p>
      )}

      {!error && rows && rows.length > 0 && (
        <>
          <p className="page-lead">
            {rows.length} {rows.length === 1 ? 'submission' : 'submissions'} ·{' '}
            {totalPeople} {totalPeople === 1 ? 'person' : 'people'} in total
          </p>

          <div className="admin-list">
            {rows.map((row) => (
              <article className="admin-card" key={row.id}>
                <div className="admin-card-top">
                  <span className="admin-attendance">{attendance(row)}</span>
                  <span className="admin-date">{formatDate(row.created_at)}</span>
                </div>

                <ul className="admin-people">
                  {(row.people || []).map((p, i) => (
                    <li key={i}>
                      <strong>{p.name}</strong>
                      {p.phone ? ` · ${p.phone}` : ''}
                      {p.allergies ? (
                        <span className="admin-allergy">
                          {' '}
                          · allergies: {p.allergies}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>

                {row.contact_email && (
                  <p className="admin-meta">Email: {row.contact_email}</p>
                )}
                {row.comment && (
                  <p className="admin-meta">Comment: {row.comment}</p>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </Container>
  )
}

export default function AdminRsvps() {
  return (
    <RequireAdmin>
      <AdminRsvpsInner />
    </RequireAdmin>
  )
}
