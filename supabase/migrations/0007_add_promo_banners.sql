-- 0007 — Promo banner carousel for the home page. Separate from the thin
-- announcement strip at the top of every page (see migration 0004); these
-- banners are full-width visual cards that rotate in a single carousel
-- placed between "What we offer" and "Doctors in residence". No seed: the
-- home page section auto-hides while the table is empty.

do $$ begin
  create type banner_type as enum ('image', 'text');
exception when duplicate_object then null; end $$;

do $$ begin
  create type banner_background_style as enum ('plum', 'teal', 'cream');
exception when duplicate_object then null; end $$;

create table if not exists promo_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  banner_type banner_type not null default 'text',
  image_url text,
  headline text,
  subheading text,
  button_label text,
  button_link text,
  background_style banner_background_style not null default 'plum',
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists promo_banners_active_order_idx
  on promo_banners(is_active, display_order, created_at desc);

alter table promo_banners enable row level security;

drop policy if exists promo_banners_public_read on promo_banners;
create policy promo_banners_public_read on promo_banners
  for select using (is_active = true);

drop policy if exists promo_banners_admin_all on promo_banners;
create policy promo_banners_admin_all on promo_banners
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage bucket — public reads for the home page, authenticated writes
-- via /admin/promo-banners. 5 MB per file, JPEG / PNG / WebP only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'promo-banners',
  'promo-banners',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "promo-banners public read" on storage.objects;
create policy "promo-banners public read" on storage.objects
  for select using (bucket_id = 'promo-banners');

drop policy if exists "promo-banners admin write" on storage.objects;
create policy "promo-banners admin write" on storage.objects
  for all using (bucket_id = 'promo-banners' and auth.role() = 'authenticated')
  with check (bucket_id = 'promo-banners' and auth.role() = 'authenticated');
