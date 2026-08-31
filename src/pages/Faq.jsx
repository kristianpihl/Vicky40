import { Link } from 'react-router-dom'
import ArticleTemplate from '../templates/ArticleTemplate.jsx'

// Praktisk info / ofte stilte spørsmål. Bruker artikkelmalen uten toppbilde.
export default function Faq() {
  return (
    <ArticleTemplate title="Praktisk info">
      <h2>Når og hvor er festen?</h2>
      <p>
        [Dato] fra kl. [tid], i [lokale/adresse]. Se{' '}
        <Link to="/program">programmet</Link> for detaljer dag for dag.
      </p>

      <h2>Hvordan melder jeg meg på?</h2>
      <p>
        Bruk <Link to="/rsvp">påmeldingsskjemaet</Link>. Der kan du melde på
        flere personer og si fra om allergier.
      </p>

      <h2>Er det overnatting?</h2>
      <p>[Info om hotell, anbefalinger, eller om det er booket noe felles.]</p>

      <h2>Er det en dresscode?</h2>
      <p>[Fyll inn – for eksempel «pent, men komfortabelt».]</p>

      <h2>Kan jeg ta med partner eller barn?</h2>
      <p>[Fyll inn.]</p>

      <h2>Hvem kan jeg spørre?</h2>
      <p>Kontakt [navn] på [telefon / e-post].</p>
    </ArticleTemplate>
  )
}
