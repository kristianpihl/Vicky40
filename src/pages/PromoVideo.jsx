import ArticleTemplate from '../templates/ArticleTemplate.jsx'
import YouTubeEmbed from '../components/YouTubeEmbed.jsx'

// Paste the video ID from the YouTube link here when the video is ready.
// Example: the link https://www.youtube.com/watch?v=dQw4w9WgXcQ  ->  'dQw4w9WgXcQ'
const youtubeId = ''

export default function PromoVideo() {
  return (
    <ArticleTemplate title="Promo video">
      <p>A little teaser for the celebration is coming here.</p>
      <YouTubeEmbed id={youtubeId} title="Promo video" />
    </ArticleTemplate>
  )
}
