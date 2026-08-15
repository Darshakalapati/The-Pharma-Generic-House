-- 0013 — Doctors: free-text specialties and manual ordering.
--
-- `specialty` was an enum of three values, which meant a new kind of
-- practitioner could not be added without a schema change. Converting the
-- column to text keeps every existing row exactly as it is ('nadi',
-- 'physiotherapy', 'homeopathy' are preserved verbatim) while allowing
-- anything else the admin types.
--
-- The `doctor_specialty` enum type is deliberately left in place. Dropping it
-- can fail if anything still references it, and an unused type costs nothing.

alter table doctors alter column specialty type text using specialty::text;

-- Manual ordering for the admin list and both public listings.
alter table doctors add column if not exists display_order int not null default 0;

-- Seed a stable initial order from creation time, so existing doctors come out
-- 0..N-1 in the order they were added rather than all sharing 0.
with ordered as (
  select id, row_number() over (order by created_at asc) - 1 as rn
  from doctors
)
update doctors d set display_order = o.rn from ordered o where d.id = o.id;

create index if not exists doctors_order_idx on doctors(display_order, created_at);
