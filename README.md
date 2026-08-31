# Vicky40

Nettside til en 40-årsfeiring. Bygget med Vite + React + React Router +
React-Bootstrap, med Supabase for RSVP og bildeopplasting. Deployes på Vercel.

## Kom i gang lokalt

```bash
npm install
npm run dev
```

Åpne adressen Vite skriver ut (som regel http://localhost:5173).

## Miljøvariabler

Kopier `.env.example` til `.env` og fyll inn verdiene fra Supabase
(Settings → API). De samme to variablene må også ligge i Vercel under
Project Settings → Environment Variables:

| Variabel                 | Hva                                    |
| ------------------------ | -------------------------------------- |
| `VITE_SUPABASE_URL`      | Project URL fra Supabase               |
| `VITE_SUPABASE_ANON_KEY` | Publishable / anon key fra Supabase    |

## Database (Supabase)

Kjør disse én gang i Supabase → SQL Editor:

| Fil                  | Lager                                              |
| -------------------- | ------------------------------------------------- |
| `supabase/rsvp.sql`  | Tabell for påmeldinger                            |
| `supabase/photos.sql`| Tabell + storage-bucket for bildeopplasting       |

Påmeldinger leses i Table editor (`rsvp`). Opplastede bilder vises i galleriet
først når `approved` settes til `true` på raden i `photos`.

## Mappestruktur

```
src/
  main.jsx            Oppstart – React + Router + CSS
  App.jsx             Felles ramme: Topbar + innhold + Footer
  routes.jsx          Alle nettadresser
  index.css           Fargepalett og global stil
  lib/
    supabaseClient.js Delt Supabase-klient
  content/
    site.js           Navn, dato, lenker i toppbaren
    program.js        Programmet dag for dag
    guests.js         Gjestelista
    pageMeta.js       Fane-titler per side
  components/         Gjenbrukbare biter (Topbar, Footer, Countdown ...)
  templates/          Malene (fremside, artikkel, liste, program, gjester, galleri)
  pages/             Én fil per side, bruker en mal + innhold
  forms/             RsvpForm og PhotoUploadForm
```

## Før lansering

- Bytt ut `[NAVN]` i `src/content/site.js` og `index.html`.
- Legg inn egne bilder i `public/images/` og et delingsbilde `public/og-bilde.jpg`
  (1200 × 630), og oppdater stien i `index.html`.
- `index.html` har `<meta name="robots" content="noindex" />` fordi dette er en
  privat fest. Fjern linja hvis siden skal kunne finnes i Google.

## Bygg for produksjon

```bash
npm run build      # lager mappa dist/
npm run preview    # forhåndsvis produksjonsbygget lokalt
```
