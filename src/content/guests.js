// Gjestelista. Legg til så mange du vil – rekkefølgen her blir rekkefølgen på siden.
//
// Hver gjest:
//   name      – navn
//   relation  – kort undertekst (valgfritt), f.eks. «Barndomsvenn»
//   text      – litt om personen (valgfritt)
//   image     – { src, alt }. Uten bilde vises en nøytral plassholder.

export const guests = [
  {
    name: 'Fornavn Etternavn',
    relation: 'Barndomsvenn',
    text: 'Kort tekst om personen – hvordan dere kjenner hverandre, en morsom detalj, eller hva de driver med til daglig.',
    image: { src: '/images/gjest.svg', alt: '' },
  },
  {
    name: 'Fornavn Etternavn',
    relation: 'Kollega',
    text: 'Kort tekst om personen.',
    image: { src: '/images/gjest.svg', alt: '' },
  },
  {
    name: 'Fornavn Etternavn',
    relation: 'Studievenn',
    text: 'Kort tekst om personen.',
    image: { src: '/images/gjest.svg', alt: '' },
  },
]
