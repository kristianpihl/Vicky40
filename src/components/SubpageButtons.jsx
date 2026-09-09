import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { site } from '../content/site.js'
import { recentChangeCount } from './LatestUpdate.jsx'

// Bell with a red count, shown on a subpage button when the feed has a
// change for that page in the last 24 hours (see src/content/updates.js).
function ChangeBell({ count }) {
  return (
    <span
      className="subpage-bell"
      aria-label={`${count} update${count === 1 ? '' : 's'} in the last 24 hours`}
    >
      <span className="subpage-bell__icon">
        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2a6 6 0 0 0-6 6c0 3.09-.79 5.2-1.63 6.6-.5.82.1 1.9 1.05 1.9h13.16c.95 0 1.55-1.08 1.05-1.9C18.79 13.2 18 11.09 18 8a6 6 0 0 0-6-6Z"
          />
          <path fill="currentColor" d="M10 19a2 2 0 0 0 4 0h-4Z" />
        </svg>
      </span>
      <span className="subpage-bell__count">{count}</span>
    </span>
  )
}

// Full-width buttons to the other pages, stacked on top of each other.
// Uses the same list as the top bar (site.navLinks) – pass your own list
// via a prop if you want different buttons here later.
//   `hidden: true`     -> left out
//   `comingSoon: true` -> shown locked, with a "Coming soon" badge after the label
export default function SubpageButtons({ links = site.navLinks }) {
  return (
    <nav className="subpage-buttons d-grid gap-2" aria-label="Other pages">
      {links
        .filter((link) => !link.hidden)
        .map((link) => {
          if (link.comingSoon) {
            return (
              <Button
                key={link.to}
                variant="outline-primary"
                size="lg"
                className="subpage-button subpage-button--locked"
                disabled
                aria-disabled="true"
              >
                {link.label}
                <span className="subpage-badge">Coming soon</span>
              </Button>
            )
          }

          const changes = recentChangeCount(link.to)
          return (
            <Button
              key={link.to}
              as={Link}
              to={link.to}
              variant="outline-primary"
              size="lg"
              className="subpage-button"
            >
              {link.label}
              {changes > 0 && <ChangeBell count={changes} />}
            </Button>
          )
        })}
    </nav>
  )
}
