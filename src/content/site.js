// Sentrale innstillinger for hele nettsiden – endre tekst og lenker her.

export const site = {
  // Navn på 40-åringen. Bytt ut "[NAVN]" når du er klar.
  personName: '[NAVN]',
  title: '[NAVN] fyller 40!',
  tagline: 'Bli med og feir – en helg i Oslo.',

  // Når festen starter. Brukes av nedtelleren på fremsiden (kommer i steg 2).
  // Rekkefølge: år, måned (0 = januar, 1 = februar ...), dag, time, minutt.
  partyStart: new Date(2027, 1, 20, 18, 0, 0),

  // Dagene man kan melde seg på. Brukes av RSVP-skjemaet.
  partyDays: ['Torsdag', 'Fredag', 'Lørdag', 'Søndag'],

  // Lenkene i toppbaren. Legg til eller fjern etter behov –
  // hold gjerne lista kort, resten når man uansett fra fremsiden.
  navLinks: [
    { label: 'Program', to: '/program' },
    { label: 'Gjester', to: '/gjester' },
    { label: 'Hvem kommer hvilken dag', to: '/hvem-kommer-hvilken-dag' },
    { label: 'Stedet', to: '/stedet' },
    { label: 'Oslo', to: '/oslo' },
    { label: 'Praktisk info', to: '/praktisk-info' },
    { label: 'Bilder', to: '/bilder' },
    { label: 'Promo-video', to: '/promo-video' },
  ],
}
