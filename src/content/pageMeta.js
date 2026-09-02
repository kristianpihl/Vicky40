// Browser-tab titles (and optional description) per page.
// The key is the URL – same as in src/routes.jsx.
// Without a "title", only the site name is used (Vickie 40).

export const pageMeta = {
  '/': {
    description:
      'Everything about the 40th birthday weekend – programme, RSVP, guests and practical info.',
  },
  '/rsvp': { title: 'RSVP', description: 'Sign yourself and any guests up for the celebration.' },
  '/program': { title: 'Programme', description: "What's happening, when and where, day by day." },
  '/guests': { title: 'Guests', description: "Get to know who you'll meet during the weekend." },
  '/who-is-coming-when': { title: "Who's coming when" },
  '/venue': { title: 'The venue' },
  '/oslo': { title: 'About Oslo' },
  '/oslo/bars': { title: 'Bars in Oslo' },
  '/faq': { title: 'Practical info' },
  '/photos': { title: 'Photos' },
  '/promo-video': { title: 'Promo video' },
}
