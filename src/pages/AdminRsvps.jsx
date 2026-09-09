import { useCallback, useEffect, useState } from 'react'
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

// One table row per person, tagged with a status.
function toGuestRows(submissions, status) {
  const out = []
  for (const s of submissions) {
    const people = Array.isArray(s.people) ? s.people : []
    const removedIdx = Array.isArray(s.removed_people) ? s.removed_people : []
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
      // On active submissions, a person the admin has removed gets its own status.
      const rowStatus =
        status === 'active' && removedIdx.includes(i) ? 'removed' : status
      out.push({
        key: `${s.id}-${i}`,
        submissionId: s.id,
        personIndex: i,
        status: rowStatus,
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

// Active   = the current answer.
// Removed  = the admin took this person off the active list (undoable).
// Cancelled = the guest called the whole RSVP off.
// Replaced = an older answer a newer submission from the same email replaced.
const StatusPill = ({ status }) => {
  if (status === 'removed') {
    return <span className="admin-pill admin-pill--removed">Removed</span>
  }
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

function GuestTable({ rows, muted, onRemove, onRestore, busy }) {
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
          {rows.map((g) => {
            const noDots = g.status === 'cancelled' || g.status === 'removed'
            return (
              <tr key={g.key}>
                <td className="admin-td-date">{formatDate(g.date)}</td>
                <td className="admin-td-name">{g.name}</td>
                <td className="admin-td-center">{g.cabin}</td>
                <td className="admin-td-center">
                  {noDots ? '—' : <Dot on={g.thursday} />}
                </td>
                <td className="admin-td-center">
                  {noDots ? '—' : <Dot on={g.friday} />}
                </td>
                <td className="admin-td-center">
                  {noDots ? '—' : <Dot on={g.saturday} />}
                </td>
                <td>{g.allergies}</td>
                <td className="admin-td-nowrap">{g.phone}</td>
                <td className="admin-td-nowrap">{g.registeredBy}</td>
                <td className="admin-td-email">{g.registeredByEmail}</td>
                <td className="admin-td-comment">{g.comment}</td>
                <td className="admin-td-status">
                  <StatusPill status={g.status} />
                  {onRemove && g.status === 'active' && (
                    <button
                      type="button"
                      className="admin-row-action"
                      onClick={() => onRemove(g)}
                      disabled={busy}
                    >
                      Remove
                    </button>
                  )}
                  {onRestore && g.status === 'removed' && (
                    <button
                      type="button"
                      className="admin-row-action"
                      onClick={() => onRestore(g)}
                      disabled={busy}
                    >
                      Undo
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
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
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('admin_rsvps', { pass: password })
    if (error) {
      console.error('admin_rsvps failed:', error)
      setError(true)
      return
    }
    setError(false)
    setRows(data || [])
  }, [password])

  useEffect(() => {
    load()
  }, [load])

  async function setPersonRemoved(g, removed) {
    setBusy(true)
    const { error } = await supabase.rpc('admin_set_person_removed', {
      pass: password,
      rsvp_id: g.submissionId,
      person_index: g.personIndex,
      removed,
    })
    if (error) {
      console.error('admin_set_person_removed failed:', error)
      window.alert('Could not save the change. Try again.')
    } else {
      await load()
    }
    setBusy(false)
  }

  const { active, cancelled, superseded } = rows
    ? splitByEmail(rows)
    : { active: [], cancelled: [], superseded: [] }

  const activeAll = toGuestRows(active, 'active')
  const activeGuests = activeAll.filter((g) => g.status === 'active')
  const removedGuests = activeAll.filter((g) => g.status === 'removed')
  const cancelledGuests = toGuestRows(cancelled, 'cancelled')
  const supersededGuests = toGuestRows(superseded, 'replaced')

  const notComing = [...cancelledGuests, ...removedGuests].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  )

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
            {notComing.length > 0 && ` · ${notComing.length} not coming`}
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

          <GuestTable
            rows={activeGuests}
            busy={busy}
            onRemove={(g) => setPersonRemoved(g, true)}
          />

          {notComing.length > 0 && (
            <div className="admin-history">
              <h2 className="admin-subheading">
                Not coming ({notComing.length})
              </h2>
              <GuestTable
                rows={notComing}
                muted
                busy={busy}
                onRestore={(g) => setPersonRemoved(g, false)}
              />
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
                  <GuestTable rows={supersededGuests} muted />
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
