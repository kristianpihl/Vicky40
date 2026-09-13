import { useEffect, useState } from 'react'
import { Container, Button, Alert } from 'react-bootstrap'
import JSZip from 'jszip'
import { supabase } from '../lib/supabaseClient.js'
import { useAdminAuth } from '../components/AdminAuthProvider.jsx'

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

// Turns "Kristian Pihl" into "kristian-pihl" for use inside a filename.
function slugify(text) {
  return (
    (text || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'guest'
  )
}

function extensionFromPath(path) {
  const match = /\.([a-zA-Z0-9]+)$/.exec(path || '')
  return match ? match[1].toLowerCase() : 'jpg'
}

// "001-kristian-pihl.jpg" – the index keeps names unique even when two
// guests share a name (or a name is missing).
function photoFileName(row, index) {
  const n = String(index + 1).padStart(3, '0')
  return `${n}-${slugify(row.uploaded_by)}.${extensionFromPath(row.storage_path)}`
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

const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...svgProps}>
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 21h14" />
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
  const { email, password, logout } = useAdminAuth()
  const [rows, setRows] = useState(null)
  const [stats, setStats] = useState(null) // { file_count, total_bytes } | null
  const [error, setError] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [zipping, setZipping] = useState(false)
  const [zipState, setZipState] = useState({
    phase: 'idle', // 'fetching' | 'zipping'
    done: 0,
    total: 0,
    percent: 0,
  })

  // Storage total is a nice-to-have – if it fails, the page still works.
  function fetchStats() {
    supabase
      .rpc('admin_storage_stats', { email, pass: password })
      .then(({ data, error }) => {
        if (error) {
          console.error('admin_storage_stats failed:', error)
          return
        }
        setStats(Array.isArray(data) ? data[0] : data)
      })
  }

  useEffect(() => {
    let cancelled = false

    supabase
      .rpc('admin_photos', { email, pass: password })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('admin_photos failed:', error)
          setError(true)
          return
        }
        setRows(data || [])
      })

    fetchStats()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password])

  async function handleDelete(row) {
    const ok = window.confirm(
      'Are you sure you want to delete this image? It will be deleted from the database.',
    )
    if (!ok) return

    setDeletingId(row.id)

    // 1) Remove the metadata row (password-checked, server side).
    const { error } = await supabase.rpc('admin_delete_photo', {
      email,
      pass: password,
      photo_id: row.id,
    })
    if (error) {
      setDeletingId(null)
      console.error('admin_delete_photo failed:', error)
      window.alert('Could not delete the photo. Please try again.')
      return
    }

    // 2) Now the file has no row, so it can be removed from the bucket.
    //    Best effort – if this fails the file is just an unused leftover.
    const { error: fileError } = await supabase.storage
      .from('photos')
      .remove([row.storage_path])
    if (fileError) {
      console.error('storage remove failed (row already deleted):', fileError)
    }

    setDeletingId(null)
    setRows((cur) => (cur ? cur.filter((r) => r.id !== row.id) : cur))
    fetchStats()
  }

  // Fetches every photo, packs them into one zip, then hands the browser
  // that file to save. Runs entirely in the browser – no server involved.
  async function handleDownloadAll() {
    if (!rows || rows.length === 0 || zipping) return

    setZipping(true)
    setZipState({ phase: 'fetching', done: 0, total: rows.length, percent: 0 })

    const zip = new JSZip()
    let failed = 0

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      try {
        const res = await fetch(viewUrl(row.storage_path))
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        zip.file(photoFileName(row, i), await res.blob())
      } catch (err) {
        console.error('Could not fetch photo for the zip:', row.storage_path, err)
        failed += 1
      }
      const done = i + 1
      setZipState({
        phase: 'fetching',
        done,
        total: rows.length,
        percent: (done / rows.length) * 50,
      })
    }

    try {
      const blob = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (meta) => {
          setZipState((cur) => ({
            ...cur,
            phase: 'zipping',
            percent: 50 + meta.percent / 2,
          }))
        },
      )

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `vickie-40-photos-${new Date().toISOString().slice(0, 10)}.zip`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      if (failed > 0) {
        window.alert(
          `${failed} of ${rows.length} photo${rows.length === 1 ? '' : 's'} could not be included. The rest downloaded fine.`,
        )
      }
    } catch (err) {
      console.error('Could not build the zip file:', err)
      window.alert('Something went wrong while building the zip file. Please try again.')
    } finally {
      setZipping(false)
      setZipState({ phase: 'idle', done: 0, total: 0, percent: 0 })
    }
  }

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
      <div className="admin-page-head">
        <h1 className="admin-page-title">Uploaded photos</h1>
        {!error && rows && rows.length > 0 && (
          <Button
            variant="outline-primary"
            className="admin-download-all"
            onClick={handleDownloadAll}
            disabled={zipping}
          >
            <IconDownload />
            {zipping
              ? zipState.phase === 'zipping'
                ? 'Packing the zip file …'
                : `Downloading ${zipState.done}/${zipState.total} …`
              : `Download all (${rows.length})`}
          </Button>
        )}
      </div>

      {zipping && (
        <div className="admin-zip-progress" role="status" aria-live="polite">
          <span className="admin-zip-progress__bar">
            <span
              className="admin-zip-progress__fill"
              style={{ width: `${Math.max(zipState.percent, 3)}%` }}
            />
          </span>
        </div>
      )}

      {error && (
        <Alert variant="danger">
          Could not load the photos.{' '}
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
                  <span className="admin-photo-actions">
                    <a
                      className="admin-photo-dl"
                      href={downloadUrl(row.storage_path)}
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      className="admin-photo-del"
                      onClick={() => handleDelete(row)}
                      disabled={deletingId === row.id}
                    >
                      {deletingId === row.id ? 'Deleting …' : 'Delete'}
                    </button>
                  </span>
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
  return <AdminPhotosInner />
}
