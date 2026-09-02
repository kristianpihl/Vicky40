import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { site } from '../content/site.js'

// Full-width buttons to the other pages, stacked on top of each other.
// Uses the same list as the top bar (site.navLinks) – pass your own list
// via a prop if you want different buttons here later.
export default function SubpageButtons({ links = site.navLinks }) {
  return (
    <nav className="subpage-buttons d-grid gap-2" aria-label="Other pages">
      {links.map((link) => (
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
      ))}
    </nav>
  )
}
