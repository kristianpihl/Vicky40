import RsvpForm from '../forms/RsvpForm.jsx'
import PageWithImage from '../components/PageWithImage.jsx'

// Save the file as public/images/rsvp.jpg (or change the name/path here).
const image = { src: '/images/rsvp.jpg', alt: 'Vickie as a child' }

export default function Rsvp() {
  return (
    <PageWithImage image={image}>
      <h1>RSVP</h1>
      <p className="page-lead">
        Let us know who's coming and when. You can sign up several people in the
        same form. Already signed up and something changed? Just submit again –
        we'll use your most recent answer.
      </p>
      <RsvpForm />
    </PageWithImage>
  )
}
