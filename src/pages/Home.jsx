import FrontTemplate from '../templates/FrontTemplate.jsx'
import { site } from '../content/site.js'
import { usePageContent } from '../components/ContentProvider.jsx'
import { renderMarkdown } from '../lib/markdown.jsx'

// The front-page photo. Save the file as public/images/forside.jpg
// (or change the name/path here).
const imageSrc = '/images/forside.jpg'
const imageAlt = 'Vickie in Oslo'

// Used until the editable text loads (or if the database is unreachable).
// The live text is edited at /admin/pages.
const FALLBACK_HEADING = `We're celebrating ${site.personName}'s 40th birthday ${site.dateLabel} in Oslo!`
const FALLBACK_INTRO =
  "It'll be a weekend full of good food, drinks and great company in Oslo – and we really hope you'll join us!\n\n" +
  'Below you’ll find the countdown to the party, the RSVP form, and links to all the practical details.'

export default function Home() {
  const { get } = usePageContent()
  return (
    <FrontTemplate
      heading={get('front.heading', FALLBACK_HEADING)}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      intro={renderMarkdown(get('front.intro', FALLBACK_INTRO))}
    />
  )
}
