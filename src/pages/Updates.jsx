import { useEffect, useMemo, useState } from 'react'
import { Container } from 'react-bootstrap'
import { useUpdates } from '../components/UpdatesProvider.jsx'
import {
  subpageLabel,
  markUpdatesSeen,
  formatUpdateDate,
  formatUpdateTime,
  getUpdatesSeen,
} from '../lib/updatesFeed.js'

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a6 6 0 0 0-6 6c0 3.09-.79 5.2-1.63 6.6-.5.82.1 1.9 1.05 1.9h13.16c.95 0 1.55-1.08 1.05-1.9C18.79 13.2 18 11.09 18 8a6 6 0 0 0-6-6Z"
      />
      <path fill="currentColor" d="M10 19a2 2 0 0 0 4 0h-4Z" />
    </svg>
  )
}

function relativeLabel(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''))
  if (!m) return ''
  const then = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((today - then) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 31) return `${Math.floor(days / 7)} wk ago`
  return formatUpdateDate(iso)
}

export default function Updates() {
  const { items } = useUpdates()

  // Capture what the guest had already seen BEFORE marking this visit as seen.
  const [seen] = useState(getUpdatesSeen)
  useEffect(() => {
    if (items.length > 0) markUpdatesSeen(items[0].date)
  }, [items])

  const unreadCount = useMemo(
    () => items.filter((u) => String(u.date) > seen).length,
    [items, seen],
  )

  return (
    <Container className="page updates-page">
      <h1>
        Updates
        {unreadCount > 0 && (
          <span className="updates-count"> ({unreadCount})</span>
        )}
      </h1>
      <p className="page-lead">
        Changes to the programme, the venue and the practical info – newest
        first.
      </p>

      {items.length === 0 ? (
        <p>No updates yet.</p>
      ) : (
        <ol className="updates-timeline">
          {items.map((u, i) => {
            const unread = String(u.date) > seen
            const dateText = formatUpdateDate(u.date)
            const timeText = formatUpdateTime(String(u.date))
            const showDate =
              i === 0 || formatUpdateDate(items[i - 1].date) !== dateText
            return (
              <li
                className={`updates-row${unread ? ' updates-row--unread' : ''}`}
                key={i}
              >
                <div className="updates-row__when">
                  {showDate && (
                    <span className="updates-row__date">{dateText}</span>
                  )}
                  {timeText && (
                    <span className="updates-row__time">{timeText}</span>
                  )}
                </div>
                <span className="updates-row__node" aria-hidden="true" />
                <div className="updates-card">
                  <span className="updates-card__icon">
                    <BellIcon />
                  </span>
                  <div className="updates-card__body">
                    <span className="updates-card__head">
                      <strong>{subpageLabel(u.page)}</strong> updated
                    </span>
                    <span className="updates-card__text">{u.text}</span>
                  </div>
                  <span className="updates-card__time">
                    {relativeLabel(u.date)}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </Container>
  )
}
