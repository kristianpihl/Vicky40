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
    date: '2026-09-09T22:00',
    page: '/faq',
    text: 'Practical info filled in: RSVP deadline, how to change or cancel, food, dress code per day, gifts, staying over, and lost-and-found at Solstua.',
  },
  {
    date: '2026-09-09T21:30',
    page: '/program',
    text: 'Programme dates set to the actual weekend (Thu 04.02 – Sun 07.02), and every part of the weekend is at Solstua.',
  },
  {
    date: '2026-09-09T20:30',
    page: '/venue',
    text: 'The venue is set: Solstua at Voksenkollen. Address, the rooms, how to get there and a quick fact box are all on the page now.',
  },
  {
    date: '2026-09-09T18:00',
    page: '/program',
    text: 'Programme page started – the weekend plan will be filled in here.',
  },
]
