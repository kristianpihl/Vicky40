import { Link } from 'react-router-dom'

// A deliberately tiny markdown renderer for admin-written text:
//   - blank line       -> new paragraph
//   - "## " / "### "   -> heading
//   - lines all starting with "- "  -> bullet list
//   - **bold**
//   - [text](url)  -> link ('/...' becomes an in-app link, anything else opens
//     in a new tab). Text in [square brackets] with no (url) stays literal, so
//     placeholders like [date] are left alone.
// Returns an array of React elements. No raw HTML is injected.

const INLINE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g

function renderInline(text, keyPrefix) {
  const out = []
  let last = 0
  let i = 0
  let m
  INLINE.lastIndex = 0
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      out.push(<strong key={`${keyPrefix}-b${i}`}>{m[1]}</strong>)
    } else {
      const label = m[2]
      const href = m[3].trim()
      if (href.startsWith('/')) {
        out.push(
          <Link key={`${keyPrefix}-l${i}`} to={href}>
            {label}
          </Link>,
        )
      } else {
        out.push(
          <a
            key={`${keyPrefix}-l${i}`}
            href={href}
            target="_blank"
            rel="noreferrer"
          >
            {label}
          </a>,
        )
      }
    }
    last = INLINE.lastIndex
    i += 1
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function renderMarkdown(text) {
  const blocks = String(text || '')
    .replace(/\r\n/g, '\n')
    .trim()
    .split(/\n{2,}/)
    .filter((b) => b.trim() !== '')

  return blocks.map((block, bi) => {
    const lines = block.split('\n')

    const h = /^(#{2,3})\s+(.*)$/.exec(block.trim())
    if (h && lines.length === 1) {
      const Tag = h[1].length === 2 ? 'h2' : 'h3'
      return <Tag key={bi}>{renderInline(h[2], `h${bi}`)}</Tag>
    }

    const isList = lines.every((l) => /^\s*-\s+/.test(l))
    if (isList) {
      return (
        <ul key={bi}>
          {lines.map((l, li) => (
            <li key={li}>
              {renderInline(l.replace(/^\s*-\s+/, ''), `${bi}-${li}`)}
            </li>
          ))}
        </ul>
      )
    }
    return <p key={bi}>{renderInline(lines.join(' '), `p${bi}`)}</p>
  })
}
