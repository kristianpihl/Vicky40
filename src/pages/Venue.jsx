import ArticleTemplate from '../templates/ArticleTemplate.jsx'
import { usePageContent } from '../components/ContentProvider.jsx'
import { renderMarkdown } from '../lib/markdown.jsx'
import FactBox from '../components/FactBox.jsx'

// Save a photo of the venue as public/images/venue.jpg
// (or change the name/path here).
const image = {
  src: '/images/venue.jpg',
  alt: 'Solstua – the dining room set for dinner',
}

// Used until the editable text loads. The live text is edited at /admin/pages.
const FALLBACK_FACTS = `Where: Solstua, Thorleif Haugs vei 14, Oslo
Area: Voksenkollen, up at the top of Holmenkollen
Room for: Up to 80 seated · 120 standing
Getting there: Metro line 1 to Voksenkollen, then a short walk uphill. About 25–30 min by car from the centre.
Food & drink: Bring your own – the house is fully set for 80 (plates, glasses, cutlery, the lot)
Staying over: 6–8 bedrooms, 12–15 beds
The building: A 1905 hunting villa; the interiors are kept just as architect Arnstein Arneberg left them in 1916`

const FALLBACK_BODY = `The party is at **Solstua**, a wooden villa tucked into the forest at Voksenkollen, high above Oslo with a wide view over the city. It's a warm, old-fashioned house with room for dinner, mingling and dancing – and beds for anyone staying the night.

## A house with a history

Solstua was built as a hunting villa for the industrialist Sam Eyde in 1905. In 1916 the factory owner Halvor Schou bought it and had the architect Arnstein Arneberg – later known for Oslo City Hall – design the rooms. Very little has changed since: the house is rented out unstaffed and looks much as it did a hundred years ago.

## The rooms

Five connected salons, plus the little timber Hallingstua:

- **The Dining Room** – seats 10–80. The floor, walls, ceiling and fireplace were brought from an English manor in 1916. It becomes the dance floor after dinner.
- **The Gobelin Hall** – 30–40 at the table, hung with antique French tapestries and gilded furniture that once belonged to Prince Heinrich, brother of Kaiser Wilhelm II.
- **The Middle Room** – for mingling, coffee and drinks after dinner; also good for dancing.
- **The Fireplace Room** – Norwegian timber panelling and a big open fire; coffee for 25.
- **The Garden Room** – a bright room with large windows and the view; coffee for 15.
- **Hallingstua** – a separate timber house from the 1740s, used for the aperitif before dinner.

## Getting there

Take Metro line 1 towards Frognerseteren and get off at **Voksenkollen** – it's a few minutes' walk uphill from the station. By car it's roughly 25–30 minutes from the city centre, traffic depending.

## Good to know

- The house is rented unstaffed, so food, drink and service are all organised by us – nothing is tied to the venue.
- It's an old house: full of character, and a little draughty in winter. Bring a layer.
- Dinner is in the Dining Room, which turns into the dance floor afterwards.`

export default function Venue() {
  const { get } = usePageContent()
  return (
    <ArticleTemplate title="The venue" image={image}>
      <FactBox text={get('venue.facts', FALLBACK_FACTS)} />
      {renderMarkdown(get('venue.body', FALLBACK_BODY))}
    </ArticleTemplate>
  )
}
