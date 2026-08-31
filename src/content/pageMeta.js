// Fane-titler (og valgfri beskrivelse) per side.
// Nøkkelen er nettadressen – samme som i src/routes.jsx.
// Uten «title» brukes bare sidenavnet ([NAVN] 40 år).

export const pageMeta = {
  '/': {
    description:
      'Alt om 40-årsfeiringen – program, påmelding, gjester og praktisk info.',
  },
  '/rsvp': { title: 'Meld deg på', description: 'Meld deg og eventuelle følgesvenner på feiringen.' },
  '/program': { title: 'Program', description: 'Hva skjer når og hvor, dag for dag.' },
  '/gjester': { title: 'Gjester', description: 'Bli litt kjent med hvem du møter i helgen.' },
  '/hvem-kommer-hvilken-dag': { title: 'Hvem kommer hvilken dag' },
  '/stedet': { title: 'Stedet' },
  '/oslo': { title: 'Om Oslo' },
  '/oslo/barer': { title: 'Barer i Oslo' },
  '/praktisk-info': { title: 'Praktisk info' },
  '/bilder': { title: 'Bilder' },
  '/promo-video': { title: 'Promo-video' },
}
