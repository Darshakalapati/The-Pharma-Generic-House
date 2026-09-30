-- 0017 — "Order medicines on call" callback requests.
--
-- A visitor leaves a phone number and the shop rings them back. The only
-- column that comes from the visitor is the phone number, stored as ten bare
-- digits so the admin list, the tel: link, the wa.me link and the ten-minute
-- dedupe all agree on one shape.
--
-- Unlike appointments/enquiries/contact_messages there is NO public insert
-- policy: these rows are written by the submitCallbackRequest server action
-- using the service-role client, so nothing reachable from the browser can
-- read or write this table.
--
-- Written idempotently to match the rest of supabase/migrations.

create table if not exists callback_requests (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  -- Which surface it came from: 'band' or 'slidein'. Kept as free text
  -- rather than an enum so a future entry point needs no migration.
  source text not null default 'band',
  -- 'pending' | 'called' | 'closed'
  status text not null default 'pending',
  note text,
  created_at timestamptz not null default now()
);

-- The admin list reads newest-first and filters by status; the server action
-- looks up recent rows for one phone to dedupe.
create index if not exists callback_requests_status_created_idx
  on callback_requests(status, created_at desc);
create index if not exists callback_requests_phone_created_idx
  on callback_requests(phone, created_at desc);

alter table callback_requests enable row level security;

drop policy if exists callback_requests_admin_all on callback_requests;
create policy callback_requests_admin_all on callback_requests
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
