import ArticleTemplate from '../templates/ArticleTemplate.jsx'
import YouTubeEmbed from '../components/YouTubeEmbed.jsx'

// Lim inn video-ID-en fra YouTube-lenken her når videoen er klar.
// Eksempel: lenken https://www.youtube.com/watch?v=dQw4w9WgXcQ  ->  'dQw4w9WgXcQ'
const youtubeId = ''

export default function PromoVideo() {
  return (
    <ArticleTemplate title="Promo-video">
      <p>Her kommer en liten teaser for feiringen.</p>
      <YouTubeEmbed id={youtubeId} title="Promo-video" />
    </ArticleTemplate>
  )
}
