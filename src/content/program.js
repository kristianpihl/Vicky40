// The programme for the weekend. Edit freely.
//
// Each day has: day (name), date (text), and a list of events.
// Each event has: time, title, and optionally location and description.
// A day with no events just shows a "coming soon" line.

export const program = [
  {
    day: 'Thursday',
    date: 'February 18',
    events: [
      {
        time: '18:00',
        title: 'Informal get-together',
        location: 'The hotel bar',
        description: 'For those already arriving on Thursday – no sign-up needed.',
      },
    ],
  },
  {
    day: 'Friday',
    date: 'February 19',
    events: [
      {
        time: '12:00',
        title: 'Lunch and city walk',
        location: 'Meet in the city centre',
        description: "We'll wander around and see a bit of the city. Dress for the weather.",
      },
      {
        time: '19:00',
        title: 'Group dinner',
        location: '[Restaurant]',
        description: 'The table is booked. Let us know in your RSVP if you are joining.',
      },
    ],
  },
  {
    day: 'Saturday',
    date: 'February 20',
    events: [
      {
        time: '11:00',
        title: 'Late breakfast',
        location: 'The hotel',
      },
      {
        time: '18:00',
        title: 'Dinner and party',
        location: '[The venue]',
        description: 'The main event of the evening. More info to come.',
      },
    ],
  },
  {
    day: 'Sunday',
    date: 'February 21',
    events: [
      {
        time: '11:00',
        title: 'Wind-down and goodbyes',
        location: 'The hotel',
        description: 'Coffee and a bite to eat before everyone heads home.',
      },
    ],
  },
]
