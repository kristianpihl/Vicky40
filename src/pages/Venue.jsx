import ArticleTemplate from '../templates/ArticleTemplate.jsx'

// Swap in your own image file, e.g. '/images/venue.jpg'
const image = { src: '/images/artikkel.svg', alt: 'The party venue' }

export default function Venue() {
  return (
    <ArticleTemplate title="About the venue" image={image}>
      <p>
        The party is held at [venue name] in Oslo. There's plenty of room for
        dinner, mingling and a dance floor.
      </p>

      <h2>Address</h2>
      <p>
        [Street address], Oslo. [A short note on how to get there – nearest
        metro/tram, and whether there's parking.]
      </p>

      <h2>Good to know</h2>
      <ul>
        <li>There's a cloakroom at the venue.</li>
        <li>[Something about food, drinks and timings.]</li>
        <li>[Something about accessibility, lift, etc.]</li>
      </ul>
    </ArticleTemplate>
  )
}
