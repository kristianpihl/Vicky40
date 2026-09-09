import { useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { updates } from '../content/updates.js'
import {
  markUpdatesSeen,
  formatUpdateDate,
} from '../components/LatestUpdate.jsx'

export default function Updates() {
  // Looking at this page counts as "seen", so the front-page mark clears.
  useEffect(() => {
    markUpdatesSeen()
  }, [])

  return (
    <Container className="page updates-page">
      <h1>Updates</h1>
      <p className="page-lead">What's changed on the site, newest first.</p>

      {updates.length === 0 ? (
        <p>No updates yet.</p>
      ) : (
        <ul className="updates-list">
          {updates.map((u, i) => (
            <li className="updates-item" key={i}>
              <span className="updates-item__date">
                {formatUpdateDate(u.date)}
              </span>
              <span className="updates-item__text">{u.text}</span>
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}
