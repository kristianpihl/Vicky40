import ListTemplate from '../templates/ListTemplate.jsx'

// EXAMPLE PAGE showing the list template in use.
// Edit the content, or delete this file + the route in routes.jsx if you
// don't want it.
const bars = [
  {
    href: 'https://example.com',
    image: { src: '/images/liste.svg', alt: '' },
    title: 'Bar name 1',
    ingress: 'A short description – the vibe, what the place is known for, and where it is.',
  },
  {
    href: 'https://example.com',
    image: { src: '/images/liste.svg', alt: '' },
    title: 'Bar name 2',
    ingress: 'A short description – the vibe, what the place is known for, and where it is.',
  },
  {
    href: 'https://example.com',
    image: { src: '/images/liste.svg', alt: '' },
    title: 'Bar name 3',
    ingress: 'A short description – the vibe, what the place is known for, and where it is.',
  },
]

export default function OsloBars() {
  return (
    <ListTemplate
      title="Bars we like in Oslo"
      intro="A small selection for those who want a night out between the events."
      items={bars}
    />
  )
}
