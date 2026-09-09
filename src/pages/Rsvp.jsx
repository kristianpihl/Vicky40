import RsvpForm from '../forms/RsvpForm.jsx'
import PageWithImage from '../components/PageWithImage.jsx'

// Swap in your own image file, e.g. '/images/rsvp.jpg'
const image = { src: '/images/artikkel.svg', alt: 'RSVP' }

export default function Rsvp() {
  return (
    <PageWithImage image={image}>
      <h1>RSVP</h1>
      <p className="page-lead">
        Let us know who's coming and when. You can sign up several people in the
        same form.
      </p>
      <RsvpForm />
    </PageWithImage>
  )
}
