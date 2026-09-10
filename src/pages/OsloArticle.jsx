import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { renderMarkdown } from '../lib/markdown.jsx'
import { articleImageUrl } from '../lib/articleImage.js'

export default function OsloArticle() {
  const { id } = useParams()
  const [article, setArticle] = useState(undefined) // undefined = loading, null = not found
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('Loading the article failed:', error)
          setError(true)
          return
        }
        setArticle(data || null)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const src = article ? articleImageUrl(article.image_path) : null

  return (
    <Container className="page article oslo-article">
      <Link to="/oslo" className="back-link">
        ← Vickie's Oslo
      </Link>

      {article === undefined && !error && (
        <p className="admin-status">Loading …</p>
      )}

      {(error || article === null) && (
        <p className="admin-status">That article isn't available.</p>
      )}

      {article && (
        <>
          {src && <img className="article-image" src={src} alt="" />}
          <h1 className="article-title">{article.title}</h1>
          <div className="article-body">{renderMarkdown(article.body)}</div>
        </>
      )}
    </Container>
  )
}
