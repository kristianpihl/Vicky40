import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { site } from '../content/site.js'

// Full-bredde knapper til undersidene, stablet under hverandre.
// Bruker samme liste som toppbaren (site.navLinks) – send inn en egen
// liste via prop hvis du vil ha andre knapper her senere.
export default function SubpageButtons({ links = site.navLinks }) {
  return (
    <nav className="subpage-buttons d-grid gap-2" aria-label="Undersider">
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
