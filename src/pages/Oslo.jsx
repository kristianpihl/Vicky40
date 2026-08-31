import { Link } from 'react-router-dom'
import ArticleTemplate from '../templates/ArticleTemplate.jsx'

const image = { src: '/images/artikkel.svg', alt: 'Oslo' }

export default function Oslo() {
  return (
    <ArticleTemplate title="Litt om byen Oslo" image={image}>
      <p>
        For dere som ikke er så kjent i Oslo: byen er lett å bevege seg i, og
        det meste ligger i gangavstand eller en kort t-banetur unna.
      </p>

      <h2>Komme seg rundt</h2>
      <p>
        Flytoget og vanlig tog går fra Gardermoen til Oslo S på rundt 20–25
        minutter. I sentrum kommer du langt til fots; ellers dekker t-bane,
        trikk og buss resten (samme billett i sone 1).
      </p>

      <h2>Mens du er her</h2>
      <p>
        Det er kort vei til blant annet Operaen, Akershus festning, Aker Brygge
        og Grünerløkka. <Link to="/oslo/barer">Se noen bartips →</Link>
      </p>
    </ArticleTemplate>
  )
}
