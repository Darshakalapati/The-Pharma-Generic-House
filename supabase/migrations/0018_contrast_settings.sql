-- 0018 — Admin-editable highlight statement (the home-page contrast band).
--
-- Four keys, one pair per language. All start as empty strings, which means
-- "use the built-in wording": each locale falls back to its own dictionary
-- default, so blank Telugu shows the Telugu default rather than English.
--
-- Emptying only the main line of a pair whose small line is set is a
-- deliberate "hide it" signal — see components/public/contrast-band.tsx.
--
-- `settings` is (key text unique, value jsonb). ON CONFLICT DO NOTHING so
-- re-running never overwrites wording the admin has since entered.

insert into settings (key, value) values ('contrast_line1_en', to_jsonb(''::text))
on conflict (key) do nothing;

insert into settings (key, value) values ('contrast_line2_en', to_jsonb(''::text))
on conflict (key) do nothing;

insert into settings (key, value) values ('contrast_line1_te', to_jsonb(''::text))
on conflict (key) do nothing;

insert into settings (key, value) values ('contrast_line2_te', to_jsonb(''::text))
on conflict (key) do nothing;
