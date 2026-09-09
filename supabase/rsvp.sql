-- RSVP table for the sign-up form.
-- Run this in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.

create table if not exists public.rsvp (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contact_email text,
  comment text,
  sleeping_at_cabin boolean,   -- true = staying overnight, false = day guest
  arrival_day text,            -- 'Thursday' | 'Friday' | 'Saturday' (only when sleeping at the cabin)
  events jsonb,                -- ["Friday","Saturday"] (only when NOT sleeping at the cabin)
  -- people: one object per person, e.g.
  -- [{ "name": "Kari Nordmann", "phone": "+47 900 00 000", "allergies": "Nuts" }]
  people jsonb not null
);

-- If the table already existed, add the newer columns:
alter table public.rsvp add column if not exists sleeping_at_cabin boolean;
alter table public.rsvp add column if not exists arrival_day text;
alter table public.rsvp add column if not exists events jsonb;

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
