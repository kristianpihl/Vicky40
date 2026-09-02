import FrontTemplate from '../templates/FrontTemplate.jsx'
import { site } from '../content/site.js'

// ---------------------------------------------------------------
// Front-page content – edit the text here.
// ---------------------------------------------------------------
const heading = `We're celebrating ${site.personName}'s 40th birthday!`

// Put your own image file in public/images/ and point to it here.
// (e.g. '/images/forside.jpg')
const imageSrc = '/images/forside.svg'
const imageAlt = 'Photo from the celebration'

const intro = (
  <>
    <p>
      It'll be a weekend full of good food, drinks and great company in Oslo –
      and we really hope you'll join us!
    </p>
    <p>
      Below you'll find the countdown to the party, the RSVP form, and links to
      all the practical details.
    </p>
  </>
)
// ---------------------------------------------------------------

export default function Home() {
  return (
    <FrontTemplate
      heading={heading}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      intro={intro}
    />
  )
}
