import ListTemplate from '../templates/ListTemplate.jsx'

// EKSEMPELSIDE som viser listevisnings-malen i bruk.
// Endre innholdet, eller slett denne fila + ruten i routes.jsx hvis du
// ikke vil ha den.
const bars = [
  {
    href: 'https://example.com',
    image: { src: '/images/liste.svg', alt: '' },
    title: 'Navn på bar 1',
    ingress: 'Kort beskrivelse – stemning, hva stedet er kjent for, og hvor det ligger.',
  },
  {
    href: 'https://example.com',
    image: { src: '/images/liste.svg', alt: '' },
    title: 'Navn på bar 2',
    ingress: 'Kort beskrivelse – stemning, hva stedet er kjent for, og hvor det ligger.',
  },
  {
    href: 'https://example.com',
    image: { src: '/images/liste.svg', alt: '' },
    title: 'Navn på bar 3',
    ingress: 'Kort beskrivelse – stemning, hva stedet er kjent for, og hvor det ligger.',
  },
]

export default function OsloBars() {
  return (
    <ListTemplate
      title="Barer vi liker i Oslo"
      intro="Et lite utvalg for de som vil på byen mellom slagene."
      items={bars}
    />
  )
}
