import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

// Ett listeelement. Blir en lenke hvis item har «to» (intern side) eller
// «href» (ekstern lenke), ellers bare en rad uten lenke.
function ListItem({ item }) {
  const inner = (
    <>
      {item.image && (
        <img
          className="list-item-image"
          src={item.image.src}
          alt={item.image.alt || ''}
        />
      )}
      <div className="list-item-text">
        <h2 className="list-item-title">{item.title}</h2>
        {item.ingress && <p className="list-item-ingress">{item.ingress}</p>}
      </div>
    </>
  )

  if (item.to) {
    return (
      <Link className="list-item" to={item.to}>
        {inner}
      </Link>
    )
  }
  if (item.href) {
    return (
      <a
        className="list-item"
        href={item.href}
        target="_blank"
        rel="noreferrer"
      >
        {inner}
      </a>
    )
  }
  return <div className="list-item">{inner}</div>
}

// Listevisnings-malen: en tittel, valgfri ingress, og en liste med elementer
// nedover. Hvert element har et lite bilde til venstre og tekst til høyre.
//
//   <ListTemplate title="Barer" intro="..." items={[{ title, ingress, image, href }]} />
export default function ListTemplate({ title, intro, items = [] }) {
  return (
    <Container className="page list-page">
      <h1 className="list-title">{title}</h1>
      {intro && <p className="page-lead">{intro}</p>}

      <div className="list">
        {items.map((item, i) => (
          <ListItem key={i} item={item} />
        ))}
      </div>
    </Container>
  )
}
