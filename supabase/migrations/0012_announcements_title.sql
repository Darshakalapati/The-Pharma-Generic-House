-- 0012 — Announcements become a library rather than a single editable row.
--
-- The table already held everything the banner needs; what was missing was an
-- admin-facing label to tell saved announcements apart in a list, and a stable
-- creation timestamp to order that list by (updated_at moves whenever an
-- announcement is switched on or off, so it cannot carry the ordering).
--
-- `title` is internal — e.g. "Diwali Offer", "Holiday Closure". Customers only
-- ever see `text`.

alter table announcements add column if not exists title text;

-- Backfill before the not-null constraint. Existing rows predate the column,
-- and the only seeded row is the Sunday Test Day banner from migration 0004.
update announcements set title = 'Sunday Test Day' where title is null;

alter table announcements alter column title set not null;

alter table announcements
  add column if not exists created_at timestamptz not null default now();

-- The admin list reads newest-first.
create index if not exists announcements_created_idx on announcements(created_at desc);
