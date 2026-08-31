import { Container } from 'react-bootstrap'

// Generell artikkelmal: valgfritt toppbilde, tittel, deretter tekst.
// Teksten sendes inn som children – helt vanlig JSX (<p>, <h2>, <ul> ...).
//
//   <ArticleTemplate title="Om stedet" image={{ src, alt }}>
//     <p>...</p>
//   </ArticleTemplate>
export default function ArticleTemplate({ title, image, children }) {
  return (
    <Container className="page article">
      {image && (
        <img className="article-image" src={image.src} alt={image.alt} />
      )}
      <h1 className="article-title">{title}</h1>
      <div className="article-body">{children}</div>
    </Container>
  )
}
