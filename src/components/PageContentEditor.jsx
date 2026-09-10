import { useCallback, useEffect, useState } from 'react'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAdminAuth } from './AdminAuthProvider.jsx'
import { renderMarkdown } from '../lib/markdown.jsx'
import FactBox from './FactBox.jsx'

// One editable content field. mode: 'text' | 'markdown' | 'facts'
function Field({ label, contentKey, value, mode = 'text', onSave, busy }) {
  const [v, setV] = useState(value)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    setV(value)
  }, [value])

  const multiline = mode !== 'text'
  const dirty = v !== value

  async function save() {
    setSaving(true)
    await onSave(contentKey, v)
    setSaving(false)
  }

  return (
    <div className="pe-row">
      <span className="pe-field-label">{label}</span>

      {!multiline && (
        <Form.Control value={v} onChange={(e) => setV(e.target.value)} />
      )}
      {multiline && preview && (
        <div className="pe-preview article-body">
          {mode === 'facts' ? <FactBox text={v} /> : renderMarkdown(v)}
        </div>
      )}
      {multiline && !preview && (
        <Form.Control
          as="textarea"
          rows={mode === 'markdown' ? 10 : 6}
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
      )}

      {multiline && (
        <div className="pe-hint">
          <span>
            {mode === 'markdown' ? (
              <>
                <code>## Heading</code>, <code>**bold**</code>,{' '}
                <code>- bullet</code>, <code>[text](/rsvp)</code>
              </>
            ) : (
              <>
                One <code>Label: Value</code> per line
              </>
            )}
          </span>
          <button
            type="button"
            className="pe-link-btn"
            onClick={() => setPreview((p) => !p)}
          >
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>
      )}

      <div className="pe-row-actions">
        <span className="pe-spacer" />
        <Button
          variant="primary"
          size="sm"
          disabled={busy || saving || !dirty}
          onClick={save}
        >
          {saving ? 'Saving …' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

// A small editor for one page's single-blob content (page_content rows).
//   fields: [{ label, key, mode }]  – mode: 'text' | 'markdown' | 'facts'
export default function PageContentEditor({ title, lead, fields }) {
  const { email, password, logout } = useAdminAuth()
  const [content, setContent] = useState(null) // { key: value } | null
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('page_content')
      .select('key,value')
    if (error) {
      console.error('page_content load failed:', error)
      setError(true)
      return
    }
    setError(false)
    const m = {}
    for (const row of data || []) m[row.key] = row.value
    setContent(m)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function saveField(key, value) {
    setBusy(true)
    const { error } = await supabase.rpc('admin_page_content_save', {
      email,
      pass: password,
      p_key: key,
      p_value: value,
    })
    setBusy(false)
    if (error) {
      console.error('admin_page_content_save failed:', error)
      window.alert('Could not save. Please try again.')
      return false
    }
    await load()
    return true
  }

  return (
    <Container className="page admin-page">
      <h1 className="admin-page-title">{title}</h1>

      {lead && <p className="page-lead">{lead}</p>}

      {error && (
        <Alert variant="danger">
          Could not load the content.{' '}
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

      {!error && content === null && <p className="admin-status">Loading …</p>}

      {!error &&
        content !== null &&
        fields.map((f) => (
          <Field
            key={f.key}
            label={f.label}
            contentKey={f.key}
            value={content[f.key] ?? ''}
            mode={f.mode}
            onSave={saveField}
            busy={busy}
          />
        ))}
    </Container>
  )
}
