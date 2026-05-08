-- 0006 — Customer reviews (sourced from Google Maps for now). No seed: the
-- admin manually copies reviews from the Google Maps listing using the
-- /admin/reviews page. The home page section auto-hides while the table
-- is empty.

create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  stars int not null check (stars between 1 and 5),
  review_text text not null,
  -- Stored as text, not a timestamp, so the admin can paste exactly what
  -- Google shows ("2 months ago", "a year ago", etc.).
  review_date_label text not null,
  source text not null default 'google',
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists reviews_active_order_idx
  on reviews(is_active, display_order, created_at desc);

alter table reviews enable row level security;

drop policy if exists reviews_public_read on reviews;
create policy reviews_public_read on reviews
  for select using (is_active = true);

drop policy if exists reviews_admin_all on reviews;
create policy reviews_admin_all on reviews
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
