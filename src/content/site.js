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
  // - `hidden: true`     leaves the link out entirely (the page can still be
  //                      reached by URL). Delete the flag to bring it back.
  // - `comingSoon: true` shows the button locked (not clickable) with a
  //                      "Coming soon" banner above it.
  navLinks: [
    { label: 'Programme', to: '/program' },
    { label: 'Guests', to: '/guests', hidden: true },
    { label: "Who's coming when", to: '/who-is-coming-when', hidden: true },
    { label: 'The venue', to: '/venue' },
    { label: "Vickie's Oslo", to: '/oslo', comingSoon: true },
    { label: 'Practical info', to: '/faq' },
    // Photos has its own "Upload photos" button on the front page (and in the
    // mobile menu), so it is kept out of the link lists here.
    { label: 'Photos', to: '/photos', hidden: true },
    { label: 'Promo video', to: '/promo-video', hidden: true },
  ],
}
