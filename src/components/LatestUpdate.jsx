import { Link } from 'react-router-dom'
import { updates } from '../content/updates.js'
import { site } from '../content/site.js'

const SEEN_KEY = 'vickie-updates-seen'

// The subpages the feed is allowed to talk about: real, visible nav links.
const feedPages = site.navLinks.filter((l) => !l.hidden && !l.comingSoon)

// '/program' -> 'Programme'. Returns null for anything that isn't a subpage.
export function subpageLabel(path) {
  const link = feedPages.find((l) => l.to === path)
  return link ? link.label : null
}

// Feed entries that point at a real subpage (authored newest first).
export const visibleUpdates = updates.filter((u) => subpageLabel(u.page))

function readSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) || ''
  } catch {
    return ''
  }
}

// The date (YYYY-MM-DD) of the newest update the guest has already seen, or ''.
export function getUpdatesSeen() {
  return readSeen()
}

// Called from the /updates page so the "New" mark clears once the guest looks.
export function markUpdatesSeen() {
  if (visibleUpdates.length === 0) return
  try {
    localStorage.setItem(SEEN_KEY, visibleUpdates[0].date)
  } catch {
    /* ignore */
  }
}

// Accepts 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM' (a space instead of the T is fine).
export function formatUpdateDate(iso) {
  try {
    return new Date(String(iso).replace(' ', 'T')).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

// '14:30' when the entry carries a time, otherwise '' (date-only entries).
export function formatUpdateTime(iso) {
  if (typeof iso !== 'string' || !/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(iso)) {
    return ''
  }
  try {
    return new Date(iso.replace(' ', 'T')).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return ''
  }
}

// How many feed entries tagged with this page were added in the last `hours`
// hours. Used for the little bell on the front-page subpage buttons.
export function recentChangeCount(pathname, hours = 24) {
  const windowMs = hours * 60 * 60 * 1000
  const now = Date.now()
  return visibleUpdates.filter((u) => {
    if (u.page !== pathname) return false
    const t = new Date(u.date).getTime()
    return !Number.isNaN(t) && now - t <= windowMs
  }).length
}

// Small card on the front page showing the newest subpage update.
// Highlights itself when there's something newer than the guest has seen.
export default function LatestUpdate() {
  if (visibleUpdates.length === 0) return null

  const latest = visibleUpdates[0]
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
      <span className="latest-update__page">{subpageLabel(latest.page)}</span>
      <span className="latest-update__text">{latest.text}</span>
      <span className="latest-update__meta">
        {formatUpdateDate(latest.date)} · See all updates →
      </span>
    </Link>
  )
}
