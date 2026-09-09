import PhotoUploadForm from '../forms/PhotoUploadForm.jsx'
import PageWithImage from '../components/PageWithImage.jsx'
import { site } from '../content/site.js'

// This page is upload-only. The photos are not shown on the site.
// (The gallery view lives in templates/GalleryTemplate.jsx if it is ever
// wanted again.)
//
// Save the file as public/images/photos.jpg (or change the name/path here).
const image = { src: '/images/photos.jpg', alt: 'Young Vickie' }

export default function Gallery() {
  return (
    <PageWithImage image={image}>
      <h1>Upload photos</h1>
      <p className="page-lead">
        Share your photos for {site.personName}'s 40th. They won't be shown here
        on the site, but they may be used for the celebration in different ways:
        a slideshow, a photo book, a montage, and so on.
      </p>

      <section className="gallery-upload">
        <PhotoUploadForm />
      </section>
    </PageWithImage>
  )
}
