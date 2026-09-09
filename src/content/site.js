// Central settings for the whole site – edit text and links here.

export const site = {
  // The name of the person turning 40.
  personName: 'Vickie',
  title: 'Vickie turns 40!',
  tagline: 'Come celebrate – a weekend in Oslo.',

  // When the party starts. Used by the countdown on the front page.
  // Order: year, month (0 = January, 1 = February ...), day, hour, minute.
  partyStart: new Date(2027, 1, 20, 18, 0, 0),

  // RSVP form options.
  // arrivalDays: when someone sleeping at the cabin can arrive (pick one).
  // eventDays:   which events a day guest can join (pick any).
  arrivalDays: ['Thursday', 'Friday', 'Saturday'],
  eventDays: ['Friday', 'Saturday'],

  // The links in the top bar and the front-page buttons.
  // Add `hidden: true` to a link to take it out of both places without
  // removing the page (you can still reach it by URL). Delete the flag to
  // bring the link back.
  navLinks: [
    { label: 'Programme', to: '/program' },
    { label: 'Guests', to: '/guests', hidden: true },
    { label: "Who's coming when", to: '/who-is-coming-when', hidden: true },
    { label: 'The venue', to: '/venue' },
    { label: 'Oslo', to: '/oslo' },
    { label: 'Practical info', to: '/faq' },
    // Photos has its own "Upload photos" button on the front page (and in the
    // mobile menu), so it is kept out of the link lists here.
    { label: 'Photos', to: '/photos', hidden: true },
    { label: 'Promo video', to: '/promo-video', hidden: true },
  ],
}
