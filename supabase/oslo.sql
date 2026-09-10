-- "Vickie's Oslo" – admin-written articles + the unlock toggle for the
-- front-page button.
-- Run in Supabase: SQL Editor -> New query -> paste -> Run. Safe to re-run.
--
-- Requires admin.sql (admin_ok) and content.sql (page_content,
-- admin_page_content_save) to have been run first.

-- =====================================================================
-- 1) Articles table
-- =====================================================================

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null default '',
  excerpt text not null default '',     -- short text shown in the listing
  body text not null default '',        -- lightweight markdown, shown on the article page
  image_path text,                      -- file name in the 'article-images' bucket
  sort_order int not null default 0,
  published boolean not null default false
);

grant select on table public.articles to anon;
alter table public.articles enable row level security;

drop policy if exists "Anyone can read published articles" on public.articles;
create policy "Anyone can read published articles"
  on public.articles for select to anon
  using (published = true);

-- =====================================================================
-- 2) Unlock flag for the "Vickie's Oslo" button (stored in page_content)
-- =====================================================================

insert into public.page_content (key, value)
values ('oslo.unlocked', 'false')
on conflict (key) do nothing;

-- Allow the content save RPC to write this key too.
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
    'front.heading', 'front.intro', 'venue.body', 'venue.facts', 'oslo.unlocked'
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
-- 3) Article CRUD (password-checked)
-- =====================================================================

create or replace function public.admin_articles(email text, pass text)
returns setof public.articles
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  return query select * from public.articles order by sort_order, created_at;
end;
$$;

create or replace function public.admin_article_save(
  email text,
  pass text,
  p_id uuid,
  p_title text,
  p_excerpt text,
  p_body text,
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
  if coalesce(btrim(p_title), '') = '' then
    raise exception 'Title cannot be empty';
  end if;

  if p_id is null then
    insert into public.articles (title, excerpt, body, image_path, sort_order, published)
    values (btrim(p_title), coalesce(p_excerpt, ''), coalesce(p_body, ''),
            nullif(btrim(p_image_path), ''),
            coalesce(p_sort_order, 0), coalesce(p_published, false))
    returning id into result_id;
  else
    update public.articles set
      title = btrim(p_title),
      excerpt = coalesce(p_excerpt, ''),
      body = coalesce(p_body, ''),
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

create or replace function public.admin_article_delete(email text, pass text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  delete from public.articles where id = p_id;
end;
$$;

create or replace function public.admin_articles_reorder(email text, pass text, ordered_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_ok(email, pass) then
    raise exception 'Wrong username or password';
  end if;
  update public.articles a
    set sort_order = x.ord::int, updated_at = now()
    from unnest(ordered_ids) with ordinality as x(id, ord)
    where a.id = x.id;
end;
$$;

-- =====================================================================
-- 4) Storage bucket for the article images (mirrors the photos setup)
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

create or replace function public.article_image_exists(path text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.articles where image_path = path);
$$;

grant execute on function public.article_image_exists(text) to anon;
grant delete on storage.objects to anon; -- no-op if already granted

drop policy if exists "Upload article images" on storage.objects;
create policy "Upload article images"
  on storage.objects for insert to anon
  with check (bucket_id = 'article-images');

drop policy if exists "Read article images" on storage.objects;
create policy "Read article images"
  on storage.objects for select to anon
  using (bucket_id = 'article-images');

-- Only files with no article row can be removed with the anon key.
drop policy if exists "Delete orphaned article images" on storage.objects;
create policy "Delete orphaned article images"
  on storage.objects for delete to anon
  using (bucket_id = 'article-images' and not public.article_image_exists(name));

-- =====================================================================
-- 5) Grants
-- =====================================================================

grant execute on function public.admin_articles(text, text) to anon;
grant execute on function public.admin_article_save(
  text, text, uuid, text, text, text, text, int, boolean) to anon;
grant execute on function public.admin_article_delete(text, text, uuid) to anon;
grant execute on function public.admin_articles_reorder(text, text, uuid[]) to anon;
grant execute on function public.admin_page_content_save(text, text, text, text) to anon;

notify pgrst, 'reload schema';
