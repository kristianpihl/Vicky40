-- "Get to know my guests" – an admin-editable list of guests (photo, name,
-- short text) + the unlock toggle for the front-page button.
-- Run in Supabase: SQL Editor -> New query -> paste -> Run. Safe to re-run.
--
-- Requires admin.sql (admin_ok) and content.sql (page_content,
-- admin_page_content_save) to have been run first.

-- =====================================================================
-- 1) Guests table
-- =====================================================================

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null default '',
  blurb text not null default '',       -- short text shown under the name
  image_path text,                      -- file name in the 'guest-images' bucket
  sort_order int not null default 0,
  published boolean not null default false
);

grant select on table public.guests to anon;
alter table public.guests enable row level security;

drop policy if exists "Anyone can read published guests" on public.guests;
create policy "Anyone can read published guests"
  on public.guests for select to anon
  using (published = true);

-- =====================================================================
-- 2) Unlock flag (stored in page_content)
-- =====================================================================

insert into public.page_content (key, value)
values ('guests.unlocked', 'false')
on conflict (key) do nothing;

create or replace function public.admin_page_content_save(
  email text,
  pass text,
  p_key text,
  p_value text
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
  if p_key not in (
    'front.heading', 'front.intro', 'venue.body', 'venue.facts',
    'oslo.unlocked', 'guests.unlocked'
  ) then
    raise exception 'Unknown content key: %', p_key;
  end if;

  insert into public.page_content (key, value, updated_at)
  values (p_key, coalesce(p_value, ''), now())
  on conflict (key) do update
    set value = excluded.value, updated_at = now();
end;
$$;

-- =====================================================================
-- 3) Guest CRUD (password-checked)
-- =====================================================================

create or replace function public.admin_guests(email text, pass text)
returns setof public.guests
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  return query select * from public.guests order by sort_order, created_at;
end;
$$;

create or replace function public.admin_guest_save(
  email text,
  pass text,
  p_id uuid,
  p_name text,
  p_blurb text,
  p_image_path text,
  p_sort_order int,
  p_published boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  result_id uuid;
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  if coalesce(btrim(p_name), '') = '' then
    raise exception 'Name cannot be empty';
  end if;

  if p_id is null then
    insert into public.guests (name, blurb, image_path, sort_order, published)
    values (btrim(p_name), coalesce(p_blurb, ''), nullif(btrim(p_image_path), ''),
            coalesce(p_sort_order, 0), coalesce(p_published, false))
    returning id into result_id;
  else
    update public.guests set
      name = btrim(p_name),
      blurb = coalesce(p_blurb, ''),
      image_path = nullif(btrim(p_image_path), ''),
      sort_order = coalesce(p_sort_order, sort_order),
      published = coalesce(p_published, published),
      updated_at = now()
    where id = p_id
    returning id into result_id;
  end if;

  return result_id;
end;
$$;

create or replace function public.admin_guest_delete(email text, pass text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  delete from public.guests where id = p_id;
end;
$$;

create or replace function public.admin_guests_reorder(email text, pass text, ordered_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  update public.guests g
    set sort_order = x.ord::int, updated_at = now()
    from unnest(ordered_ids) with ordinality as x(id, ord)
    where g.id = x.id;
end;
$$;

-- =====================================================================
-- 4) Storage bucket for the guest photos (mirrors article-images)
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('guest-images', 'guest-images', true)
on conflict (id) do nothing;

create or replace function public.guest_image_exists(path text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.guests where image_path = path);
$$;

grant execute on function public.guest_image_exists(text) to anon;
grant delete on storage.objects to anon; -- no-op if already granted

drop policy if exists "Upload guest images" on storage.objects;
create policy "Upload guest images"
  on storage.objects for insert to anon
  with check (bucket_id = 'guest-images');

drop policy if exists "Read guest images" on storage.objects;
create policy "Read guest images"
  on storage.objects for select to anon
  using (bucket_id = 'guest-images');

drop policy if exists "Delete orphaned guest images" on storage.objects;
create policy "Delete orphaned guest images"
  on storage.objects for delete to anon
  using (bucket_id = 'guest-images' and not public.guest_image_exists(name));

-- =====================================================================
-- 5) Grants
-- =====================================================================

grant execute on function public.admin_guests(text, text) to anon;
grant execute on function public.admin_guest_save(
  text, text, uuid, text, text, text, int, boolean) to anon;
grant execute on function public.admin_guest_delete(text, text, uuid) to anon;
grant execute on function public.admin_guests_reorder(text, text, uuid[]) to anon;
grant execute on function public.admin_page_content_save(text, text, text, text) to anon;

notify pgrst, 'reload schema';
