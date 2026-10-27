-- 0020 — Salt-name medicine directory.
--
-- The shop is moving from a short brand-name shelf to a ~4,000-item directory
-- of generic compositions. Two layers now share the `products` table:
--
--   listing_type = 'featured'  — the curated photo cards (unchanged)
--   listing_type = 'directory' — the searchable A–Z salt-name list
--
-- Written idempotently to match the rest of supabase/migrations.

-- 1. Free the category column. Directory rows use medicine/herbal/surgical/
--    wellness/general, which the old four-value enum cannot express.
--
--    Same approach as doctors.specialty in 0013: convert to text, keep every
--    existing value verbatim, and leave the `product_category` enum type in
--    place. Dropping it can fail while anything still references it, and an
--    unused type costs nothing.
alter table products alter column category type text using category::text;

-- 2. Which layer a row belongs to. Defaults to 'featured' so every existing
--    row keeps its current behaviour.
alter table products add column if not exists listing_type text not null default 'featured';

-- `add constraint` has no IF NOT EXISTS, so swallow the duplicate on re-run.
do $$
begin
  alter table products
    add constraint products_listing_type_check
    check (listing_type in ('featured', 'directory'));
exception
  when duplicate_object then null;
end
$$;

-- 3. The directory is read as "all directory rows, name order".
create index if not exists products_directory_name_idx on products (listing_type, name);

-- 4. Retire the brand-name medicine seeds from 0001/0002 — salt names replace
--    them. Matched on exact name; anything already gone is simply not matched.
--    The ayurvedic and cosmetic seeds, and Sreenidhi (0019), are untouched and
--    remain 'featured'.
delete from products where name in (
  'Crocin Advance 500mg',
  'Dolo 650',
  'Combiflam',
  'Digene Gel (Mint)',
  'ENO Fruit Salt (Lemon)',
  'Vicks VapoRub',
  'Strepsils Original',
  'Cetirizine 10mg',
  'ORS Powder (Electrobion)',
  'Volini Pain Relief Spray',
  'Azithromycin 500mg',
  'Pantoprazole 40mg',
  'Metformin 500mg',
  'Atorvastatin 10mg',
  'Telmisartan 40mg'
);
