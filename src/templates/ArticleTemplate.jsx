import { Container } from 'react-bootstrap'

// General article template: optional top image, title, then text.
// The text is passed in as children – plain JSX (<p>, <h2>, <ul> ...).
//
//   <ArticleTemplate title="The venue" image={{ src, alt }}>
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
