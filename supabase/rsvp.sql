-- RSVP table for the sign-up form.
-- Run this in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.

create table if not exists public.rsvp (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contact_email text,
  comment text,
  -- people: a list of objects, one per signed-up person, e.g.
  -- [{ "name": "Kari Nordmann", "days": ["Friday","Saturday"], "allergies": "Nuts" }]
  people jsonb not null
);

-- Let the anon role (the public key) add rows.
-- Without this you get "permission denied for table rsvp" (42501).
grant insert on table public.rsvp to anon;

alter table public.rsvp enable row level security;

-- Guests (the anon key) can submit answers, but not read others' answers.
-- You read the RSVPs yourself in Supabase (Table editor).
drop policy if exists "Alle kan sende inn RSVP" on public.rsvp;
drop policy if exists "Anyone can submit an RSVP" on public.rsvp;
create policy "Anyone can submit an RSVP"
  on public.rsvp
  for insert
  to anon
  with check (true);
