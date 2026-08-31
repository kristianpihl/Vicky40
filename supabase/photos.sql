-- Bilder: metadata-tabell + storage-bucket for bildeopplasting.
-- Kjør i Supabase: SQL Editor -> New query -> lim inn -> Run.

-- 1) Tabell med info om hvert bilde
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  storage_path text not null,   -- filnavn i 'photos'-bucketen
  uploaded_by text not null,    -- hvem bildene er fra
  caption text,                 -- valgfri tekst
  approved boolean not null default false  -- vises i galleriet først når denne er true
);

alter table public.photos enable row level security;

-- Alle kan sende inn (laste opp) ...
drop policy if exists "Alle kan legge til bilder" on public.photos;
create policy "Alle kan legge til bilder"
  on public.photos for insert to anon
  with check (true);

-- ... men bare godkjente bilder kan leses av gjestene.
drop policy if exists "Alle kan se godkjente bilder" on public.photos;
create policy "Alle kan se godkjente bilder"
  on public.photos for select to anon
  using (approved = true);

-- 2) Storage-bucket for selve bildefilene (offentlig lesbar)
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "Alle kan laste opp til photos" on storage.objects;
create policy "Alle kan laste opp til photos"
  on storage.objects for insert to anon
  with check (bucket_id = 'photos');

-- --------------------------------------------------------------------
-- Slik godkjenner du bilder for visning i galleriet:
--   I Table editor: sett «approved» til true på radene du vil vise.
--   Eller med SQL:
--     update public.photos set approved = true where id = 'lim-inn-id';
-- --------------------------------------------------------------------
