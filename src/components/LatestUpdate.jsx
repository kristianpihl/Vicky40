import { Link } from 'react-router-dom'
import { useUpdates } from './UpdatesProvider.jsx'
import {
  subpageLabel,
  formatUpdateDate,
  getUpdatesSeen,
} from '../lib/updatesFeed.js'

// Small card on the front page showing the newest subpage update.
// Highlights itself when there's something newer than the guest has seen.
export default function LatestUpdate() {
  const { items } = useUpdates()
  if (items.length === 0) return null

  const latest = items[0]
  const isNew = getUpdatesSeen() !== String(latest.date)

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
