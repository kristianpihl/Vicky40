import { useEffect, useState } from 'react'
import { Container, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAdminAuth, RequireAdmin } from '../components/AdminAuthProvider.jsx'

function viewUrl(path) {
  return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
}

function downloadUrl(path) {
  return supabase.storage.from('photos').getPublicUrl(path, { download: true })
    .data.publicUrl
}

function AdminPhotosInner() {
  const { password, logout } = useAdminAuth()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('admin_photos', { pass: password }).then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('admin_photos failed:', error)
        setError(true)
        return
      }
      setRows(data || [])
    })
    return () => {
      cancelled = true
    }
  }, [password])

  return (
    <Container className="page admin-page">
      <div className="admin-header">
        <h1>Uploaded photos</h1>
        <Link to="/admin" className="admin-back">
          ← Admin
        </Link>
      </div>

      {error && (
        <Alert variant="danger">
          Could not load the photos.{' '}
          <Button variant="link" className="p-0 align-baseline" onClick={logout}>
            Log in again
          </Button>
          .
        </Alert>
      )}

      {!error && rows === null && <p className="admin-status">Loading …</p>}

      {!error && rows !== null && rows.length === 0 && (
        <p className="admin-status">No photos have been uploaded yet.</p>
      )}

      {!error && rows && rows.length > 0 && (
        <>
          <p className="page-lead">
            {rows.length} {rows.length === 1 ? 'photo' : 'photos'}
          </p>

          <div className="admin-photo-grid">
            {rows.map((row) => (
              <figure className="admin-photo" key={row.id}>
                <a
                  href={viewUrl(row.storage_path)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={viewUrl(row.storage_path)}
                    alt={row.caption || `Photo from ${row.uploaded_by}`}
                    loading="lazy"
                  />
                </a>
                <figcaption>
                  <span className="admin-photo-by">from {row.uploaded_by}</span>
                  {row.caption && (
                    <span className="admin-photo-caption">{row.caption}</span>
                  )}
                  <a className="admin-photo-dl" href={downloadUrl(row.storage_path)}>
                    Download
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
    </Container>
  )
}

export default function AdminPhotos() {
  return (
    <RequireAdmin>
      <AdminPhotosInner />
    </RequireAdmin>
  )
}
