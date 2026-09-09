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

// Which day columns a submission covers.
// Cabin guests: present from their arrival day onward (they sleep over).
// Day guests: the events they ticked (Friday / Saturday).
function dayFlags(row) {
  if (row.sleeping_at_cabin === true) {
    const a = row.arrival_day
    return {
      thursday: a === 'Thursday',
      friday: a === 'Thursday' || a === 'Friday',
      saturday: a === 'Thursday' || a === 'Friday' || a === 'Saturday',
    }
  }
  if (row.sleeping_at_cabin === false) {
    const ev = Array.isArray(row.events) ? row.events : []
    return { thursday: false, friday: ev.includes('Friday'), saturday: ev.includes('Saturday') }
  }
  return { thursday: false, friday: false, saturday: false }
}

// One table row per person.
function toGuestRows(submissions) {
  const out = []
  for (const s of submissions) {
    const people = Array.isArray(s.people) ? s.people : []
    const registeredBy = people[0]?.name || '—'
    const flags = dayFlags(s)
    const cabin =
      s.sleeping_at_cabin === true
        ? 'Yes'
        : s.sleeping_at_cabin === false
          ? 'No'
          : '—'
    people.forEach((p, i) => {
      out.push({
        key: `${s.id}-${i}`,
        date: s.created_at,
        name: p.name || '—',
        cabin,
        ...flags,
        allergies: p.allergies || '',
        phone: p.phone || '',
        registeredBy,
        comment: s.comment || '',
      })
    })
  }
  return out
}

const Check = ({ on }) => (on ? <span className="admin-check">✓</span> : null)

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

  const guests = rows ? toGuestRows(rows) : []

  return (
    <Container className="page admin-page admin-page--wide">
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
            {guests.length} {guests.length === 1 ? 'person' : 'people'} in total
          </p>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Full name</th>
                  <th className="admin-th-center">Cabin</th>
                  <th className="admin-th-center">Thursday</th>
                  <th className="admin-th-center">Friday</th>
                  <th className="admin-th-center">Saturday</th>
                  <th>Allergies</th>
                  <th>Phone number</th>
                  <th>Registered by</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr key={g.key}>
                    <td className="admin-td-date">{formatDate(g.date)}</td>
                    <td className="admin-td-name">{g.name}</td>
                    <td className="admin-td-center">{g.cabin}</td>
                    <td className="admin-td-center">
                      <Check on={g.thursday} />
                    </td>
                    <td className="admin-td-center">
                      <Check on={g.friday} />
                    </td>
                    <td className="admin-td-center">
                      <Check on={g.saturday} />
                    </td>
                    <td>{g.allergies}</td>
                    <td className="admin-td-nowrap">{g.phone}</td>
                    <td className="admin-td-nowrap">{g.registeredBy}</td>
                    <td className="admin-td-comment">{g.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
