import ArticleTemplate from '../templates/ArticleTemplate.jsx'

// Bytt til din egen bildefil, f.eks. '/images/stedet.jpg'
const image = { src: '/images/artikkel.svg', alt: 'Stedet festen skal være' }

export default function Venue() {
  return (
    <ArticleTemplate title="Litt om stedet festen skal være" image={image}>
      <p>
        Festen holdes i [navn på lokalet] i Oslo. Her er det god plass til både
        middag, mingling og dansegulv.
      </p>

      <h2>Adresse</h2>
      <p>
        [Gateadresse], Oslo. [Kort om hvordan man kommer seg dit – nærmeste
        t-bane/trikk, og om det finnes parkering.]
      </p>

      <h2>Bra å vite</h2>
      <ul>
        <li>Garderobe finnes i lokalet.</li>
        <li>[Noe om servering, drikke og tidspunkter.]</li>
        <li>[Noe om tilgjengelighet, heis e.l.]</li>
      </ul>
    </ArticleTemplate>
  )
}
