import { Link } from 'react-router-dom'
import { updates } from '../content/updates.js'

const SEEN_KEY = 'vickie-updates-seen'

function readSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) || ''
  } catch {
    return ''
  }
}

// Called from the /updates page so the "New" mark clears once the guest looks.
export function markUpdatesSeen() {
  if (updates.length === 0) return
  try {
    localStorage.setItem(SEEN_KEY, updates[0].date)
  } catch {
    /* ignore */
  }
}

export function formatUpdateDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

// Small card on the front page showing the newest site update.
// Highlights itself when there's something newer than the guest has seen.
export default function LatestUpdate() {
  if (updates.length === 0) return null

  const latest = updates[0]
  const isNew = readSeen() !== latest.date

  return (
    <Link
      to="/updates"
      className={`latest-update${isNew ? ' latest-update--new' : ''}`}
    >
      <span className="latest-update__head">
        Latest update
        {isNew && <span className="latest-update__badge">New</span>}
      </span>
      <span className="latest-update__text">{latest.text}</span>
      <span className="latest-update__meta">
        {formatUpdateDate(latest.date)} · See all updates →
      </span>
    </Link>
  )
}
