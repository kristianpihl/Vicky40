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
    if (!uploadedBy.trim()) return 'Skriv inn hvem bildene er fra.'
    if (files.length === 0) return 'Velg minst ett bilde.'
    if (files.length > MAX_FILES) return `Maks ${MAX_FILES} bilder om gangen.`
    for (const file of files) {
      if (!file.type.startsWith('image/')) return `«${file.name}» er ikke et bilde.`
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        return `«${file.name}» er større enn ${MAX_FILE_MB} MB.`
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
        console.error('Opplasting feilet:', file.name, uploadError)
        failed.push(file.name)
      } else {
        const { error: dbError } = await supabase.from('photos').insert({
          storage_path: path,
          uploaded_by: uploadedBy.trim(),
          caption: caption.trim() || null,
        })
        if (dbError) {
          console.error('Lagring i database feilet:', file.name, dbError)
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
        'Ingen bilder ble lastet opp. Sjekk at «photos»-oppsettet er kjørt i Supabase (se supabase/photos.sql).',
      )
      return
    }

    setStatus('success')
    setMessage(
      failed.length === 0
        ? `Takk! ${ok} ${ok === 1 ? 'bilde' : 'bilder'} lastet opp.`
        : `${ok} lastet opp, men ${failed.length} feilet. Prøv de siste på nytt.`,
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
          Bildene vises i galleriet når de er godkjent.
        </p>
        <Button variant="outline-primary" onClick={reset}>
          Last opp flere
        </Button>
      </div>
    )
  }

  return (
    <Form className="upload-form" onSubmit={handleSubmit} noValidate>
      <Form.Group className="mb-3" controlId="upload-by">
        <Form.Label>Hvem er bildene fra?</Form.Label>
        <Form.Control
          type="text"
          value={uploadedBy}
          onChange={(e) => setUploadedBy(e.target.value)}
          placeholder="Navnet ditt"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="upload-caption">
        <Form.Label>Tekst til bildene (valgfritt)</Form.Label>
        <Form.Control
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="F.eks. «Fra lunsjen på fredag»"
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="upload-files">
        <Form.Label>Velg bilder</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        <Form.Text>
          Flere om gangen går fint. Maks {MAX_FILES} bilder, {MAX_FILE_MB} MB per
          bilde.
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
          ? `Laster opp ${progress.done} av ${progress.total} …`
          : 'Last opp'}
      </Button>
    </Form>
  )
}
