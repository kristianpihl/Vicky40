import ArticleTemplate from '../templates/ArticleTemplate.jsx'

const image = { src: '/images/artikkel.svg', alt: 'Hvem kommer hvilken dag' }

export default function WhoWhichDay() {
  return (
    <ArticleTemplate title="Hvem kommer hvilken dag" image={image}>
      <p>
        Oversikt over hvem som er med når. Denne fylles ut etter hvert som
        påmeldingene kommer inn.
      </p>

      <h2>Torsdag</h2>
      <p>[Navn, navn, navn …]</p>

      <h2>Fredag</h2>
      <p>[Navn, navn, navn …]</p>

      <h2>Lørdag</h2>
      <p>[Navn, navn, navn …]</p>

      <h2>Søndag</h2>
      <p>[Navn, navn, navn …]</p>
    </ArticleTemplate>
  )
}
