// Responsivt YouTube-vindu (16:9). Send inn video-ID-en – det er delen
// etter «v=» i en vanlig YouTube-lenke, eller etter «youtu.be/».
// Uten ID vises en enkel plassholder.
export default function YouTubeEmbed({ id, title = 'Video' }) {
  if (!id) {
    return <div className="video-placeholder">Video kommer snart.</div>
  }

  return (
    <div className="video-embed">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
