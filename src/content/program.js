// Programmet for helgen. Rediger fritt.
//
// Hver dag har: day (navn), date (tekst), og en liste events.
// Hvert event har: time, title, og valgfritt location og description.
// En dag uten events viser bare «kommer»-tekst.

export const program = [
  {
    day: 'Torsdag',
    date: '18. februar',
    events: [
      {
        time: '18:00',
        title: 'Uformell samling',
        location: 'Baren på hotellet',
        description: 'For de som kommer allerede torsdag – ingen påmelding nødvendig.',
      },
    ],
  },
  {
    day: 'Fredag',
    date: '19. februar',
    events: [
      {
        time: '12:00',
        title: 'Lunsj og byvandring',
        location: 'Møtes i sentrum',
        description: 'Vi rusler rundt og ser litt på byen. Kle deg for været.',
      },
      {
        time: '19:00',
        title: 'Felles middag',
        location: '[Restaurant]',
        description: 'Bordet er reservert. Gi beskjed i påmeldingen hvis du blir med.',
      },
    ],
  },
  {
    day: 'Lørdag',
    date: '20. februar',
    events: [
      {
        time: '11:00',
        title: 'Sen frokost',
        location: 'Hotellet',
      },
      {
        time: '18:00',
        title: 'Middag og fest',
        location: '[Lokalet]',
        description: 'Kveldens hovedbegivenhet. Mer info kommer.',
      },
    ],
  },
  {
    day: 'Søndag',
    date: '21. februar',
    events: [
      {
        time: '11:00',
        title: 'Avslutning og farvel',
        location: 'Hotellet',
        description: 'Kaffe og noe å bite i før alle drar hver til sitt.',
      },
    ],
  },
]
