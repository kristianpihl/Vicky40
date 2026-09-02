import { Link } from 'react-router-dom'
import ArticleTemplate from '../templates/ArticleTemplate.jsx'

const image = { src: '/images/artikkel.svg', alt: 'Oslo' }

export default function Oslo() {
  return (
    <ArticleTemplate title="About Oslo" image={image}>
      <p>
        For those of you who don't know Oslo well: the city is easy to get
        around, and most things are within walking distance or a short metro
        ride away.
      </p>

      <h2>Getting around</h2>
      <p>
        The airport express and regular trains run from Gardermoen to Oslo
        Central in about 20–25 minutes. You can walk most places in the centre;
        otherwise the metro, tram and bus cover the rest (one ticket for zone 1).
      </p>

      <h2>While you're here</h2>
      <p>
        It's a short walk to the Opera House, Akershus Fortress, Aker Brygge and
        Grünerløkka, among other places.{' '}
        <Link to="/oslo/bars">See a few bar tips →</Link>
      </p>
    </ArticleTemplate>
  )
}
