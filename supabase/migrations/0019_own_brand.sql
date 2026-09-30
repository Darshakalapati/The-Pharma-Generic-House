-- 0019 — Our own brand on the shelves.
--
-- `is_own_brand` drives a small teal badge on the product card and in the
-- quick-view. Defaults to false so every existing row is unaffected.
--
-- Seeds one product: Sreenidhi wild forest raw honey. Deliberately no
-- image_url — the owner uploads the real jar photo through /admin/products and
-- the card shows the sand fallback until then. No pack sizes and no price:
-- neither is known here, and the shop confirms both on WhatsApp.
--
-- Written idempotently to match the rest of supabase/migrations.

alter table products add column if not exists is_own_brand boolean not null default false;

create index if not exists products_own_brand_idx on products(is_own_brand) where is_own_brand;

-- `name` is unique as of migration 0008, so this is safe to re-run.
insert into products (name, category, description, in_stock, is_own_brand)
values (
  'Sreenidhi Wild Forest Raw Honey',
  'ayurvedic',
  'Raw, unprocessed honey gathered from wild forest hives — unheated and unfiltered, from our own brand, Sreenidhi. Ask us about available sizes.',
  true,
  true
)
on conflict (name) do nothing;
