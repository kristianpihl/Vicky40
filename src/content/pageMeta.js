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
  '/guests': {
    title: 'Get to know my guests',
    description: "A little about the people you'll meet during the weekend.",
  },
  '/who-is-coming-when': { title: "Who's coming when" },
  '/venue': {
    title: 'The venue',
    description: 'Solstua at Voksenkollen – a 1905 villa in the forest above Oslo.',
  },
  '/oslo': { title: "Vickie's Oslo" },
  '/faq': { title: 'Practical info' },
  '/photos': { title: 'Upload photos' },
  '/promo-video': { title: 'Promo video' },
  '/updates': { title: 'Updates', description: "What's changed on the site." },
  '/admin': { title: 'Admin' },
  '/admin/rsvps': { title: 'RSVPs' },
  '/admin/photos': { title: 'Photos' },
  '/admin/program': { title: 'Edit programme' },
  '/admin/faq': { title: 'Edit F&Q' },
  '/admin/front': { title: 'Edit front page' },
  '/admin/venue': { title: 'Edit venue page' },
  '/admin/oslo': { title: "Edit Vickie's Oslo" },
  '/admin/guests': { title: 'Edit guest list' },
}
