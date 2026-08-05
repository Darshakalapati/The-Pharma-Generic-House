-- 0009 — Hero photos for the home page.
--
-- Active rows are rendered by components/public/hero-ken-burns.tsx: one photo
-- gets a slow 20s zoom on a loop; two or more crossfade every 12s, each with
-- its own zoom. When the table is empty the hero falls back to the bundled
-- Unsplash pharmacy photo, so this migration is safe to apply before any
-- photos are uploaded.
--
-- Written idempotently (if not exists / drop policy if exists) to match the
-- rest of supabase/migrations — re-running it is a no-op.

create table if not exists hero_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text default 'Inside The Pharma Generic House pharmacy',
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists hero_photos_active_order_idx
  on hero_photos(is_active, display_order, created_at);

alter table hero_photos enable row level security;

drop policy if exists hero_photos_public_read on hero_photos;
create policy hero_photos_public_read on hero_photos
  for select using (is_active = true);

drop policy if exists hero_photos_admin_all on hero_photos;
create policy hero_photos_admin_all on hero_photos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage bucket — public reads for the home page, authenticated writes via
-- /admin/hero-photos. 10 MB per file, JPEG / PNG / WebP only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hero-photos',
  'hero-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "hero-photos public read" on storage.objects;
create policy "hero-photos public read" on storage.objects
  for select using (bucket_id = 'hero-photos');

drop policy if exists "hero-photos admin write" on storage.objects;
create policy "hero-photos admin write" on storage.objects
  for all using (bucket_id = 'hero-photos' and auth.role() = 'authenticated')
  with check (bucket_id = 'hero-photos' and auth.role() = 'authenticated');
