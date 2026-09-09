// "What's new" for guests – a log of changes to the subpages.
//
// One entry per change to a subpage (Programme, The venue, F&Q's, and any
// new subpages added later). Newest entry first.
//
//   date: 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM' – when it changed. Add the time
//         part if you want a clock time on the updates page, e.g.
//         '2026-09-09T14:30'.
//   page: '/program'     – which subpage changed. Use the paths from
//                          src/content/site.js: '/program', '/venue', '/faq'.
//   text: 'What changed' – short note on what was added or changed
//
// Only entries pointing at a real, visible subpage are shown. If such an
// entry is less than 24 hours old, that page's button on the front page
// also gets a bell with a count.

export const updates = [
  {
    date: '2026-09-09T18:00',
    page: '/program',
    text: 'Programme page started – the weekend plan will be filled in here.',
  },
]
