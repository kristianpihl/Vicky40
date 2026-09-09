import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { site } from '../content/site.js'

// Full-width buttons to the other pages, stacked on top of each other.
// Uses the same list as the top bar (site.navLinks) – pass your own list
// via a prop if you want different buttons here later.
//   `hidden: true`     -> left out
//   `comingSoon: true` -> shown locked with a "Coming soon" banner
export default function SubpageButtons({ links = site.navLinks }) {
  return (
    <nav className="subpage-buttons d-grid gap-2" aria-label="Other pages">
      {links
        .filter((link) => !link.hidden)
        .map((link) =>
          link.comingSoon ? (
            <div className="subpage-locked" key={link.to}>
              <span className="subpage-badge">Coming soon</span>
              <Button
                variant="outline-primary"
                size="lg"
                className="subpage-button"
                disabled
                aria-disabled="true"
              >
                {link.label}
              </Button>
            </div>
          ) : (
            <Button
              key={link.to}
              as={Link}
              to={link.to}
              variant="outline-primary"
              size="lg"
              className="subpage-button"
            >
              {link.label}
            </Button>
          ),
        )}
    </nav>
  )
}
