import { useEffect, useState } from 'react'
import { Container, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAdminAuth, RequireAdmin } from '../components/AdminAuthProvider.jsx'

// Supabase free tier gives 1 GB of file storage. Bump this if the
// project is ever upgraded to a paid plan.
const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024

function viewUrl(path) {
  return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
}

function downloadUrl(path) {
  return supabase.storage.from('photos').getPublicUrl(path, { download: true })
    .data.publicUrl
}

function formatBytes(n) {
  const bytes = Number(n) || 0
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`
  return `${(mb / 1024).toFixed(2)} GB`
}

const svgProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const IconImage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...svgProps}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-4.5-4.5L5 21" />
  </svg>
)

const IconDatabase = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...svgProps}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14a9 3 0 0 0 18 0V5" />
    <path d="M3 12a9 3 0 0 0 18 0" />
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

function KpiCard({ label, value, sub, icon, foot }) {
  return (
    <div className="admin-kpi">
      <div className="admin-kpi__body">
        <span className="admin-kpi__label">{label}</span>
        <span className="admin-kpi__value">{value}</span>
        <span className="admin-kpi__sub">{sub}</span>
        {foot}
      </div>
      <span className="admin-kpi__icon">{icon}</span>
    </div>
  )
}

function AdminPhotosInner() {
  const { password, logout } = useAdminAuth()
  const [rows, setRows] = useState(null)
  const [stats, setStats] = useState(null) // { file_count, total_bytes } | null
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

    // Storage total is a nice-to-have – if it fails, the page still works.
    supabase
      .rpc('admin_storage_stats', { pass: password })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('admin_storage_stats failed:', error)
          return
        }
        setStats(Array.isArray(data) ? data[0] : data)
      })

    return () => {
      cancelled = true
    }
  }, [password])

  const totalBytes = stats ? Number(stats.total_bytes) || 0 : null
  const pct =
    totalBytes === null ? 0 : (totalBytes / STORAGE_LIMIT_BYTES) * 100
  const pctText =
    totalBytes === null ? '' : pct < 0.1 ? '<0.1%' : `${pct.toFixed(1)}%`

  const contributors = rows
    ? new Set(
        rows.map((r) => (r.uploaded_by || '').trim().toLowerCase()).filter(Boolean),
      ).size
    : 0

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
          <div className="admin-kpis">
            <KpiCard
              label="Photos"
              value={rows.length}
              sub={rows.length === 1 ? 'uploaded so far' : 'photos uploaded so far'}
              icon={<IconImage />}
            />
            <KpiCard
              label="Storage used"
              value={totalBytes === null ? '—' : formatBytes(totalBytes)}
              sub={
                totalBytes === null
                  ? 'of 1 GB free space'
                  : `${pctText} of 1 GB free space`
              }
              icon={<IconDatabase />}
              foot={
                totalBytes === null ? null : (
                  <span className="admin-kpi__bar">
                    <span
                      className="admin-kpi__bar-fill"
                      style={{ width: `${Math.min(100, Math.max(pct, 1.5))}%` }}
                    />
                  </span>
                )
              }
            />
            <KpiCard
              label="Contributors"
              value={contributors}
              sub={
                contributors === 1
                  ? 'person has shared photos'
                  : 'people have shared photos'
              }
              icon={<IconUsers />}
            />
          </div>

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
