-- 0008 — Unique product name, so the admin bulk upload can upsert by name.
--
-- The /admin/products "Bulk Upload" flow matches spreadsheet rows to existing
-- products on `name`: a row whose name already exists updates that product,
-- anything else is inserted. Supabase's .upsert({ onConflict: 'name' }) needs a
-- unique constraint on that column to resolve the conflict.
--
-- A unique index cannot be built over existing duplicate names, so the prelude
-- below clears them first, keeping the oldest row of each name. Nothing
-- references products(id), so dropping the newer duplicates breaks no rows.
--
-- Review what would go before running, if you want to check first:
--
--   select name, count(*) from products group by name having count(*) > 1;

-- Remove duplicate product names before adding the unique constraint
-- (keep the oldest by created_at).
delete from products a using products b
where a.name = b.name and a.created_at > b.created_at;

do $$ begin
  alter table products add constraint products_name_unique unique (name);
exception when duplicate_table then null; when duplicate_object then null; end $$;
