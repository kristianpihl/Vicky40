import ProgramTemplate from '../templates/ProgramTemplate.jsx'

// The content lives in src/content/program.js
// Swap in your own image file, e.g. '/images/programme.jpg'
const image = { src: '/images/artikkel.svg', alt: 'Programme' }

export default function Program() {
  return <ProgramTemplate sideImage={image} />
}
