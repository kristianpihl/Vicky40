import { updates as manualUpdates } from '../content/updates.js'
import { site } from '../content/site.js'

const SEEN_KEY = 'vickie-updates-seen'

// Every visible nav link (locked "Coming soon" ones included – they still have
// a label; whether the feed may talk about them is decided per-page below).
const feedPages = site.navLinks.filter((l) => !l.hidden)

// '/program' -> 'Programme'. Returns null for anything that isn't a nav link.
export function subpageLabel(path) {
  const link = feedPages.find((l) => l.to === path)
  return link ? link.label : null
}

// A page is eligible for the feed if it's a visible nav link that is either
// already clickable, or a "Coming soon" one that the admin has unlocked.
//   unlocked: { '/oslo': bool, '/guests': bool }
function isEligible(path, unlocked = {}) {
  const link = feedPages.find((l) => l.to === path)
  if (!link) return false
  if (link.comingSoon && !unlocked[path]) return false
  return true
}

// --- "new since last visit" (localStorage) ---

export function getUpdatesSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) || ''
  } catch {
    return ''
  }
}

export function markUpdatesSeen(newestDate) {
  if (!newestDate) return
  try {
    localStorage.setItem(SEEN_KEY, String(newestDate))
  } catch {
    /* ignore */
  }
}

// --- date formatting (accepts 'YYYY-MM-DD', 'YYYY-MM-DDTHH:MM' or a full ISO timestamp) ---

export function formatUpdateDate(iso) {
  try {
    return new Date(String(iso).replace(' ', 'T')).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function formatUpdateTime(iso) {
  if (
    typeof iso !== 'string' ||
    !/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(iso)
  ) {
    return ''
  }
  try {
    return new Date(iso.replace(' ', 'T')).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return ''
  }
}

// --- the feed itself ---

const AUTO_TEXT = {
  '/program': 'The programme was updated.',
  '/faq': 'The practical info was updated.',
  '/venue': 'The venue page was updated.',
  '/oslo': "There's something new in Vickie's Oslo.",
  '/guests': 'The guest list was updated.',
}
const AUTO_KEY = {
  '/program': 'program',
  '/faq': 'faq',
  '/venue': 'venue',
  '/oslo': 'oslo',
  '/guests': 'guests',
}

// Merge the hand-written updates.js entries with automatic "X was updated"
// entries derived from when each page's content last changed in the admin.
// An auto entry is left out for a page if there's a hand-written entry for
// that page on the same day or later (the written note wins). Locked
// "Coming soon" pages contribute nothing until the admin unlocks them.
//   contentTimes: { program?, faq?, venue?, oslo?, guests? } (iso strings) | null
//   unlocked:     { '/oslo': bool, '/guests': bool }
export function buildFeed(contentTimes, unlocked = {}) {
  const manual = manualUpdates
    .filter((u) => isEligible(u.page, unlocked))
    .map((u) => ({ date: u.date, page: u.page, text: u.text, source: 'manual' }))

  const newestManualDay = {}
  for (const u of manual) {
    const d = String(u.date).slice(0, 10)
    if (!newestManualDay[u.page] || d > newestManualDay[u.page]) {
      newestManualDay[u.page] = d
    }
  }

  const auto = []
  if (contentTimes) {
    for (const page of Object.keys(AUTO_TEXT)) {
      if (!isEligible(page, unlocked)) continue
      const ts = contentTimes[AUTO_KEY[page]]
      if (!ts) continue
      const day = String(ts).slice(0, 10)
      if (newestManualDay[page] && day <= newestManualDay[page]) continue
      auto.push({ date: ts, page, text: AUTO_TEXT[page], source: 'auto' })
    }
  }

  return [...manual, ...auto].sort((a, b) => new Date(b.date) - new Date(a.date))
}

// How many feed items for this page are less than `hours` old.
export function recentCountFor(items, pathname, hours = 24) {
  const windowMs = hours * 60 * 60 * 1000
  const now = Date.now()
  return items.filter((u) => {
    if (u.page !== pathname) return false
    const t = new Date(String(u.date).replace(' ', 'T')).getTime()
    return !Number.isNaN(t) && now - t <= windowMs
  }).length
}
