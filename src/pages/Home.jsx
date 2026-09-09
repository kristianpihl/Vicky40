import FrontTemplate from '../templates/FrontTemplate.jsx'
import { site } from '../content/site.js'

// ---------------------------------------------------------------
// Front-page content – edit the text here.
// ---------------------------------------------------------------
const heading = `We're celebrating ${site.personName}'s 40th birthday!`

// The front-page photo. Save the file as public/images/forside.jpg
// (or change the name/path here).
const imageSrc = '/images/forside.jpg'
const imageAlt = 'Vickie in Oslo'

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
      dates={site.dateLabel}
    />
  )
}
