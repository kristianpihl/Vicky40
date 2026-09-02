import ArticleTemplate from '../templates/ArticleTemplate.jsx'

const image = { src: '/images/artikkel.svg', alt: "Who's coming when" }

export default function WhoWhichDay() {
  return (
    <ArticleTemplate title="Who's coming when" image={image}>
      <p>
        An overview of who's joining on which day. This gets filled in as the
        RSVPs come in.
      </p>

      <h2>Thursday</h2>
      <p>[Name, name, name …]</p>

      <h2>Friday</h2>
      <p>[Name, name, name …]</p>

      <h2>Saturday</h2>
      <p>[Name, name, name …]</p>

      <h2>Sunday</h2>
      <p>[Name, name, name …]</p>
    </ArticleTemplate>
  )
}
