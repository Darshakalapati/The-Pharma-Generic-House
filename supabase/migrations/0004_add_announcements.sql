-- 0004 — Announcement banner stored in DB so admin can edit it without
-- redeploying. Only one row is ever "live" at a time; the public site
-- selects the most recently updated active row.

do $$ begin
  create type announcement_color as enum ('plum', 'teal');
exception when duplicate_object then null; end $$;

create table if not exists announcements (
  id uuid primary key default uuid_generate_v4(),
  text text not null,
  link_label text,
  link_url text,
  background_color announcement_color not null default 'plum',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists announcements_active_idx on announcements(is_active, updated_at desc);

alter table announcements enable row level security;

drop policy if exists announcements_public_read on announcements;
create policy announcements_public_read on announcements
  for select using (is_active = true);

drop policy if exists announcements_admin_all on announcements;
create policy announcements_admin_all on announcements
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Default banner — re-runnable: only inserts if the table is empty.
insert into announcements (text, link_label, link_url, background_color, is_active)
select 'Sunday is Test Day — walk in for ThyroCare lab tests, 9 AM to 1 PM',
       'Book a test →',
       '/tests',
       'plum',
       true
where not exists (select 1 from announcements);
