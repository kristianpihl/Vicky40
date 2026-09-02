// The guest list. Add as many as you like – the order here is the order on the page.
//
// Each guest:
//   name      – name
//   relation  – short subtitle (optional), e.g. "Childhood friend"
//   text      – a little about the person (optional)
//   image     – { src, alt }. Without an image a neutral placeholder is shown.

export const guests = [
  {
    name: 'First Last',
    relation: 'Childhood friend',
    text: 'A short bit about this person – how you know each other, a fun detail, or what they do for a living.',
    image: { src: '/images/gjest.svg', alt: '' },
  },
  {
    name: 'First Last',
    relation: 'Colleague',
    text: 'A short bit about this person.',
    image: { src: '/images/gjest.svg', alt: '' },
  },
  {
    name: 'First Last',
    relation: 'University friend',
    text: 'A short bit about this person.',
    image: { src: '/images/gjest.svg', alt: '' },
  },
]
