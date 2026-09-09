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

// If the same email sends the form more than once, the newest submission is the
// valid one ("current"); the earlier ones are kept as history ("superseded").
// Submissions without an email can't be matched, so each stands on its own.
function splitByEmail(submissions) {
  const groups = new Map()
  for (const s of submissions) {
    const email = (s.contact_email || '').trim().toLowerCase()
    const key = email || `__id__${s.id}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(s)
  }

  const byDateDesc = (a, b) => new Date(b.created_at) - new Date(a.created_at)
  const active = []
  const cancelled = []
  const superseded = []
  for (const list of groups.values()) {
    list.sort(byDateDesc)
    const [newest, ...older] = list
    if (newest.cancelled === true) cancelled.push(newest)
    else active.push(newest)
    superseded.push(...older)
  }
  active.sort(byDateDesc)
  cancelled.sort(byDateDesc)
  superseded.sort(byDateDesc)
  return { active, cancelled, superseded }
}

// One table row per person.
function toGuestRows(submissions) {
  const out = []
  for (const s of submissions) {
    const people = Array.isArray(s.people) ? s.people : []
    const registeredBy = people[0]?.name || '—'
    const registeredByEmail = s.contact_email || ''
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
        sleepsAtCabin: s.sleeping_at_cabin,
        ...flags,
        allergies: p.allergies || '',
        phone: p.phone || '',
        registeredBy,
        registeredByEmail,
        comment: s.comment || '',
      })
    })
  }
  return out
}

// Green filled dot when they're coming that day, red when they're not.
const Dot = ({ on }) => (
  <span
    role="img"
    aria-label={on ? 'Coming' : 'Not coming'}
    className={`admin-dot ${on ? 'admin-dot--yes' : 'admin-dot--no'}`}
  />
)

// "Active" = the current answer. "Cancelled" = the guest called it off.
// "Replaced" = an older answer that a newer submission from the same email replaced.
const StatusPill = ({ status }) => {
  if (status === 'cancelled') {
    return <span className="admin-pill admin-pill--cancelled">Cancelled</span>
  }
  if (status === 'replaced') {
    return <span className="admin-pill admin-pill--replaced">Replaced</span>
  }
  return <span className="admin-pill admin-pill--active">Active</span>
}

// Guest count per day, split by cabin / not cabin.
function daySummary(guests) {
  const days = [
    ['Thursday', 'thursday'],
    ['Friday', 'friday'],
    ['Saturday', 'saturday'],
  ]
  return days.map(([label, key]) => {
    const present = guests.filter((g) => g[key])
    const cabin = present.filter((g) => g.sleepsAtCabin === true).length
    const nonCabin = present.filter((g) => g.sleepsAtCabin === false).length
    return { label, cabin, nonCabin, total: cabin + nonCabin }
  })
}

function GuestTable({ rows, muted, status }) {
  return (
    <div className={`admin-table-wrap${muted ? ' admin-table-wrap--muted' : ''}`}>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Full name</th>
            <th className="admin-th-center">Cabin</th>
            <th className="admin-th-center">Thu</th>
            <th className="admin-th-center">Fri</th>
            <th className="admin-th-center">Sat</th>
            <th>Allergies</th>
            <th>Phone number</th>
            <th>Registered by name</th>
            <th>Registered by e-mail</th>
            <th>Comments</th>
            <th className="admin-th-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((g) => (
            <tr key={g.key}>
              <td className="admin-td-date">{formatDate(g.date)}</td>
              <td className="admin-td-name">{g.name}</td>
              <td className="admin-td-center">{g.cabin}</td>
              <td className="admin-td-center">
                {status === 'cancelled' ? '—' : <Dot on={g.thursday} />}
              </td>
              <td className="admin-td-center">
                {status === 'cancelled' ? '—' : <Dot on={g.friday} />}
              </td>
              <td className="admin-td-center">
                {status === 'cancelled' ? '—' : <Dot on={g.saturday} />}
              </td>
              <td>{g.allergies}</td>
              <td className="admin-td-nowrap">{g.phone}</td>
              <td className="admin-td-nowrap">{g.registeredBy}</td>
              <td className="admin-td-email">{g.registeredByEmail}</td>
              <td className="admin-td-comment">{g.comment}</td>
              <td className="admin-td-center">
                <StatusPill status={status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AdminRsvpsInner() {
  const { password, logout } = useAdminAuth()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

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

  const { active, cancelled, superseded } = rows
    ? splitByEmail(rows)
    : { active: [], cancelled: [], superseded: [] }
  const activeGuests = toGuestRows(active)
  const cancelledGuests = toGuestRows(cancelled)
  const supersededGuests = toGuestRows(superseded)

  return (
    <Container fluid className="page admin-page admin-page--wide">
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
            {activeGuests.length}{' '}
            {activeGuests.length === 1 ? 'person' : 'people'} ·{' '}
            {active.length}{' '}
            {active.length === 1 ? 'submission' : 'submissions'}
            {cancelled.length > 0 && ` · ${cancelled.length} cancelled`}
          </p>

          <div className="admin-summary">
            {daySummary(activeGuests).map((d) => (
              <div className="admin-day-card" key={d.label}>
                <span className="admin-day-card__name">{d.label}</span>
                <div className="admin-day-card__stats">
                  <div className="admin-stat">
                    <span className="admin-stat__num">{d.cabin}</span>
                    <span className="admin-stat__label">Cabin</span>
                  </div>
                  <div className="admin-stat">
                    <span className="admin-stat__num">{d.nonCabin}</span>
                    <span className="admin-stat__label">Non-cabin</span>
                  </div>
                  <div className="admin-stat admin-stat--total">
                    <span className="admin-stat__num">{d.total}</span>
                    <span className="admin-stat__label">Total</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <GuestTable rows={activeGuests} status="active" />

          {cancelled.length > 0 && (
            <div className="admin-history">
              <h2 className="admin-subheading">Cancelled ({cancelled.length})</h2>
              <GuestTable rows={cancelledGuests} status="cancelled" muted />
            </div>
          )}

          {superseded.length > 0 && (
            <div className="admin-history">
              <button
                type="button"
                className="admin-history-toggle"
                onClick={() => setShowHistory((v) => !v)}
              >
                {showHistory ? 'Hide' : 'Show'} earlier versions (
                {superseded.length})
              </button>

              {showHistory && (
                <>
                  <p className="admin-status">
                    These were replaced by a newer submission from the same email.
                  </p>
                  <GuestTable rows={supersededGuests} muted status="replaced" />
                </>
              )}
            </div>
          )}
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
