-- 0011 — Rewrite the founder's row around trust, honesty, and care.
--
-- The shop is no longer presented as a family business, so the seeded bio from
-- migration 0010 (which referenced his father's pharmacy and inherited
-- knowledge) is replaced here. The text below matches the FALLBACK in
-- components/public/family-story.tsx exactly, so the home page reads the same
-- whether it is rendering the database row or the built-in fallback.
--
-- The `family_members` table and /admin/family page keep their names — those
-- are internal, and nothing about them is public-visible.

update family_members
set
  name = 'Uma Shankar Alapati',
  role = 'Founder',
  bio = 'Uma Shankar Alapati brings over 27 years of medical experience to The Pharma Generic House. He built the pharmacy to translate that experience into something Vijayawada families could rely on — trusted medicines, personal advice, and honest care. Every prescription he fills carries decades of medical understanding behind it. That is why customers come back, and why they bring their neighbours.',
  quote_text = 'We don''t sell medicines. We sell healing.',
  quote_attribution = 'Uma Shankar Alapati'
where quote_attribution = 'Uma Shankar Alapati' or name = 'Uma Shankar Alapati';
