import { Link } from 'react-router-dom'
import ArticleTemplate from '../templates/ArticleTemplate.jsx'

// Practical info / frequently asked questions. Image on the left (like the front page).
// Save the file as public/images/faq.jpg (or change the name/path here).
// Anything in [square brackets] is a placeholder – fill it in.
const image = { src: '/images/faq.jpg', alt: 'Vickie as a baby' }

export default function Faq() {
  return (
    <ArticleTemplate title="Practical info" sideImage={image}>
      <h2>When and where?</h2>
      <p>
        The weekend runs Thursday 04.02 to Sunday 07.02 at{' '}
        <Link to="/venue">Solstua</Link>. The{' '}
        <Link to="/program">programme</Link> has it day by day.
      </p>

      <h2>RSVP deadline</h2>
      <p>
        Please sign up by <strong>[date]</strong> so we can give Solstua final
        numbers for food and beds.
      </p>

      <h2>How do I sign up?</h2>
      <p>
        Use the <Link to="/rsvp">RSVP form</Link>. You can add several people,
        say which days you're coming, whether you're sleeping at Solstua, and
        note any allergies.
      </p>

      <h2>Changing or cancelling your RSVP</h2>
      <p>
        Something changed? Just open the <Link to="/rsvp">RSVP form</Link> again
        and fill it in with the <em>same email address</em> you used the first
        time – we always use your most recent answer, so there's nothing else to
        do. To cancel, tick <em>“We can no longer come – cancel our RSVP”</em> at
        the top of the form and send it.
      </p>

      <h2>Staying over</h2>
      <p>
        Solstua has 6–8 bedrooms (12–15 beds). Say in the RSVP if you'd like one
        – [how beds are shared out / any cost]. If they're full, [nearby options
        / it's about a 25-minute drive from town].
      </p>

      <h2>Food</h2>
      <p>
        Meals are at Solstua across the weekend – [something light on Thursday,
        lunch and dinner Friday, breakfast and the big dinner Saturday]. Put any
        allergies or diets in the RSVP form and we'll pass them on. [Anything
        about drinks, or bringing something.]
      </p>

      <h2>Dress code, day by day</h2>
      <ul>
        <li>
          <strong>Thursday</strong> – [relaxed, come as you are].
        </li>
        <li>
          <strong>Friday</strong> – [smart casual].
        </li>
        <li>
          <strong>Saturday</strong> – [the main night: dress up / cocktail / a
          theme?].
        </li>
      </ul>

      <h2>Gifts</h2>
      <p>
        Your being there is what matters most. [If you'd like to give something:
        a few ideas here / a contribution towards X / “no gifts, please”.]
      </p>

      <h2>Left something at Solstua?</h2>
      <p>
        If you think you left something behind, contact Solstua directly within a
        few days at [phone / email / solstua.no]. You can also let [host name]
        know and we'll help chase it up.
      </p>

      <h2>Still wondering about something?</h2>
      <p>Message [name] on [phone / email].</p>
    </ArticleTemplate>
  )
}
