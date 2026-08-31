import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient.js'

function publicUrl(path) {
  return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
}

// Bildevisning: henter godkjente bilder fra Supabase og viser dem i et rutenett.
// Klikk på et bilde for å se det stort. refreshKey bumpes utenfra for å laste på nytt.
export default function GalleryTemplate({ refreshKey = 0 }) {
  const [photos, setPhotos] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [selected, setSelected] = useState(null)

  const load = useCallback(async () => {
    setStatus('loading')
    const { data, error } = await supabase
      .from('photos')
      .select('id, storage_path, uploaded_by, caption, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Kunne ikke hente bilder:', error)
      setStatus('error')
      return
    }
    setPhotos(data || [])
    setStatus('ready')
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (status === 'loading') {
    return <p className="gallery-status">Laster bilder …</p>
  }
  if (status === 'error') {
    return (
      <p className="gallery-status">
        Kunne ikke laste bildene akkurat nå. Prøv å laste siden på nytt.
      </p>
    )
  }
  if (photos.length === 0) {
    return (
      <p className="gallery-status">
        Ingen bilder er publisert ennå. Kom gjerne tilbake senere!
      </p>
    )
  }

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo) => {
          const url = publicUrl(photo.storage_path)
          const alt = photo.caption || `Bilde fra ${photo.uploaded_by}`
          return (
            <figure className="gallery-item" key={photo.id}>
              <button
                type="button"
                className="gallery-thumb"
                onClick={() => setSelected({ ...photo, url })}
              >
                <img src={url} alt={alt} loading="lazy" />
              </button>
              <figcaption className="gallery-caption">
                {photo.caption ? `${photo.caption} · ` : ''}fra{' '}
                {photo.uploaded_by}
              </figcaption>
            </figure>
          )
        })}
      </div>

      {selected && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <img src={selected.url} alt={selected.caption || ''} />
          <p className="lightbox-caption">
            {selected.caption ? `${selected.caption} · ` : ''}fra{' '}
            {selected.uploaded_by}
          </p>
        </div>
      )}
    </>
  )
}
