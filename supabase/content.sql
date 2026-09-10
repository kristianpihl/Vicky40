-- Editable page content: the Programme and the F&Q page.
-- Run in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run more than once.
--
-- Requires admin.sql to have been run first (uses the admin_ok() check).
--
-- Guests read only rows where published = true. All changes go through the
-- password-checked admin_* functions below.

-- =====================================================================
-- 1) Tables
-- =====================================================================

create table if not exists public.program_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  day text not null,                       -- Thursday | Friday | Saturday | Sunday
  "time" text,                             -- free text, e.g. '18:00'
  title text not null,
  location text,
  description text,
  sort_order int not null default 0,       -- order within the day
  published boolean not null default false
);

create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  heading text not null,
  body text not null default '',           -- lightweight markdown (**bold**, [text](url), "- " lists)
  sort_order int not null default 0,
  published boolean not null default false
);

-- "last changed" stamp, used by the front-page "Latest update" feed.
alter table public.program_items
  add column if not exists updated_at timestamptz not null default now();
alter table public.faq_items
  add column if not exists updated_at timestamptz not null default now();

-- Guests (anon key) may read, but only published rows (policy below).
grant select on table public.program_items to anon;
grant select on table public.faq_items to anon;

alter table public.program_items enable row level security;
alter table public.faq_items enable row level security;

drop policy if exists "Anyone can read published program" on public.program_items;
create policy "Anyone can read published program"
  on public.program_items for select to anon
  using (published = true);

drop policy if exists "Anyone can read published faq" on public.faq_items;
create policy "Anyone can read published faq"
  on public.faq_items for select to anon
  using (published = true);

-- =====================================================================
-- 2) Seed with the content that used to live in the code.
--    Only runs while the table is still empty, so re-running is safe.
-- =====================================================================

insert into public.program_items (day, "time", title, location, description, sort_order, published)
select * from (values
  ('Thursday', '18:00', 'Informal get-together', 'Solstua',
   'For those already arriving on Thursday – no sign-up needed.', 1, true),
  ('Friday', '12:00', 'Lunch and city walk', 'Solstua',
   'We''ll wander around and see a bit of the city. Dress for the weather.', 1, true),
  ('Friday', '19:00', 'Group dinner', 'Solstua',
   'The table is booked. Let us know in your RSVP if you are joining.', 2, true),
  ('Saturday', '11:00', 'Late breakfast', 'Solstua', null, 1, true),
  ('Saturday', '18:00', 'Dinner and party', 'Solstua',
   'The main event of the evening. More info to come.', 2, true),
  ('Sunday', '11:00', 'Wind-down and goodbyes', 'Solstua',
   'Coffee and a bite to eat before everyone heads home.', 1, true)
) as v(day, "time", title, location, description, sort_order, published)
where not exists (select 1 from public.program_items);

insert into public.faq_items (heading, body, sort_order, published)
select * from (values
  ('When and where?',
   $md$The weekend runs Thursday 04.02 to Sunday 07.02 at [Solstua](/venue). The [programme](/program) has it day by day.$md$,
   1, true),
  ('RSVP deadline',
   $md$Please sign up by **[date]** so we can give Solstua final numbers for food and beds.$md$,
   2, true),
  ('How do I sign up?',
   $md$Use the [RSVP form](/rsvp). You can add several people, say which days you're coming, whether you're sleeping at Solstua, and note any allergies.$md$,
   3, true),
  ('Changing or cancelling your RSVP',
   $md$Something changed? Just open the [RSVP form](/rsvp) again and fill it in with the same email address you used the first time – we always use your most recent answer, so there's nothing else to do. To cancel, tick "We can no longer come – cancel our RSVP" at the top of the form and send it.$md$,
   4, true),
  ('Staying over',
   $md$Solstua has 6–8 bedrooms (12–15 beds). Say in the RSVP if you'd like one – [how beds are shared out / any cost]. If they're full, [nearby options / it's about a 25-minute drive from town].$md$,
   5, true),
  ('Food',
   $md$Meals are at Solstua across the weekend – [something light on Thursday, lunch and dinner Friday, breakfast and the big dinner Saturday]. Put any allergies or diets in the RSVP form and we'll pass them on. [Anything about drinks, or bringing something.]$md$,
   6, true),
  ('Dress code, day by day',
   $md$- **Thursday** – [relaxed, come as you are].
- **Friday** – [smart casual].
- **Saturday** – [the main night: dress up / cocktail / a theme?].$md$,
   7, true),
  ('Gifts',
   $md$Your being there is what matters most. [If you'd like to give something: a few ideas here / a contribution towards X / "no gifts, please".]$md$,
   8, true),
  ('Left something at Solstua?',
   $md$If you think you left something behind, contact Solstua directly within a few days at [phone / email / solstua.no]. You can also let [host name] know and we'll help chase it up.$md$,
   9, true),
  ('Still wondering about something?',
   $md$Message [name] on [phone / email].$md$,
   10, true)
) as v(heading, body, sort_order, published)
where not exists (select 1 from public.faq_items);

-- =====================================================================
-- 3) Admin functions (password-checked). The editor calls these.
-- =====================================================================

-- --- Programme ---

create or replace function public.admin_program(email text, pass text)
returns setof public.program_items
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  return query
    select * from public.program_items
    order by array_position(array['Thursday','Friday','Saturday','Sunday'], day),
             sort_order, created_at;
end;
$$;

create or replace function public.admin_program_save(
  email text,
  pass text,
  p_id uuid,
  p_day text,
  p_time text,
  p_title text,
  p_location text,
  p_description text,
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
  if p_day not in ('Thursday', 'Friday', 'Saturday', 'Sunday') then
    raise exception 'Unknown day: %', p_day;
  end if;
  if coalesce(btrim(p_title), '') = '' then
    raise exception 'Title cannot be empty';
  end if;

  if p_id is null then
    insert into public.program_items (day, "time", title, location, description, sort_order, published)
    values (p_day, nullif(btrim(p_time), ''), btrim(p_title),
            nullif(btrim(p_location), ''), nullif(p_description, ''),
            coalesce(p_sort_order, 0), coalesce(p_published, false))
    returning id into result_id;
  else
    update public.program_items set
      day = p_day,
      "time" = nullif(btrim(p_time), ''),
      title = btrim(p_title),
      location = nullif(btrim(p_location), ''),
      description = nullif(p_description, ''),
      sort_order = coalesce(p_sort_order, sort_order),
      published = coalesce(p_published, published),
      updated_at = now()
    where id = p_id
    returning id into result_id;
  end if;

  return result_id;
end;
$$;

create or replace function public.admin_program_delete(email text, pass text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  delete from public.program_items where id = p_id;
end;
$$;

create or replace function public.admin_program_reorder(email text, pass text, ordered_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  update public.program_items p
    set sort_order = x.ord::int, updated_at = now()
    from unnest(ordered_ids) with ordinality as x(id, ord)
    where p.id = x.id;
end;
$$;

-- --- F&Q ---

create or replace function public.admin_faq(email text, pass text)
returns setof public.faq_items
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  return query
    select * from public.faq_items order by sort_order, created_at;
end;
$$;

create or replace function public.admin_faq_save(
  email text,
  pass text,
  p_id uuid,
  p_heading text,
  p_body text,
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
  if coalesce(btrim(p_heading), '') = '' then
    raise exception 'Heading cannot be empty';
  end if;

  if p_id is null then
    insert into public.faq_items (heading, body, sort_order, published)
    values (btrim(p_heading), coalesce(p_body, ''),
            coalesce(p_sort_order, 0), coalesce(p_published, false))
    returning id into result_id;
  else
    update public.faq_items set
      heading = btrim(p_heading),
      body = coalesce(p_body, ''),
      sort_order = coalesce(p_sort_order, sort_order),
      published = coalesce(p_published, published),
      updated_at = now()
    where id = p_id
    returning id into result_id;
  end if;

  return result_id;
end;
$$;

create or replace function public.admin_faq_delete(email text, pass text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  delete from public.faq_items where id = p_id;
end;
$$;

create or replace function public.admin_faq_reorder(email text, pass text, ordered_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  update public.faq_items f
    set sort_order = x.ord::int, updated_at = now()
    from unnest(ordered_ids) with ordinality as x(id, ord)
    where f.id = x.id;
end;
$$;

-- Latest change time per editable page, for the front-page "Latest update" feed.
create or replace function public.content_last_updated()
returns table (program timestamptz, faq timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select max(updated_at) from public.program_items where published),
    (select max(updated_at) from public.faq_items where published);
$$;

-- =====================================================================
-- 4) Grants
-- =====================================================================

grant execute on function public.admin_program(text, text) to anon;
grant execute on function public.admin_program_save(
  text, text, uuid, text, text, text, text, text, int, boolean) to anon;
grant execute on function public.admin_program_delete(text, text, uuid) to anon;
grant execute on function public.admin_program_reorder(text, text, uuid[]) to anon;

grant execute on function public.admin_faq(text, text) to anon;
grant execute on function public.admin_faq_save(
  text, text, uuid, text, text, int, boolean) to anon;
grant execute on function public.admin_faq_delete(text, text, uuid) to anon;
grant execute on function public.admin_faq_reorder(text, text, uuid[]) to anon;

grant execute on function public.content_last_updated() to anon;

notify pgrst, 'reload schema';
