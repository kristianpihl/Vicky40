import { Link } from 'react-router-dom'
import ArticleTemplate from '../templates/ArticleTemplate.jsx'

// Practical info / frequently asked questions. Uses the article template with no top image.
export default function Faq() {
  return (
    <ArticleTemplate title="Practical info">
      <h2>When and where is the party?</h2>
      <p>
        [Date] from [time], at [venue/address]. See the{' '}
        <Link to="/program">programme</Link> for details day by day.
      </p>

      <h2>How do I sign up?</h2>
      <p>
        Use the <Link to="/rsvp">RSVP form</Link>. There you can sign up several
        people and note any allergies.
      </p>

      <h2>Is there accommodation?</h2>
      <p>[Info about hotels, recommendations, or whether something has been booked together.]</p>

      <h2>Is there a dress code?</h2>
      <p>[Fill in – for example "smart but comfortable".]</p>

      <h2>Can I bring a partner or children?</h2>
      <p>[Fill in.]</p>

      <h2>Who can I ask?</h2>
      <p>Contact [name] on [phone / email].</p>
    </ArticleTemplate>
  )
}
