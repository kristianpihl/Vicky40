-- Photos: metadata table + storage bucket for photo uploads.
-- Run in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.

-- 1) Table with info about each photo
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  storage_path text not null,   -- file name in the 'photos' bucket
  uploaded_by text not null,    -- who the photos are from
  caption text,                 -- optional text
  approved boolean not null default false  -- only shown in the gallery once this is true
);

-- Give the anon role (the public key) access to the table.
-- Without this you get "permission denied for table photos" (42501).
-- The RLS policies below then decide which rows can actually be added / read.
grant insert, select on table public.photos to anon;

alter table public.photos enable row level security;

-- Anyone can submit (upload) ...
drop policy if exists "Alle kan legge til bilder" on public.photos;
drop policy if exists "Anyone can add photos" on public.photos;
create policy "Anyone can add photos"
  on public.photos for insert to anon
  with check (true);

-- ... but only approved photos can be read by guests.
drop policy if exists "Alle kan se godkjente bilder" on public.photos;
drop policy if exists "Anyone can see approved photos" on public.photos;
create policy "Anyone can see approved photos"
  on public.photos for select to anon
  using (approved = true);

-- 2) Storage bucket for the image files themselves (publicly readable)
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "Alle kan laste opp til photos" on storage.objects;
drop policy if exists "Anyone can upload to photos" on storage.objects;
create policy "Anyone can upload to photos"
  on storage.objects for insert to anon
  with check (bucket_id = 'photos');

-- Admin photo deletion. The admin_delete_photo RPC (see admin.sql) removes the
-- public.photos row first; the app then deletes the file here. This policy only
-- allows deleting a 'photos' file that has NO matching photos row, so the anon
-- key on its own can't wipe real photos. photo_exists() is SECURITY DEFINER so
-- it sees every row, not just approved ones.
create or replace function public.photo_exists(path text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.photos where storage_path = path);
$$;

grant execute on function public.photo_exists(text) to anon;

grant delete on storage.objects to anon;

-- The Storage API needs to be able to SELECT an object before it can remove it.
-- The 'photos' bucket is public anyway, so this exposes nothing new.
drop policy if exists "Read photos objects" on storage.objects;
create policy "Read photos objects"
  on storage.objects for select to anon
  using (bucket_id = 'photos');

drop policy if exists "Delete orphaned photos" on storage.objects;
create policy "Delete orphaned photos"
  on storage.objects for delete to anon
  using (bucket_id = 'photos' and not public.photo_exists(name));

-- --------------------------------------------------------------------
-- How to approve photos for the gallery:
--   In the Table editor: set "approved" to true on the rows you want to show.
--   Or with SQL:
--     update public.photos set approved = true where id = 'paste-the-id';
-- --------------------------------------------------------------------
