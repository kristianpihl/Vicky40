# Vicky40

Website for a 40th birthday celebration. Built with Vite + React + React Router +
React-Bootstrap, with Supabase for RSVP and photo uploads. Deployed on Vercel.

## Getting started locally

```bash
npm install
npm run dev
```

Open the address Vite prints (usually http://localhost:5173).

## Environment variables

Copy `.env.example` to `.env` and fill in the values from Supabase
(Settings → API). The same two variables must also be set in Vercel under
Project Settings → Environment Variables:

| Variable                 | What                                   |
| ------------------------ | -------------------------------------- |
| `VITE_SUPABASE_URL`      | Project URL from Supabase              |
| `VITE_SUPABASE_ANON_KEY` | Publishable / anon key from Supabase   |

## Database (Supabase)

Run these once in Supabase → SQL Editor:

| File                  | Creates                                          |
| --------------------- | ----------------------------------------------- |
| `supabase/rsvp.sql`   | Table for RSVPs                                 |
| `supabase/photos.sql` | Table + storage bucket for photo uploads        |

RSVPs are read in the Table editor (`rsvp`). Uploaded photos only appear in the
gallery once `approved` is set to `true` on the row in `photos`.

## RSVP confirmation emails

When a guest submits the form, they get a summary email at the address they
entered. This uses a small serverless function (`api/rsvp-confirmation.js`) that
Supabase calls whenever a new RSVP row is inserted, and [Resend](https://resend.com)
to actually send the mail. All free tier.

Setup (once):

1. **Resend** – create an account, add the sending domain (e.g.
   `kristianpihl.no` or a subdomain like `send.kristianpihl.no`), add the DNS
   records it shows you, and wait for it to verify. Then create an API key.
2. **Vercel** – Project Settings → Environment Variables, add:

   | Variable              | Value                                              |
   | --------------------- | -------------------------------------------------- |
   | `RESEND_API_KEY`      | the key from Resend                                |
   | `RSVP_WEBHOOK_SECRET` | any long random string (make one up)               |
   | `RSVP_FROM`           | e.g. `Vickie 40 <fest@kristianpihl.no>`            |
   | `RSVP_REPLY_TO`       | (optional) where guest replies should go           |

   Redeploy after adding them.
3. **Supabase** – Database → Webhooks → Create a new hook:
   - Table `public.rsvp`, event **Insert**
   - Type **HTTP Request**, method **POST**
   - URL `https://vicky40.vercel.app/api/rsvp-confirmation`
   - Add an HTTP header: name `x-webhook-secret`, value = the same string you
     used for `RSVP_WEBHOOK_SECRET`

Re-submissions send a fresh summary; cancellations send a short "cancellation
received" note. Admin edits do not trigger an email.

## Folder structure

```
src/
  main.jsx            Entry point – React + Router + CSS
  App.jsx             Shared frame: Topbar + content + Footer
  routes.jsx          All URLs
  index.css           Colour palette and global styles
  lib/
    supabaseClient.js Shared Supabase client
  content/
    site.js           Name, date, top-bar links
    program.js        The programme, day by day
    guests.js         The guest list
    pageMeta.js       Browser-tab titles per page
  components/         Reusable pieces (Topbar, Footer, Countdown ...)
  templates/          The templates (front, article, list, programme, guests, gallery)
  pages/             One file per page, uses a template + content
  forms/             RsvpForm and PhotoUploadForm
```

## Before launch

- Replace `Vickie` in `src/content/site.js` and `index.html` if the name changes.
- Add your own images to `public/images/` and a share image `public/og-bilde.jpg`
  (1200 × 630), and update the path in `index.html`.
- `index.html` has `<meta name="robots" content="noindex" />` because this is a
  private party. Remove that line if the site should be findable in Google.

## Build for production

```bash
npm run build      # creates the dist/ folder
npm run preview    # preview the production build locally
```
