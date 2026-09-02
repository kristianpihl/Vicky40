// Central settings for the whole site – edit text and links here.

export const site = {
  // The name of the person turning 40.
  personName: 'Vickie',
  title: 'Vickie turns 40!',
  tagline: 'Come celebrate – a weekend in Oslo.',

  // When the party starts. Used by the countdown on the front page.
  // Order: year, month (0 = January, 1 = February ...), day, hour, minute.
  partyStart: new Date(2027, 1, 20, 18, 0, 0),

  // The days people can sign up for. Used by the RSVP form.
  partyDays: ['Thursday', 'Friday', 'Saturday', 'Sunday'],

  // The links in the top bar. Add or remove as you like –
  // keep the list short; the rest is reachable from the front page anyway.
  navLinks: [
    { label: 'Programme', to: '/program' },
    { label: 'Guests', to: '/guests' },
    { label: "Who's coming when", to: '/who-is-coming-when' },
    { label: 'The venue', to: '/venue' },
    { label: 'Oslo', to: '/oslo' },
    { label: 'Practical info', to: '/faq' },
    { label: 'Photos', to: '/photos' },
    { label: 'Promo video', to: '/promo-video' },
  ],
}
