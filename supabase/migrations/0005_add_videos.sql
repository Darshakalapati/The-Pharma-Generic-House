-- 0005 — Customer testimonial videos shown on the home page. Admin can
-- upload video files (stored in the `videos` bucket) or paste YouTube /
-- Instagram links.

do $$ begin
  create type video_type as enum ('testimonial', 'review', 'announcement');
exception when duplicate_object then null; end $$;

do $$ begin
  create type video_source as enum ('upload', 'youtube', 'instagram');
exception when duplicate_object then null; end $$;

create table if not exists videos (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  customer_name text,
  video_type video_type not null default 'testimonial',
  video_url text not null,
  video_source video_source not null default 'upload',
  thumbnail_url text,
  description text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists videos_active_order_idx on videos(is_active, display_order, created_at);

alter table videos enable row level security;

drop policy if exists videos_public_read on videos;
create policy videos_public_read on videos
  for select using (is_active = true);

drop policy if exists videos_admin_all on videos;
create policy videos_admin_all on videos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage bucket — public reads, admin writes, capped at 50 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'videos',
  'videos',
  true,
  52428800,
  array['video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "videos public read" on storage.objects;
create policy "videos public read" on storage.objects
  for select using (bucket_id = 'videos');

drop policy if exists "videos admin write" on storage.objects;
create policy "videos admin write" on storage.objects
  for all using (bucket_id = 'videos' and auth.role() = 'authenticated')
  with check (bucket_id = 'videos' and auth.role() = 'authenticated');
