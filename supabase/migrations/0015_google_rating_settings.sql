-- 0015 — Google rating badge.
--
-- Two settings the admin copies from the shop's Google Business Profile. Both
-- start empty so nothing renders until real numbers are entered — the hero
-- pill and the reviews-section line are hidden while either is missing.
--
-- `settings` is (key text unique, value jsonb). ON CONFLICT DO NOTHING so
-- re-running never overwrites numbers the admin has since set.

insert into settings (key, value) values ('google_rating', 'null'::jsonb)
on conflict (key) do nothing;

insert into settings (key, value) values ('google_review_count', 'null'::jsonb)
on conflict (key) do nothing;
