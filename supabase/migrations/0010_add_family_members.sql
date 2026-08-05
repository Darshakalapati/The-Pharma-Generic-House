-- 0010 — Family members for the "Our story" section on the home page.
--
-- The section renders the active member with the lowest display_order: their
-- photo, bio, and (when is_featured_quote is set) their quote as a pull-quote.
-- Seeds Uma Shankar Alapati so the section has real content the moment this
-- migration is applied; the copy matches what the page falls back to when the
-- table is empty or unreachable.
--
-- Written idempotently to match the rest of supabase/migrations — re-running
-- it will not duplicate the seed row.

create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  bio text not null,
  photo_url text,
  quote_text text,
  quote_attribution text,
  display_order int not null default 0,
  is_active boolean not null default true,
  is_featured_quote boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists family_members_active_order_idx
  on family_members(is_active, display_order, created_at);

alter table family_members enable row level security;

drop policy if exists family_members_public_read on family_members;
create policy family_members_public_read on family_members
  for select using (is_active = true);

drop policy if exists family_members_admin_all on family_members;
create policy family_members_admin_all on family_members
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Seed row for Uma Shankar Alapati. Guarded on name so re-running the
-- migration does not insert a second copy.
insert into family_members (
  name, role, bio, quote_text, quote_attribution,
  display_order, is_active, is_featured_quote
)
select
  'Uma Shankar Alapati',
  'Founder & Pharmacist',
  'Uma Shankar Alapati brings over 27 years of medical experience and more than a decade of running The Pharma Generic House. He grew up in his father''s pharmacy, learning about medicines before he could read prescriptions. That inherited knowledge — combined with decades of relationships with local doctors and medical professionals — is what customers walk in for. He doesn''t just fill prescriptions. He listens, advises, and cares.',
  'We don''t sell medicines. We sell healing.',
  'Uma Shankar Alapati',
  0,
  true,
  true
where not exists (select 1 from family_members where name = 'Uma Shankar Alapati');

-- Storage bucket — public reads for the home page, authenticated writes via
-- /admin/family. 5 MB per file, JPEG / PNG / WebP only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'family-photos',
  'family-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "family-photos public read" on storage.objects;
create policy "family-photos public read" on storage.objects
  for select using (bucket_id = 'family-photos');

drop policy if exists "family-photos admin write" on storage.objects;
create policy "family-photos admin write" on storage.objects
  for all using (bucket_id = 'family-photos' and auth.role() = 'authenticated')
  with check (bucket_id = 'family-photos' and auth.role() = 'authenticated');
