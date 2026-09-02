import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

// One list item. Becomes a link if the item has "to" (internal page) or
// "href" (external link), otherwise just a row without a link.
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

// List template: a title, an optional intro, and a list of items going down.
// Each item has a small image on the left and text on the right.
//
//   <ListTemplate title="Bars" intro="..." items={[{ title, ingress, image, href }]} />
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
