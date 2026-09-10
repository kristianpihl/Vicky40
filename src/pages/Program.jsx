import ProgramTemplate from '../templates/ProgramTemplate.jsx'

// The content is edited at /admin/program (stored in Supabase).
// Save the side photo as public/images/programme.jpg (or change the path here).
const image = { src: '/images/programme.jpg', alt: 'Vickie in Italy' }

export default function Program() {
  return <ProgramTemplate sideImage={image} />
}
