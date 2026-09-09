-- Admin login + read access for the birthday person.
-- Run in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run more than once.
--
-- How it works: the RSVP table stays locked (guests can only INSERT, never read).
-- These functions run with elevated rights and hand back the data ONLY when the
-- correct password is passed in. The password is stored in one place below.

-- 1) Password store (one row, not readable by the public)
create table if not exists public.admin_config (
  id int primary key default 1,
  password text not null,
  constraint admin_config_singleton check (id = 1)
);

insert into public.admin_config (id, password)
values (1, 'Bristol86')
on conflict (id) do nothing;

alter table public.admin_config enable row level security;
-- No policies on purpose: only the SECURITY DEFINER functions below can read it.

-- To change the password later:
--   update public.admin_config set password = 'new-password' where id = 1;

-- 2) Login check
create or replace function public.admin_login(pass text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return pass = (select password from public.admin_config where id = 1);
end;
$$;

-- 3) All RSVPs (newest first)
create or replace function public.admin_rsvps(pass text)
returns setof public.rsvp
language plpgsql
security definer
set search_path = public
as $$
begin
  if pass is distinct from (select password from public.admin_config where id = 1) then
    raise exception 'Wrong password';
  end if;
  return query select * from public.rsvp order by created_at desc;
end;
$$;

-- 4) All uploaded photos (newest first)
create or replace function public.admin_photos(pass text)
returns setof public.photos
language plpgsql
security definer
set search_path = public
as $$
begin
  if pass is distinct from (select password from public.admin_config where id = 1) then
    raise exception 'Wrong password';
  end if;
  return query select * from public.photos order by created_at desc;
end;
$$;

grant execute on function public.admin_login(text) to anon;
grant execute on function public.admin_rsvps(text) to anon;
grant execute on function public.admin_photos(text) to anon;
