import { useCallback, useEffect, useState } from 'react'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAdminAuth } from '../components/AdminAuthProvider.jsx'
import { renderMarkdown } from '../lib/markdown.jsx'

function emptyItem() {
  return { id: null, heading: '', body: '', published: false, sort_order: 0 }
}

// One editable F&Q entry.
function FaqRow({ item, allItems, onSave, onDelete, onMove, busy }) {
  const [v, setV] = useState({
    heading: item.heading || '',
    body: item.body || '',
    published: !!item.published,
  })
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)

  const set = (key) => (e) =>
    setV((cur) => ({
      ...cur,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }))

  const saved = allItems.filter((x) => x.id)
  const idx = item.id ? saved.findIndex((x) => x.id === item.id) : -1

  async function save() {
    setSaving(true)
    await onSave(item, v)
    setSaving(false)
  }

  return (
    <div className={`pe-row${v.published ? '' : ' pe-row--draft'}`}>
      <Form.Control
        className="pe-title"
        placeholder="Question / heading"
        value={v.heading}
        onChange={set('heading')}
      />

      {preview ? (
        <div className="pe-preview article-body">{renderMarkdown(v.body)}</div>
      ) : (
        <Form.Control
          as="textarea"
          rows={4}
          className="pe-desc"
          placeholder="Answer"
          value={v.body}
          onChange={set('body')}
        />
      )}

      <div className="pe-hint">
        <span>
          Formatting: <code>**bold**</code>, lines starting with <code>- </code>{' '}
          for bullets, <code>[text](/rsvp)</code> for links.
        </span>
        <button
          type="button"
          className="pe-link-btn"
          onClick={() => setPreview((p) => !p)}
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      <div className="pe-row-actions">
        <Form.Check
          type="switch"
          id={`faq-pub-${item.id || 'new'}-${idx}`}
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
              disabled={busy || idx <= 0}
              onClick={() => onMove(item, 'up')}
              title="Move up"
            >
              ↑
            </Button>
            <Button
              variant="link"
              className="pe-icon"
              disabled={busy || idx < 0 || idx >= saved.length - 1}
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
          disabled={busy || saving || !v.heading.trim()}
          onClick={save}
        >
          {saving ? 'Saving …' : item.id ? 'Save' : 'Add'}
        </Button>
      </div>
    </div>
  )
}

function AdminFaqInner() {
  const { email, password, logout } = useAdminAuth()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [newRows, setNewRows] = useState([]) // { key } placeholders

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('admin_faq', {
      email,
      pass: password,
    })
    if (error) {
      console.error('admin_faq failed:', error)
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
    const sortOrder = item.id
      ? item.sort_order
      : (rows || []).reduce((m, r) => Math.max(m, r.sort_order || 0), 0) + 1
    const { error } = await supabase.rpc('admin_faq_save', {
      email,
      pass: password,
      p_id: item.id,
      p_heading: v.heading.trim(),
      p_body: v.body,
      p_sort_order: sortOrder,
      p_published: v.published,
    })
    setBusy(false)
    if (error) {
      console.error('admin_faq_save failed:', error)
      window.alert('Could not save. Please try again.')
      return false
    }
    await load()
    return true
  }

  async function deleteRow(item) {
    if (!window.confirm(`Delete "${item.heading}"? This can't be undone.`)) return
    setBusy(true)
    const { error } = await supabase.rpc('admin_faq_delete', {
      email,
      pass: password,
      p_id: item.id,
    })
    setBusy(false)
    if (error) {
      console.error('admin_faq_delete failed:', error)
      window.alert('Could not delete. Please try again.')
      return
    }
    await load()
  }

  async function moveRow(item, dir) {
    const saved = (rows || []).filter((r) => r.id)
    const i = saved.findIndex((r) => r.id === item.id)
    const j = dir === 'up' ? i - 1 : i + 1
    if (i < 0 || j < 0 || j >= saved.length) return
    const arr = [...saved]
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    setBusy(true)
    const { error } = await supabase.rpc('admin_faq_reorder', {
      email,
      pass: password,
      ordered_ids: arr.map((r) => r.id),
    })
    setBusy(false)
    if (error) {
      console.error('admin_faq_reorder failed:', error)
      window.alert('Could not reorder. Please try again.')
      return
    }
    await load()
  }

  const addRow = () =>
    setNewRows((cur) => [...cur, { key: `${Date.now()}-${Math.random()}` }])
  const removeNewRow = (key) =>
    setNewRows((cur) => cur.filter((r) => r.key !== key))

  return (
    <Container className="page admin-page">
      <h1 className="admin-page-title">Edit F&amp;Q</h1>

      <p className="page-lead">
        Entries that aren't <strong>Published</strong> stay hidden from guests
        until you switch them on. The public page is{' '}
        <Link to="/faq">/faq</Link>.
      </p>

      {error && (
        <Alert variant="danger">
          Could not load the F&amp;Q.{' '}
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

      {!error && rows !== null && (
        <>
          {rows.length === 0 && newRows.length === 0 && (
            <p className="admin-status">No entries yet.</p>
          )}

          {rows.map((item) => (
            <FaqRow
              key={item.id}
              item={item}
              allItems={rows}
              onSave={saveRow}
              onDelete={deleteRow}
              onMove={moveRow}
              busy={busy}
            />
          ))}

          {newRows.map((nr) => (
            <FaqRow
              key={nr.key}
              item={emptyItem()}
              allItems={rows}
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
            onClick={addRow}
          >
            + Add entry
          </Button>
        </>
      )}
    </Container>
  )
}

export default function AdminFaq() {
  return <AdminFaqInner />
}
