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
