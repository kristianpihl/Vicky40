import { useCallback, useEffect, useRef, useState } from 'react'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAdminAuth, RequireAdmin } from '../components/AdminAuthProvider.jsx'
import { resizeImage } from '../lib/resizeImage.js'
import { guestImageUrl } from '../lib/guestImage.js'

function emptyItem() {
  return { id: null, name: '', blurb: '', image_path: '', published: false, sort_order: 0 }
}

function GuestRow({ item, allItems, onSave, onDelete, onMove, onUpload, busy }) {
  const [v, setV] = useState({
    name: item.name || '',
    blurb: item.blurb || '',
    image_path: item.image_path || '',
    published: !!item.published,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const set = (key) => (e) =>
    setV((cur) => ({
      ...cur,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }))

  const saved = allItems.filter((x) => x.id)
  const idx = item.id ? saved.findIndex((x) => x.id === item.id) : -1

  async function pickImage(e) {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    const path = await onUpload(file)
    setUploading(false)
    if (path) setV((cur) => ({ ...cur, image_path: path }))
  }

  async function save() {
    setSaving(true)
    await onSave(item, v)
    setSaving(false)
  }

  const imgSrc = v.image_path ? guestImageUrl(v.image_path) : null

  return (
    <div className={`pe-row${v.published ? '' : ' pe-row--draft'}`}>
      <div className="pe-article-top">
        <div className="pe-img">
          {imgSrc ? (
            <img className="pe-img__thumb" src={imgSrc} alt="" />
          ) : (
            <div className="pe-img__empty">No photo</div>
          )}
          <div className="pe-img__actions">
            <button
              type="button"
              className="pe-link-btn"
              disabled={busy || uploading}
              onClick={() => fileRef.current && fileRef.current.click()}
            >
              {uploading ? 'Uploading …' : v.image_path ? 'Replace' : 'Upload photo'}
            </button>
            {v.image_path && (
              <button
                type="button"
                className="pe-link-btn pe-link-btn--danger"
                disabled={busy || uploading}
                onClick={() => setV((cur) => ({ ...cur, image_path: '' }))}
              >
                Remove
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={pickImage}
            />
          </div>
        </div>

        <div className="pe-article-fields">
          <Form.Control
            className="pe-title"
            placeholder="Name"
            value={v.name}
            onChange={set('name')}
          />
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="A little about this person"
            value={v.blurb}
            onChange={set('blurb')}
          />
        </div>
      </div>

      <div className="pe-row-actions">
        <Form.Check
          type="switch"
          id={`guest-pub-${item.id || 'new'}-${idx}`}
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
          disabled={busy || saving || uploading || !v.name.trim()}
          onClick={save}
        >
          {saving ? 'Saving …' : item.id ? 'Save' : 'Add'}
        </Button>
      </div>
    </div>
  )
}

function AdminGuestsInner() {
  const { email, password, logout } = useAdminAuth()
  const [rows, setRows] = useState(null)
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [newRows, setNewRows] = useState([])

  const load = useCallback(async () => {
    const [{ data: gs, error: e1 }, { data: pc, error: e2 }] = await Promise.all([
      supabase.rpc('admin_guests', { email, pass: password }),
      supabase
        .from('page_content')
        .select('value')
        .eq('key', 'guests.unlocked')
        .maybeSingle(),
    ])
    if (e1) {
      console.error('admin_guests failed:', e1)
      setError(true)
      return
    }
    if (e2) console.error('guests.unlocked load failed:', e2)
    setError(false)
    setRows(gs || [])
    setUnlocked(pc ? pc.value === 'true' : false)
  }, [email, password])

  useEffect(() => {
    load()
  }, [load])

  async function uploadImage(file) {
    try {
      const resized = await resizeImage(file)
      const ext = resized.name.includes('.')
        ? resized.name.split('.').pop().toLowerCase()
        : resized.type.split('/')[1] || 'jpg'
      const path = `${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage
        .from('guest-images')
        .upload(path, resized, { contentType: resized.type, upsert: false })
      if (error) {
        console.error('guest image upload failed:', error)
        window.alert('Could not upload the photo. Please try again.')
        return null
      }
      return path
    } catch (err) {
      console.error('guest image upload failed:', err)
      window.alert('Could not upload the photo. Please try again.')
      return null
    }
  }

  async function saveRow(item, v) {
    setBusy(true)
    const sortOrder = item.id
      ? item.sort_order
      : (rows || []).reduce((m, r) => Math.max(m, r.sort_order || 0), 0) + 1
    const { error } = await supabase.rpc('admin_guest_save', {
      email,
      pass: password,
      p_id: item.id,
      p_name: v.name.trim(),
      p_blurb: v.blurb,
      p_image_path: v.image_path || null,
      p_sort_order: sortOrder,
      p_published: v.published,
    })
    setBusy(false)
    if (error) {
      console.error('admin_guest_save failed:', error)
      window.alert('Could not save. Please try again.')
      return false
    }
    if (item.image_path && item.image_path !== v.image_path) {
      supabase.storage.from('guest-images').remove([item.image_path])
    }
    await load()
    return true
  }

  async function deleteRow(item) {
    if (!window.confirm(`Delete "${item.name}"? This can't be undone.`)) return
    setBusy(true)
    const { error } = await supabase.rpc('admin_guest_delete', {
      email,
      pass: password,
      p_id: item.id,
    })
    setBusy(false)
    if (error) {
      console.error('admin_guest_delete failed:', error)
      window.alert('Could not delete. Please try again.')
      return
    }
    if (item.image_path) {
      supabase.storage.from('guest-images').remove([item.image_path])
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
    const { error } = await supabase.rpc('admin_guests_reorder', {
      email,
      pass: password,
      ordered_ids: arr.map((r) => r.id),
    })
    setBusy(false)
    if (error) {
      console.error('admin_guests_reorder failed:', error)
      window.alert('Could not reorder. Please try again.')
      return
    }
    await load()
  }

  async function toggleUnlock(next) {
    setBusy(true)
    const { error } = await supabase.rpc('admin_page_content_save', {
      email,
      pass: password,
      p_key: 'guests.unlocked',
      p_value: next ? 'true' : 'false',
    })
    setBusy(false)
    if (error) {
      console.error('toggleUnlock failed:', error)
      window.alert('Could not save. Please try again.')
      return
    }
    setUnlocked(next)
  }

  const addRow = () =>
    setNewRows((cur) => [...cur, { key: `${Date.now()}-${Math.random()}` }])
  const removeNewRow = (key) =>
    setNewRows((cur) => cur.filter((r) => r.key !== key))

  return (
    <Container className="page admin-page">
      <div className="admin-header">
        <h1>Edit guest list</h1>
        <Link to="/admin" className="admin-back">
          ← Admin
        </Link>
      </div>

      <p className="page-lead">
        A photo, a name and a short text for each guest. The public page is{' '}
        <Link to="/guests">/guests</Link>.
      </p>

      {error && (
        <Alert variant="danger">
          Could not load this.{' '}
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
          <div className="pe-row">
            <Form.Check
              type="switch"
              id="guests-unlock"
              label="Guests can open the “Get to know my guests” button"
              checked={unlocked}
              disabled={busy}
              onChange={(e) => toggleUnlock(e.target.checked)}
            />
            <span className="pe-hint">
              <span>
                Off: the front-page button stays locked with a “Coming soon”
                label. On: guests can click it and see the list.
              </span>
            </span>
          </div>

          <h2 className="admin-subheading" style={{ marginTop: '1.5rem' }}>
            Guests
          </h2>

          {rows.length === 0 && newRows.length === 0 && (
            <p className="admin-status">No guests yet.</p>
          )}

          {rows.map((item) => (
            <GuestRow
              key={item.id}
              item={item}
              allItems={rows}
              onSave={saveRow}
              onDelete={deleteRow}
              onMove={moveRow}
              onUpload={uploadImage}
              busy={busy}
            />
          ))}

          {newRows.map((nr) => (
            <GuestRow
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
              onUpload={uploadImage}
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
            + Add guest
          </Button>
        </>
      )}
    </Container>
  )
}

export default function AdminGuests() {
  return (
    <RequireAdmin>
      <AdminGuestsInner />
    </RequireAdmin>
  )
}
