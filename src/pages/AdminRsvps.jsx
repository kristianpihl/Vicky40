import { useCallback, useEffect, useState } from 'react'
import { Container, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { site } from '../content/site.js'
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
      const rowStatus =
        status === 'active' && removedIdx.includes(i) ? 'removed' : status
      out.push({
        key: `${s.id}-${i}`,
        submissionId: s.id,
        personIndex: i,
        status: rowStatus,
        date: s.created_at,
        name: p.name || '',
        cabin,
        sleepsAtCabin: s.sleeping_at_cabin,
        arrivalDay: s.arrival_day || '',
        events: Array.isArray(s.events) ? s.events : [],
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

const svgProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const PencilIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...svgProps}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
)

const IconInbox = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...svgProps}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
)

const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...svgProps}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const IconUserX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...svgProps}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="17" y1="8" x2="22" y2="13" />
    <line x1="22" y1="8" x2="17" y2="13" />
  </svg>
)

function KpiCard({ label, value, sub, icon }) {
  return (
    <div className="admin-kpi">
      <div className="admin-kpi__body">
        <span className="admin-kpi__label">{label}</span>
        <span className="admin-kpi__value">{value}</span>
        <span className="admin-kpi__sub">{sub}</span>
      </div>
      <span className="admin-kpi__icon">{icon}</span>
    </div>
  )
}

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
// The three days are Thursday–Saturday leading up to (and including) site.partyStart:
// Saturday = the party day, Friday = day before, Thursday = two days before.
function daySummary(guests) {
  const days = [
    ['Thursday', 'thursday'],
    ['Friday', 'friday'],
    ['Saturday', 'saturday'],
  ]
  return days.map(([label, key], i) => {
    const d = new Date(site.partyStart)
    d.setDate(d.getDate() + (i - 2))
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yy = String(d.getFullYear()).slice(-2)
    const date = `${dd}.${mm}.${yy}`

    const present = guests.filter((g) => g[key])
    const cabin = present.filter((g) => g.sleepsAtCabin === true).length
    const nonCabin = present.filter((g) => g.sleepsAtCabin === false).length
    return { label, date, cabin, nonCabin, total: cabin + nonCabin }
  })
}

function GuestRow({ g, editing, onEdit, onSave, onCancel, onRemove, onRestore, busy }) {
  const [v, setV] = useState(null)
  const set = (field, val) => setV((prev) => ({ ...prev, [field]: val }))
  const toggleEvent = (day) =>
    setV((prev) => ({
      ...prev,
      events: prev.events.includes(day)
        ? prev.events.filter((d) => d !== day)
        : [...prev.events, day],
    }))

  function begin() {
    setV({
      name: g.name,
      cabin: g.cabin === 'Yes' ? 'Yes' : 'No',
      arrivalDay: g.arrivalDay || site.arrivalDays[1],
      events: [...g.events],
      allergies: g.allergies,
      phone: g.phone,
      email: g.registeredByEmail,
      comment: g.comment,
    })
    onEdit(g.key)
  }

  function commit() {
    if (!v.name.trim()) {
      window.alert('Name cannot be empty.')
      return
    }
    onSave(g, v)
  }

  const noDots = g.status === 'cancelled' || g.status === 'removed'

  if (editing && v) {
    const cabinYes = v.cabin === 'Yes'
    return (
      <tr className="admin-row-editing">
        <td className="admin-td-date">{formatDate(g.date)}</td>
        <td>
          <input
            className="admin-edit-input"
            value={v.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </td>
        <td className="admin-td-center">
          <select
            className="admin-edit-input"
            value={v.cabin}
            onChange={(e) => set('cabin', e.target.value)}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </td>
        {['Thursday', 'Friday', 'Saturday'].map((day) => (
          <td className="admin-td-center" key={day}>
            {cabinYes ? (
              <input
                type="radio"
                name={`arr-${g.key}`}
                checked={v.arrivalDay === day}
                onChange={() => set('arrivalDay', day)}
              />
            ) : day === 'Thursday' ? (
              '—'
            ) : (
              <input
                type="checkbox"
                checked={v.events.includes(day)}
                onChange={() => toggleEvent(day)}
              />
            )}
          </td>
        ))}
        <td>
          <input
            className="admin-edit-input"
            value={v.allergies}
            onChange={(e) => set('allergies', e.target.value)}
          />
        </td>
        <td>
          <input
            className="admin-edit-input"
            value={v.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </td>
        <td className="admin-td-nowrap">{g.registeredBy}</td>
        <td>
          <input
            className="admin-edit-input"
            type="email"
            value={v.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </td>
        <td>
          <input
            className="admin-edit-input"
            value={v.comment}
            onChange={(e) => set('comment', e.target.value)}
          />
        </td>
        <td className="admin-td-status">
          <StatusPill status={g.status} />
        </td>
        <td className="admin-td-center admin-td-nowrap">
          <button
            type="button"
            className="admin-row-action"
            onClick={commit}
            disabled={busy}
          >
            Save
          </button>
          <button
            type="button"
            className="admin-row-action admin-row-action--muted"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td className="admin-td-date">{formatDate(g.date)}</td>
      <td className="admin-td-name">{g.name}</td>
      <td className="admin-td-center">{g.cabin}</td>
      <td className="admin-td-center">{noDots ? '—' : <Dot on={g.thursday} />}</td>
      <td className="admin-td-center">{noDots ? '—' : <Dot on={g.friday} />}</td>
      <td className="admin-td-center">{noDots ? '—' : <Dot on={g.saturday} />}</td>
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
      {onSave && (
        <td className="admin-td-center">
          <button
            type="button"
            className="admin-icon-btn"
            onClick={begin}
            disabled={busy}
            title="Edit row"
            aria-label="Edit row"
          >
            <PencilIcon />
          </button>
        </td>
      )}
    </tr>
  )
}

function GuestTable({ rows, muted, onRemove, onRestore, onSave, busy }) {
  const [editKey, setEditKey] = useState(null)

  async function handleSave(g, values) {
    const ok = await onSave(g, values)
    if (ok) setEditKey(null)
  }

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
            {onSave && <th className="admin-th-center">Edit</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((g) => (
            <GuestRow
              key={g.key}
              g={g}
              editing={editKey === g.key}
              busy={busy}
              onEdit={setEditKey}
              onCancel={() => setEditKey(null)}
              onSave={onSave ? handleSave : undefined}
              onRemove={onRemove}
              onRestore={onRestore}
            />
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

  async function saveRow(g, v) {
    setBusy(true)
    const cabinYes = v.cabin === 'Yes'
    const { error } = await supabase.rpc('admin_update_rsvp_person', {
      pass: password,
      rsvp_id: g.submissionId,
      person_index: g.personIndex,
      new_name: v.name.trim(),
      new_phone: v.phone.trim() || null,
      new_allergies: v.allergies.trim() || null,
      new_sleeping_at_cabin: cabinYes,
      new_arrival_day: cabinYes ? v.arrivalDay || null : null,
      new_events: cabinYes ? null : v.events,
      new_contact_email: v.email.trim() || null,
      new_comment: v.comment.trim() || null,
    })
    setBusy(false)
    if (error) {
      console.error('admin_update_rsvp_person failed:', error)
      window.alert('Could not save the row. Try again.')
      return false
    }
    await load()
    return true
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
          <div className="admin-kpis">
            <KpiCard
              label="Submissions"
              value={active.length}
              sub="RSVPs received"
              icon={<IconInbox />}
            />
            <KpiCard
              label="Active guests"
              value={activeGuests.length}
              sub="coming to the party"
              icon={<IconUsers />}
            />
            <KpiCard
              label="Cancellations"
              value={cancelled.length}
              sub="guests who pulled out"
              icon={<IconUserX />}
            />
          </div>

          <h2 className="admin-section-title">
            Guests per day and choice of stay
          </h2>

          <div className="admin-summary">
            {daySummary(activeGuests).map((d) => (
              <div className="admin-day-card" key={d.label}>
                <span className="admin-day-card__name">
                  {d.label} {d.date}
                </span>
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

          <div className="admin-history">
            <h2 className="admin-subheading">
              Coming ({activeGuests.length})
            </h2>
            <GuestTable
              rows={activeGuests}
              busy={busy}
              onRemove={(g) => setPersonRemoved(g, true)}
              onSave={saveRow}
            />
          </div>

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
