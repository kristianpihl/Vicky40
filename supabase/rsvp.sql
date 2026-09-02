-- RSVP-tabell for påmeldingsskjemaet.
-- Kjør denne i Supabase: SQL Editor -> New query -> lim inn -> Run.
-- Trygg å kjøre flere ganger.

create table if not exists public.rsvp (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contact_email text,
  comment text,
  -- people: liste med objekter, ett per påmeldt person, f.eks.
  -- [{ "name": "Kari Nordmann", "days": ["Fredag","Lørdag"], "allergies": "Nøtter" }]
  people jsonb not null
);

-- Gi anon-rollen (den offentlige nøkkelen) lov til å legge til rader.
-- Uten denne får man «permission denied for table rsvp» (42501).
grant insert on table public.rsvp to anon;

alter table public.rsvp enable row level security;

-- Gjester (anon-nøkkelen) kan sende inn svar, men ikke lese andres svar.
-- Du leser påmeldingene selv i Supabase (Table editor).
drop policy if exists "Alle kan sende inn RSVP" on public.rsvp;
create policy "Alle kan sende inn RSVP"
  on public.rsvp
  for insert
  to anon
  with check (true);
