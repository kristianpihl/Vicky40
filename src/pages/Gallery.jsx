import { useState } from 'react'
import { Container } from 'react-bootstrap'
import PhotoUploadForm from '../forms/PhotoUploadForm.jsx'
import GalleryTemplate from '../templates/GalleryTemplate.jsx'

export default function Gallery() {
  // Bumped when an upload finishes, so the gallery reloads.
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <Container className="page gallery-page">
      <h1>Photos</h1>
      <p className="page-lead">
        Upload your own photos from the weekend, and see the ones others have
        shared.
      </p>

      <section className="gallery-upload">
        <h2>Upload photos</h2>
        <PhotoUploadForm onUploaded={() => setRefreshKey((k) => k + 1)} />
      </section>

      <section className="gallery-list">
        <h2>Shared photos</h2>
        <GalleryTemplate refreshKey={refreshKey} />
      </section>
    </Container>
  )
}
