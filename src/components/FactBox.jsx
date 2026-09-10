import { Fragment } from 'react'

// Parse the venue "fact box" text: one "Label: Value" per line.
export function parseFacts(text) {
  return String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf(':')
      return i === -1
        ? { term: '', def: line }
        : { term: line.slice(0, i).trim(), def: line.slice(i + 1).trim() }
    })
}

// The "At a glance" box shown beside the venue text.
export default function FactBox({ text }) {
  const rows = parseFacts(text)
  if (rows.length === 0) return null
  return (
    <aside className="fact-box">
      <h2>At a glance</h2>
      <dl>
        {rows.map((r, i) => (
          <Fragment key={i}>
            {r.term ? <dt>{r.term}</dt> : null}
            <dd>{r.def}</dd>
          </Fragment>
        ))}
      </dl>
    </aside>
  )
}
