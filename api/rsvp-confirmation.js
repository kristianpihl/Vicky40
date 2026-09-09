// Sends a confirmation / summary email to a guest after they submit the RSVP,
// to the email address they entered in the form.
//
// This runs on Vercel as a serverless function. It is triggered by a Supabase
// Database Webhook (Supabase dashboard -> Database -> Webhooks) on INSERT into
// public.rsvp, which POSTs the new row here. See README.md for the full setup.
//
// Required Vercel environment variables:
//   RESEND_API_KEY      - API key from https://resend.com  (API Keys)
//   RSVP_WEBHOOK_SECRET - any long random string; must match the value of the
//                         "x-webhook-secret" HTTP header set on the Supabase webhook
//   RSVP_FROM           - sender, e.g.  Vickie 40 <fest@kristianpihl.no>
//                         (the domain must be verified in Resend)
// Optional:
//   RSVP_REPLY_TO       - where guests' replies should go (e.g. your own email)

const PARTY_NAME = "Vickie's 40th birthday"
const PARTY_WHEN = '5–6 February 2027, Oslo'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const secret = process.env.RSVP_WEBHOOK_SECRET
  if (!secret || req.headers['x-webhook-secret'] !== secret) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RSVP_FROM
  if (!apiKey || !from) {
    console.error('rsvp-confirmation: RESEND_API_KEY or RSVP_FROM is not set')
    res.status(500).json({ error: 'Email is not configured' })
    return
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body
  const record = body && body.record
  if (!record || !record.contact_email) {
    // No email on the submission – nothing to send, and that's fine.
    res.status(200).json({ skipped: true })
    return
  }

  const to = String(record.contact_email).trim()
  const cancelled = record.cancelled === true
  const people = asArray(record.people)
  const events = asArray(record.events)

  const subject = cancelled
    ? `Cancellation received – ${PARTY_NAME}`
    : `RSVP received – ${PARTY_NAME}`
  const { html, text } = cancelled
    ? cancellationEmail({ people, record })
    : confirmationEmail({ people, events, record })

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: process.env.RSVP_REPLY_TO || undefined,
        subject,
        html,
        text,
      }),
    })
    if (!r.ok) {
      console.error('Resend error', r.status, await r.text())
      res.status(502).json({ error: 'Email send failed' })
      return
    }
  } catch (err) {
    console.error('Resend request failed', err)
    res.status(502).json({ error: 'Email send failed' })
    return
  }

  res.status(200).json({ sent: true })
}

function safeJson(s) {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}

function asArray(v) {
  if (Array.isArray(v)) return v
  if (typeof v === 'string') {
    try {
      const p = JSON.parse(v)
      return Array.isArray(p) ? p : []
    } catch {
      return []
    }
  }
  return []
}

function esc(s) {
  return String(s ?? '').replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  )
}

function personLines(people) {
  return people.map((p, i) => {
    const bits = [p.name || `Guest ${i + 1}`]
    if (p.phone) bits.push(`phone ${p.phone}`)
    if (p.allergies) bits.push(`allergies: ${p.allergies}`)
    return bits.join(' · ')
  })
}

function stayLine(record, events) {
  if (record.sleeping_at_cabin) {
    return `Staying at the cabin${
      record.arrival_day ? `, arriving ${record.arrival_day}` : ''
    }`
  }
  return events.length
    ? `Not staying at the cabin · joining: ${events.join(', ')}`
    : 'Not staying at the cabin'
}

function shell(inner) {
  return `<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#262223;line-height:1.6;max-width:520px">${inner}</div>`
}

function confirmationEmail({ people, events, record }) {
  const lines = personLines(people)
  const stay = stayLine(record, events)

  const text = [
    `Thanks! We've registered your RSVP for ${PARTY_NAME} (${PARTY_WHEN}).`,
    '',
    'What you sent:',
    ...lines.map((l) => `  - ${l}`),
    `  ${stay}`,
    record.comment ? `  Comment: ${record.comment}` : null,
    '',
    "Need to change something? Just fill in the form again with this same email address – we'll use your most recent answer.",
    'This message is only a confirmation; no reply is needed.',
  ]
    .filter(Boolean)
    .join('\n')

  const html = shell(`
    <h2 style="margin:0 0 .5rem;color:#1f6152">You're on the list 🎉</h2>
    <p style="margin:0 0 1rem">We've registered your RSVP for <strong>${esc(
      PARTY_NAME,
    )}</strong> (${esc(PARTY_WHEN)}).</p>
    <p style="margin:0 0 .35rem;font-weight:700">What you sent</p>
    <ul style="margin:0 0 1rem;padding-left:1.1rem">
      ${lines.map((l) => `<li>${esc(l)}</li>`).join('')}
    </ul>
    <p style="margin:0 0 1rem">${esc(stay)}</p>
    ${
      record.comment
        ? `<p style="margin:0 0 1rem"><em>Comment:</em> ${esc(record.comment)}</p>`
        : ''
    }
    <p style="margin:0 0 .5rem;color:#6b6560;font-size:.9rem">Need to change something? Just fill in the form again with this same email address – we'll use your most recent answer.</p>
    <p style="margin:0;color:#6b6560;font-size:.9rem">This message is only a confirmation; no reply is needed.</p>
  `)

  return { html, text }
}

function cancellationEmail({ people, record }) {
  const names = people
    .map((p) => p.name)
    .filter(Boolean)
    .join(', ')

  const text = [
    `We've registered your cancellation for ${PARTY_NAME}.`,
    names ? `Name(s): ${names}` : null,
    record.comment ? `Reason: ${record.comment}` : null,
    '',
    'Changed your mind? Fill in the RSVP form again with this same email address.',
  ]
    .filter(Boolean)
    .join('\n')

  const html = shell(`
    <h2 style="margin:0 0 .5rem;color:#1f6152">Cancellation received</h2>
    <p style="margin:0 0 1rem">We've registered your cancellation for <strong>${esc(
      PARTY_NAME,
    )}</strong>.${names ? ` (${esc(names)})` : ''}</p>
    ${
      record.comment
        ? `<p style="margin:0 0 1rem"><em>Reason:</em> ${esc(record.comment)}</p>`
        : ''
    }
    <p style="margin:0;color:#6b6560;font-size:.9rem">Changed your mind? Fill in the RSVP form again with this same email address.</p>
  `)

  return { html, text }
}
