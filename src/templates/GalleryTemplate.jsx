import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient.js'

function publicUrl(path) {
  return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
}

// Photo view: fetches approved photos from Supabase and shows them in a grid.
// Click a photo to see it large. refreshKey is bumped from outside to reload.
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
      console.error('Could not fetch photos:', error)
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
    return <p className="gallery-status">Loading photos …</p>
  }
  if (status === 'error') {
    return (
      <p className="gallery-status">
        Couldn't load the photos right now. Try reloading the page.
      </p>
    )
  }
  if (photos.length === 0) {
    return (
      <p className="gallery-status">
        No photos have been published yet. Check back later!
      </p>
    )
  }

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo) => {
          const url = publicUrl(photo.storage_path)
          const alt = photo.caption || `Photo from ${photo.uploaded_by}`
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
                {photo.caption ? `${photo.caption} · ` : ''}from{' '}
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
            {selected.caption ? `${selected.caption} · ` : ''}from{' '}
            {selected.uploaded_by}
          </p>
        </div>
      )}
    </>
  )
}
