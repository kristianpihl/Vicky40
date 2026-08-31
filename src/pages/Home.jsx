import FrontTemplate from '../templates/FrontTemplate.jsx'
import { site } from '../content/site.js'

// ---------------------------------------------------------------
// Innhold på fremsiden – rediger teksten her.
// ---------------------------------------------------------------
const heading = `Vi feirer at ${site.personName} fyller 40!`

// Legg din egen bildefil i public/images/ og pek på den her.
// (f.eks. '/images/forside.jpg')
const imageSrc = '/images/forside.svg'
const imageAlt = 'Bilde fra feiringen'

const intro = (
  <>
    <p>
      Det blir en helg fylt med god mat, drikke og godt selskap i Oslo – og vi
      håper virkelig at du blir med!
    </p>
    <p>
      Under finner du nedtelling til festen, påmelding, og lenker til alt det
      praktiske.
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
