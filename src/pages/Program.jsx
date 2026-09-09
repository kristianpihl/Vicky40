import ProgramTemplate from '../templates/ProgramTemplate.jsx'

// The content lives in src/content/program.js
// Save the file as public/images/programme.jpg (or change the name/path here).
const image = { src: '/images/programme.jpg', alt: 'Vickie in Italy' }

export default function Program() {
  return <ProgramTemplate sideImage={image} />
}
