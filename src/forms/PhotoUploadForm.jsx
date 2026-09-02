import { useState } from 'react'
import { Form, Button, Alert } from 'react-bootstrap'
import { supabase } from '../lib/supabaseClient.js'

const MAX_FILE_MB = 10
const MAX_FILES = 20

export default function PhotoUploadForm({ onUploaded }) {
  const [uploadedBy, setUploadedBy] = useState('')
  const [caption, setCaption] = useState('')
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [message, setMessage] = useState('')

  function handleFileChange(event) {
    setFiles(Array.from(event.target.files || []))
    setMessage('')
    setStatus('idle')
  }

  function validate() {
    if (!uploadedBy.trim()) return 'Enter who the photos are from.'
    if (files.length === 0) return 'Choose at least one photo.'
    if (files.length > MAX_FILES) return `Max ${MAX_FILES} photos at a time.`
    for (const file of files) {
      if (!file.type.startsWith('image/')) return `"${file.name}" is not an image.`
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        return `"${file.name}" is larger than ${MAX_FILE_MB} MB.`
      }
    }
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const msg = validate()
    if (msg) {
      setMessage(msg)
      setStatus('error')
      return
    }

    setStatus('uploading')
    setProgress({ done: 0, total: files.length })

    let ok = 0
    const failed = []

    for (const file of files) {
      const ext = file.name.includes('.')
        ? file.name.split('.').pop().toLowerCase()
        : file.type.split('/')[1] || 'jpg'
      const path = `${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, file, { contentType: file.type, upsert: false })

      if (uploadError) {
        console.error('Upload failed:', file.name, uploadError)
        failed.push(file.name)
      } else {
        const { error: dbError } = await supabase.from('photos').insert({
          storage_path: path,
          uploaded_by: uploadedBy.trim(),
          caption: caption.trim() || null,
        })
        if (dbError) {
          console.error('Saving to database failed:', file.name, dbError)
          failed.push(file.name)
        } else {
          ok += 1
        }
      }

      setProgress((p) => ({ ...p, done: p.done + 1 }))
    }

    if (ok === 0) {
      setStatus('error')
      setMessage(
        'No photos were uploaded. Check that the "photos" setup has been run in Supabase (see supabase/photos.sql).',
      )
      return
    }

    setStatus('success')
    setMessage(
      failed.length === 0
        ? `Thanks! ${ok} ${ok === 1 ? 'photo' : 'photos'} uploaded.`
        : `${ok} uploaded, but ${failed.length} failed. Try the rest again.`,
    )
    setFiles([])
    setCaption('')
    if (onUploaded) onUploaded()
  }

  function reset() {
    setStatus('idle')
    setMessage('')
    setFiles([])
    setCaption('')
    setProgress({ done: 0, total: 0 })
  }

  if (status === 'success') {
    return (
      <div className="upload-done">
        <p className="mb-2">{message}</p>
        <p className="text-muted mb-3">
          The photos appear in the gallery once they've been approved.
        </p>
        <Button variant="outline-primary" onClick={reset}>
          Upload more
        </Button>
      </div>
    )
  }

  return (
    <Form className="upload-form" onSubmit={handleSubmit} noValidate>
      <Form.Group className="mb-3" controlId="upload-by">
        <Form.Label>Who are the photos from?</Form.Label>
        <Form.Control
          type="text"
          value={uploadedBy}
          onChange={(e) => setUploadedBy(e.target.value)}
          placeholder="Your name"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="upload-caption">
        <Form.Label>Caption for the photos (optional)</Form.Label>
        <Form.Control
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder='E.g. "From lunch on Friday"'
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="upload-files">
        <Form.Label>Choose photos</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        <Form.Text>
          Several at a time is fine. Max {MAX_FILES} photos, {MAX_FILE_MB} MB per
          photo.
        </Form.Text>
      </Form.Group>

      {files.length > 0 && (
        <ul className="upload-list">
          {files.map((file, i) => (
            <li key={i}>
              {file.name}{' '}
              <span className="text-muted">
                ({(file.size / (1024 * 1024)).toFixed(1)} MB)
              </span>
            </li>
          ))}
        </ul>
      )}

      {message && (
        <Alert
          variant={status === 'error' ? 'danger' : 'warning'}
          className="mt-2"
        >
          {message}
        </Alert>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-100 mt-2"
        disabled={status === 'uploading'}
      >
        {status === 'uploading'
          ? `Uploading ${progress.done} of ${progress.total} …`
          : 'Upload'}
      </Button>
    </Form>
  )
}
