import PageContentEditor from '../components/PageContentEditor.jsx'

const FIELDS = [
  { label: 'Heading', key: 'front.heading', mode: 'text' },
  { label: 'Intro text', key: 'front.intro', mode: 'markdown' },
]

export default function AdminFront() {
  return (
    <PageContentEditor
      title="Edit front page"
      lead="The heading and the text just under it, on the home page. Changes go live right away (this doesn't show in the 'Latest update' feed)."
      fields={FIELDS}
    />
  )
}
