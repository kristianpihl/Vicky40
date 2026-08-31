import { useState } from 'react'
import { Container } from 'react-bootstrap'
import PhotoUploadForm from '../forms/PhotoUploadForm.jsx'
import GalleryTemplate from '../templates/GalleryTemplate.jsx'

export default function Gallery() {
  // Bumpes når en opplasting er ferdig, så galleriet henter på nytt.
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <Container className="page gallery-page">
      <h1>Bilder</h1>
      <p className="page-lead">
        Last opp dine egne bilder fra helgen, og se bildene som er delt.
      </p>

      <section className="gallery-upload">
        <h2>Last opp bilder</h2>
        <PhotoUploadForm onUploaded={() => setRefreshKey((k) => k + 1)} />
      </section>

      <section className="gallery-list">
        <h2>Delte bilder</h2>
        <GalleryTemplate refreshKey={refreshKey} />
      </section>
    </Container>
  )
}
