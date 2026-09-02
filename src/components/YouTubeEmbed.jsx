// Responsive YouTube frame (16:9). Pass the video ID – that's the part
// after "v=" in a normal YouTube link, or after "youtu.be/".
// Without an ID a simple placeholder is shown.
export default function YouTubeEmbed({ id, title = 'Video' }) {
  if (!id) {
    return <div className="video-placeholder">Video coming soon.</div>
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
