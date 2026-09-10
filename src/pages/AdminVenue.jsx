import PageContentEditor from '../components/PageContentEditor.jsx'

const FIELDS = [
  { label: 'Main text', key: 'venue.body', mode: 'markdown' },
  { label: 'Fact box', key: 'venue.facts', mode: 'facts' },
]

export default function AdminVenue() {
  return (
    <PageContentEditor
      title="Edit venue page"
      lead="The main text and the fact box on /venue. Changes go live right away and show up in 'Latest update'."
      fields={FIELDS}
    />
  )
}
