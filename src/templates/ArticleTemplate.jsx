import { Container } from 'react-bootstrap'
import PageWithImage from '../components/PageWithImage.jsx'

// General article template: title, then text (passed in as children).
//
//   image     -> a full-width picture above the title
//   sideImage -> a picture in a left column, like the front page
//                (on mobile it moves above the text)
//
//   <ArticleTemplate title="The venue" image={{ src, alt }}>...</ArticleTemplate>
//   <ArticleTemplate title="Practical info" sideImage={{ src, alt }}>...</ArticleTemplate>
export default function ArticleTemplate({ title, image, sideImage, children }) {
  const body = (
    <>
      <h1 className="article-title">{title}</h1>
      <div className="article-body">{children}</div>
    </>
  )

  if (sideImage) {
    return <PageWithImage image={sideImage}>{body}</PageWithImage>
  }

  return (
    <Container className="page article">
      {image && (
        <img className="article-image" src={image.src} alt={image.alt} />
      )}
      {body}
    </Container>
  )
}
