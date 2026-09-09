import ArticleTemplate from '../templates/ArticleTemplate.jsx'

// Save a photo of the venue as public/images/venue.jpg
// (or change the name/path here).
const image = { src: '/images/venue.jpg', alt: 'Solstua – the dining room set for dinner' }

export default function Venue() {
  return (
    <ArticleTemplate title="The venue" image={image}>
      <aside className="fact-box">
        <h2>At a glance</h2>
        <dl>
          <dt>Where</dt>
          <dd>Solstua, Thorleif Haugs vei 14, Oslo</dd>

          <dt>Area</dt>
          <dd>Voksenkollen, up at the top of Holmenkollen</dd>

          <dt>Room for</dt>
          <dd>Up to 80 seated · 120 standing</dd>

          <dt>Getting there</dt>
          <dd>Metro line 1 to Voksenkollen, then a short walk uphill. About 25–30 min by car from the centre.</dd>

          <dt>Food &amp; drink</dt>
          <dd>Bring your own – the house is fully set for 80 (plates, glasses, cutlery, the lot)</dd>

          <dt>Staying over</dt>
          <dd>6–8 bedrooms, 12–15 beds</dd>

          <dt>The building</dt>
          <dd>A 1905 hunting villa; the interiors are kept just as architect Arnstein Arneberg left them in 1916</dd>
        </dl>
      </aside>

      <p>
        The party is at <strong>Solstua</strong>, a wooden villa tucked into the
        forest at Voksenkollen, high above Oslo with a wide view over the city.
        It's a warm, old-fashioned house with room for dinner, mingling and
        dancing – and beds for anyone staying the night.
      </p>

      <h2>A house with a history</h2>
      <p>
        Solstua was built as a hunting villa for the industrialist Sam Eyde in
        1905. In 1916 the factory owner Halvor Schou bought it and had the
        architect Arnstein Arneberg – later known for Oslo City Hall – design the
        rooms. Very little has changed since: the house is rented out unstaffed
        and looks much as it did a hundred years ago.
      </p>

      <h2>The rooms</h2>
      <p>Five connected salons, plus the little timber Hallingstua:</p>
      <ul>
        <li>
          <strong>The Dining Room</strong> – seats 10–80. The floor, walls,
          ceiling and fireplace were brought from an English manor in 1916. It
          becomes the dance floor after dinner.
        </li>
        <li>
          <strong>The Gobelin Hall</strong> – 30–40 at the table, hung with
          antique French tapestries and gilded furniture that once belonged to
          Prince Heinrich, brother of Kaiser Wilhelm II.
        </li>
        <li>
          <strong>The Middle Room</strong> – for mingling, coffee and drinks
          after dinner; also good for dancing.
        </li>
        <li>
          <strong>The Fireplace Room</strong> – Norwegian timber panelling and a
          big open fire; coffee for 25.
        </li>
        <li>
          <strong>The Garden Room</strong> – a bright room with large windows and
          the view; coffee for 15.
        </li>
        <li>
          <strong>Hallingstua</strong> – a separate timber house from the 1740s,
          used for the aperitif before dinner.
        </li>
      </ul>

      <h2>Getting there</h2>
      <p>
        Take Metro line 1 towards Frognerseteren and get off at{' '}
        <strong>Voksenkollen</strong> – it's a few minutes' walk uphill from the
        station. By car it's roughly 25–30 minutes from the city centre, traffic
        depending.
      </p>

      <h2>Good to know</h2>
      <ul>
        <li>
          The house is rented unstaffed, so food, drink and service are all
          organised by us – nothing is tied to the venue.
        </li>
        <li>
          It's an old house: full of character, and a little draughty in winter.
          Bring a layer.
        </li>
        <li>Dinner is in the Dining Room, which turns into the dance floor afterwards.</li>
      </ul>
    </ArticleTemplate>
  )
}
