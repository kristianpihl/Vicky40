import { useCallback, useEffect, useState } from 'react'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAdminAuth, RequireAdmin } from '../components/AdminAuthProvider.jsx'
import { PROGRAM_DAYS, programDayDate } from '../templates/ProgramTemplate.jsx'

function emptyItem(day) {
  return {
    id: null,
    day,
    time: '',
    title: '',
    location: '',
    description: '',
    published: false,
    sort_order: 0,
  }
}

// One editable event row.
function ProgramRow({ item, dayItems, onSave, onDelete, onMove, busy }) {
  const [v, setV] = useState({
    time: item.time || '',
    title: item.title || '',
    location: item.location || '',
    description: item.description || '',
    published: !!item.published,
  })
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) =>
    setV((cur) => ({
      ...cur,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }))

  const saved = dayItems.filter((x) => x.id)
  const savedIndex = item.id ? saved.findIndex((x) => x.id === item.id) : -1

  async function save() {
    setSaving(true)
    await onSave(item, v)
    setSaving(false)
  }

  return (
    <div className={`pe-row${v.published ? '' : ' pe-row--draft'}`}>
      <div className="pe-row-fields">
        <Form.Control
          className="pe-time"
          placeholder="Time"
          value={v.time}
          onChange={set('time')}
        />
        <Form.Control
          className="pe-title"
          placeholder="Title"
          value={v.title}
          onChange={set('title')}
        />
        <Form.Control
          className="pe-loc"
          placeholder="Location"
          value={v.location}
          onChange={set('location')}
        />
      </div>

      <Form.Control
        as="textarea"
        rows={2}
        className="pe-desc"
        placeholder="Description (optional)"
        value={v.description}
        onChange={set('description')}
      />

      <div className="pe-row-actions">
        <Form.Check
          type="switch"
          id={`pub-${item.id || 'new'}-${item.day}-${savedIndex}`}
          label="Published"
          checked={v.published}
          onChange={set('published')}
        />
        <span className="pe-spacer" />

        {item.id ? (
          <>
            <Button
              variant="link"
              className="pe-icon"
              disabled={busy || savedIndex <= 0}
              onClick={() => onMove(item, 'up')}
              title="Move up"
            >
              ↑
            </Button>
            <Button
              variant="link"
              className="pe-icon"
              disabled={busy || savedIndex < 0 || savedIndex >= saved.length - 1}
              onClick={() => onMove(item, 'down')}
              title="Move down"
            >
              ↓
            </Button>
            <Button
              variant="link"
              className="pe-delete"
              disabled={busy}
              onClick={() => onDelete(item)}
            >
              Delete
            </Button>
          </>
        ) : (
          <Button
            variant="link"
            className="pe-delete"
            disabled={busy}
            onClick={() => onDelete(item)}
          >
            Cancel
          </Button>
        )}

        <Button
          variant="primary"
          size="sm"
          disabled={busy || saving || !v.title.trim()}
          onClick={save}
        >
          {saving ? 'Saving …' : item.id ? 'Save' : 'Add'}
        </Button>
      </div>
    </div>
  )
}

function AdminProgramInner() {
  const { email, password, logout } = useAdminAuth()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [newRows, setNewRows] = useState([]) // { key, day } placeholders being added

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('admin_program', {
      email,
      pass: password,
    })
    if (error) {
      console.error('admin_program failed:', error)
      setError(true)
      return
    }
    setError(false)
    setRows(data || [])
  }, [email, password])

  useEffect(() => {
    load()
  }, [load])

  async function saveRow(item, v) {
    setBusy(true)
    const dayItems = (rows || []).filter((r) => r.day === item.day)
    const sortOrder = item.id
      ? item.sort_order
      : dayItems.reduce((m, r) => Math.max(m, r.sort_order || 0), 0) + 1
    const { error } = await supabase.rpc('admin_program_save', {
      email,
      pass: password,
      p_id: item.id,
      p_day: item.day,
      p_time: v.time.trim() || null,
      p_title: v.title.trim(),
      p_location: v.location.trim() || null,
      p_description: v.description.trim() || null,
      p_sort_order: sortOrder,
      p_published: v.published,
    })
    setBusy(false)
    if (error) {
      console.error('admin_program_save failed:', error)
      window.alert('Could not save. Please try again.')
      return false
    }
    await load()
    return true
  }

  async function deleteRow(item) {
    if (!window.confirm(`Delete "${item.title}"? This can't be undone.`)) return
    setBusy(true)
    const { error } = await supabase.rpc('admin_program_delete', {
      email,
      pass: password,
      p_id: item.id,
    })
    setBusy(false)
    if (error) {
      console.error('admin_program_delete failed:', error)
      window.alert('Could not delete. Please try again.')
      return
    }
    await load()
  }

  async function moveRow(item, dir) {
    const saved = (rows || []).filter((r) => r.day === item.day && r.id)
    const i = saved.findIndex((r) => r.id === item.id)
    const j = dir === 'up' ? i - 1 : i + 1
    if (i < 0 || j < 0 || j >= saved.length) return
    const arr = [...saved]
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    setBusy(true)
    const { error } = await supabase.rpc('admin_program_reorder', {
      email,
      pass: password,
      ordered_ids: arr.map((r) => r.id),
    })
    setBusy(false)
    if (error) {
      console.error('admin_program_reorder failed:', error)
      window.alert('Could not reorder. Please try again.')
      return
    }
    await load()
  }

  const addRow = (day) =>
    setNewRows((cur) => [...cur, { key: `${Date.now()}-${Math.random()}`, day }])
  const removeNewRow = (key) =>
    setNewRows((cur) => cur.filter((r) => r.key !== key))

  return (
    <Container className="page admin-page">
      <div className="admin-header">
        <h1>Edit programme</h1>
        <Link to="/admin" className="admin-back">
          ← Admin
        </Link>
      </div>

      <p className="page-lead">
        Events that aren't <strong>Published</strong> stay hidden from guests
        until you switch them on. The public page is{' '}
        <Link to="/program">/program</Link>.
      </p>

      {error && (
        <Alert variant="danger">
          Could not load the programme.{' '}
          <Button
            variant="link"
            className="p-0 align-baseline"
            onClick={() => logout()}
          >
            Log in again
          </Button>
          .
        </Alert>
      )}

      {!error && rows === null && <p className="admin-status">Loading …</p>}

      {!error &&
        rows !== null &&
        PROGRAM_DAYS.map((day) => {
          const dayItems = rows.filter((r) => r.day === day)
          const dayNew = newRows.filter((r) => r.day === day)
          return (
            <section className="pe-day" key={day}>
              <h2 className="admin-subheading">
                {day} <span className="pe-date">{programDayDate(day)}</span>
              </h2>

              {dayItems.length === 0 && dayNew.length === 0 && (
                <p className="admin-status">No events yet.</p>
              )}

              {dayItems.map((item) => (
                <ProgramRow
                  key={item.id}
                  item={item}
                  dayItems={dayItems}
                  onSave={saveRow}
                  onDelete={deleteRow}
                  onMove={moveRow}
                  busy={busy}
                />
              ))}

              {dayNew.map((nr) => (
                <ProgramRow
                  key={nr.key}
                  item={emptyItem(day)}
                  dayItems={dayItems}
                  onSave={async (it, v) => {
                    const ok = await saveRow(it, v)
                    if (ok) removeNewRow(nr.key)
                    return ok
                  }}
                  onDelete={() => removeNewRow(nr.key)}
                  onMove={() => {}}
                  busy={busy}
                />
              ))}

              <Button
                variant="outline-primary"
                size="sm"
                className="pe-add"
                disabled={busy}
                onClick={() => addRow(day)}
              >
                + Add event
              </Button>
            </section>
          )
        })}
    </Container>
  )
}

export default function AdminProgram() {
  return (
    <RequireAdmin>
      <AdminProgramInner />
    </RequireAdmin>
  )
}
