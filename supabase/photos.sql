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
  approved boolean not null default false,  -- only shown in the gallery once this is true
  hidden boolean not null default false     -- "deleted" in the admin view, but never actually removed
);

alter table public.photos
  add column if not exists hidden boolean not null default false;

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

-- 2026-09: admin photo deletion was replaced by hiding (admin_hide_photo in
-- admin.sql sets photos.hidden = true; nothing is ever actually removed).
-- These clean up the delete-related grant/policies/function from earlier so
-- there is no longer any way – in the app or directly against the database
-- as anon – to delete a photo file. Safe to run even if they were never set.
drop policy if exists "Delete orphaned photos" on storage.objects;
drop policy if exists "Read photos objects" on storage.objects;
revoke delete on storage.objects from anon;
drop function if exists public.photo_exists(text);

-- --------------------------------------------------------------------
-- How to approve photos for the gallery:
--   In the Table editor: set "approved" to true on the rows you want to show.
--   Or with SQL:
--     update public.photos set approved = true where id = 'paste-the-id';
--
-- "Removed" photos (hidden = true) never disappear from the database or the
-- storage bucket – they just stop showing up in /admin/photos. To find one
-- again: Table editor -> photos -> filter "hidden" = true, or with SQL:
--     select * from public.photos where hidden = true order by created_at desc;
-- The file itself is still in Storage -> photos, under that row's storage_path.
-- To un-hide it: update public.photos set hidden = false where id = '...';
--
-- How to permanently remove a photo (not exposed in the app on purpose):
--   In the Table editor, or with SQL:
--     delete from public.photos where id = 'paste-the-id';
--   Then remove the file itself in Storage -> photos (same storage_path).
-- --------------------------------------------------------------------
