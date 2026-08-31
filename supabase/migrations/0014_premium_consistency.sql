-- 0014 — Premium consistency pass.
--
-- Establishes single sources of truth for the address and opening hours,
-- cleans up doctor and video data entered by hand, and adds the settings keys
-- behind the admin-managed section photos.
--
-- Idempotent throughout: every statement is safe to re-run.

-- 1. Doctor qualifications -------------------------------------------------
alter table doctors add column if not exists qualifications text;

-- 2. Doctor data hygiene ---------------------------------------------------
-- Names carried their qualifications inline; split them into the new column.
update doctors
set name = 'Dr. Rajesh', qualifications = 'MD, DM'
where name = 'Dr. Rajesh MD DM';

update doctors set name = 'Dr. Jaya Subhashini' where name = 'Dr. Jaya subhashini';

update doctors
set specialty = 'Physician & Cardiologist'
where specialty = 'physician and cardiologist';

-- 3. Video title cleanups --------------------------------------------------
update videos set title = 'Mr. Amith Jindal, Trainer'      where title = 'Mr. Amith Jindal Trainer';
update videos set title = 'Mr. Nageswara Rao'              where title = 'Mr.Nageswara Rao';
update videos set title = 'Ready-to-mix coconut powder'    where title = 'Ready made coconut powder (Ready to mix)';
update videos set title = 'Neem-based mosquito repellent'  where title = 'mosquito repellent, Neem base';
update videos set title = 'Body lotion'                    where title = 'Body Lotion';
update videos set title = 'Inside The Pharma Generic House' where title = 'The Pharma Generic House';

-- 4. Founder bio — the shop opened in 2018, so no "decade" claims ----------
update family_members
set bio = 'Uma Shankar Alapati brings over 27 years of medical experience and years of running The Pharma Generic House. He built the pharmacy to translate that experience into something Vijayawada families could rely on — trusted medicines, personal advice, and honest care. Every prescription he fills carries that experience behind it. That is why customers come back, and why they bring their neighbours.'
where name = 'Uma Shankar Alapati';

-- 5. Settings --------------------------------------------------------------
-- `settings` is (key text unique, value jsonb), so scalars are stored with
-- to_jsonb() and the schedule as a jsonb object.
insert into settings (key, value) values
  ('shop_address', to_jsonb('The Pharma Generic House, Opp Golden Pavilion, Governerpeta, Vijayawada, Andhra Pradesh 520002'::text))
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into settings (key, value) values
  ('shop_hours_schedule', '{
     "mon": {"open": "09:00", "close": "22:00"},
     "tue": {"open": "09:00", "close": "22:00"},
     "wed": {"open": "09:00", "close": "22:00"},
     "thu": {"open": "09:00", "close": "22:00"},
     "fri": {"open": "09:00", "close": "22:00"},
     "sat": {"open": "09:00", "close": "22:00"},
     "sun": {"open": "09:00", "close": "14:00"}
   }'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- Photo slots start empty; the public pages fall back to the bundled images
-- until an admin uploads. Only inserted if absent, so re-running never wipes
-- a photo the admin has since set.
insert into settings (key, value) values ('diagnostics_photo_url', to_jsonb(''::text))
on conflict (key) do nothing;

insert into settings (key, value) values ('about_photo_url', to_jsonb(''::text))
on conflict (key) do nothing;

-- The free-text hours value is superseded by shop_hours_schedule.
delete from settings where key = 'shop_hours';

-- 6. Site photos bucket ----------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-photos', 'site-photos', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "site-photos public read" on storage.objects;
create policy "site-photos public read" on storage.objects
  for select using (bucket_id = 'site-photos');

drop policy if exists "site-photos admin write" on storage.objects;
create policy "site-photos admin write" on storage.objects
  for all using (bucket_id = 'site-photos' and auth.role() = 'authenticated')
  with check (bucket_id = 'site-photos' and auth.role() = 'authenticated');
