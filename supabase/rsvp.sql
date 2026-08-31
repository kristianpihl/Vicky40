-- RSVP-tabell for påmeldingsskjemaet.
-- Kjør denne i Supabase: SQL Editor -> New query -> lim inn -> Run.

create table if not exists public.rsvp (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contact_email text,
  comment text,
  -- people: liste med objekter, ett per påmeldt person, f.eks.
  -- [{ "name": "Kari Nordmann", "days": ["Fredag","Lørdag"], "allergies": "Nøtter" }]
  people jsonb not null
);

alter table public.rsvp enable row level security;

-- Gjester (anon-nøkkelen) kan sende inn svar, men ikke lese andres svar.
-- Du leser påmeldingene selv i Supabase (Table editor).
create policy "Alle kan sende inn RSVP"
  on public.rsvp
  for insert
  to anon
  with check (true);
