-- Admin login + read access for the birthday person.
-- Run in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run more than once.
--
-- How it works: the RSVP table stays locked (guests can only INSERT, never read).
-- These functions run with elevated rights and hand back the data ONLY when the
-- correct username (an email) AND password are passed in. Both are stored in the
-- one row of admin_config below.

-- 1) Credential store (one row, not readable by the public)
create table if not exists public.admin_config (
  id int primary key default 1,
  username text not null default '',
  password text not null,
  constraint admin_config_singleton check (id = 1)
);

-- Add the username column if the table already existed from an earlier version.
alter table public.admin_config
  add column if not exists username text not null default '';

insert into public.admin_config (id, username, password)
values (1, 'kristianpihl01@gmail.com', 'Bristol87')
on conflict (id) do nothing;

-- This is the one place to edit the admin credentials: change the two values
-- here and run this file again.
update public.admin_config
  set username = 'kristianpihl01@gmail.com',
      password = 'Bristol87'
  where id = 1;

alter table public.admin_config enable row level security;
-- No policies on purpose: only the SECURITY DEFINER functions below can read it.

-- 2) Shared credential check used by every function below.
--    Not granted to anon on purpose – only the definer functions call it.
create or replace function public.admin_ok(email text, pass text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_config
    where id = 1
      and lower(username) = lower(coalesce(email, ''))
      and password = pass
  );
$$;

-- Drop the older single-argument (password-only) versions of every function.
drop function if exists public.admin_login(text);
drop function if exists public.admin_rsvps(text);
drop function if exists public.admin_photos(text);
drop function if exists public.admin_storage_stats(text);
drop function if exists public.admin_delete_photo(text, uuid);
drop function if exists public.admin_set_person_removed(text, uuid, int, boolean);
drop function if exists public.admin_update_rsvp_person(
  text, uuid, int, text, text, text, boolean, text, jsonb, text, text);

-- 3) Login check
create or replace function public.admin_login(email text, pass text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.admin_ok(email, pass);
$$;

-- 4) All RSVPs (newest first)
create or replace function public.admin_rsvps(email text, pass text)
returns setof public.rsvp
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  return query select * from public.rsvp order by created_at desc;
end;
$$;

-- 5) All uploaded photos (newest first)
create or replace function public.admin_photos(email text, pass text)
returns setof public.photos
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  return query select * from public.photos order by created_at desc;
end;
$$;

-- 6) Let the admin set aside / restore a single person inside an RSVP.
--    "removed_people" holds the indexes (into that row's people array) that the
--    admin has removed from the active list. Nothing is deleted – it's undoable.
alter table public.rsvp
  add column if not exists removed_people jsonb not null default '[]'::jsonb;

create or replace function public.admin_set_person_removed(
  email text,
  pass text,
  rsvp_id uuid,
  person_index int,
  removed boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;

  if removed then
    update public.rsvp
    set removed_people =
      case
        when removed_people @> to_jsonb(person_index) then removed_people
        else removed_people || to_jsonb(person_index)
      end
    where id = rsvp_id;
  else
    update public.rsvp
    set removed_people = coalesce(
      (select jsonb_agg(e)
         from jsonb_array_elements(removed_people) e
        where e <> to_jsonb(person_index)),
      '[]'::jsonb)
    where id = rsvp_id;
  end if;
end;
$$;

-- 7) Let the admin edit one person row inline.
--    Person-level fields (name/phone/allergies) change just that person;
--    the rest are submission-level and apply to the whole group.
create or replace function public.admin_update_rsvp_person(
  email text,
  pass text,
  rsvp_id uuid,
  person_index int,
  new_name text,
  new_phone text,
  new_allergies text,
  new_sleeping_at_cabin boolean,
  new_arrival_day text,
  new_events jsonb,
  new_contact_email text,
  new_comment text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pi text := person_index::text;
  p jsonb;
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;

  select people into p from public.rsvp where id = rsvp_id;
  if p is null then
    raise exception 'RSVP not found';
  end if;

  p := jsonb_set(p, array[pi, 'name'], coalesce(to_jsonb(new_name), '""'::jsonb));
  p := jsonb_set(p, array[pi, 'phone'], coalesce(to_jsonb(new_phone), 'null'::jsonb));
  p := jsonb_set(p, array[pi, 'allergies'], coalesce(to_jsonb(new_allergies), 'null'::jsonb));

  update public.rsvp
  set people = p,
      sleeping_at_cabin = new_sleeping_at_cabin,
      arrival_day = new_arrival_day,
      events = new_events,
      contact_email = new_contact_email,
      comment = new_comment
  where id = rsvp_id;
end;
$$;

-- 8) Storage usage for the photos bucket (file count + total bytes).
--    Read straight from storage.objects so it covers every file actually
--    stored, not just rows in the photos table.
create or replace function public.admin_storage_stats(email text, pass text)
returns table (file_count bigint, total_bytes bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  return query
    select count(*)::bigint,
           coalesce(sum((metadata->>'size')::bigint), 0)::bigint
    from storage.objects
    where bucket_id = 'photos'
      and name <> '.emptyFolderPlaceholder';
end;
$$;

-- 9) Delete one uploaded photo: removes the file from the bucket AND the
--    row from the photos table. Password-checked, nothing is recoverable.
create or replace function public.admin_delete_photo(email text, pass text, photo_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  p text;
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;

  select storage_path into p from public.photos where id = photo_id;
  if p is null then
    raise exception 'Photo not found';
  end if;

  delete from storage.objects where bucket_id = 'photos' and name = p;
  delete from public.photos where id = photo_id;
end;
$$;

grant execute on function public.admin_login(text, text) to anon;
grant execute on function public.admin_rsvps(text, text) to anon;
grant execute on function public.admin_photos(text, text) to anon;
grant execute on function public.admin_storage_stats(text, text) to anon;
grant execute on function public.admin_delete_photo(text, text, uuid) to anon;
grant execute on function public.admin_set_person_removed(text, text, uuid, int, boolean) to anon;
grant execute on function public.admin_update_rsvp_person(
  text, text, uuid, int, text, text, text, boolean, text, jsonb, text, text) to anon;
