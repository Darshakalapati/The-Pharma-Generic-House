-- 0002 — Refresh the General Medicine seed with real, commonly-stocked OTC products.
-- Run on existing databases that were seeded earlier with placeholder rows.
-- Safe to re-run: deletes existing 'general' rows and inserts the canonical 10.
-- Other product categories (pharma, ayurvedic, cosmetic) are untouched.

delete from products where category = 'general';

insert into products (name, category, description, image_url, in_stock) values
('Crocin Advance 500mg', 'general', 'Paracetamol tablet for fever, headache, and body pain. Pack of 15 tablets.', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80&auto=format&fit=crop', true),
('Dolo 650', 'general', 'Paracetamol 650mg for fever and pain relief. Strip of 15 tablets.', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80&auto=format&fit=crop', true),
('Combiflam', 'general', 'Ibuprofen + Paracetamol for inflammation and pain. Pack of 20 tablets.', 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&q=80&auto=format&fit=crop', true),
('Digene Gel (Mint)', 'general', 'Antacid for acidity, heartburn, and indigestion. 200ml bottle.', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&q=80&auto=format&fit=crop', true),
('ENO Fruit Salt (Lemon)', 'general', 'Fast-acting antacid powder for acidity and gas. 100g bottle.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80&auto=format&fit=crop', true),
('Vicks VapoRub', 'general', 'Topical balm for cold, cough, and blocked nose. 50ml jar.', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80&auto=format&fit=crop', true),
('Strepsils Original', 'general', 'Lozenges for sore throat relief. Pack of 8 lozenges.', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80&auto=format&fit=crop', true),
('Cetirizine 10mg', 'general', 'Antihistamine for allergies, runny nose, and sneezing. Strip of 10 tablets.', 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&q=80&auto=format&fit=crop', true),
('ORS Powder (Electrobion)', 'general', 'Oral rehydration salts for dehydration and weakness. 20g sachet.', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&q=80&auto=format&fit=crop', true),
('Volini Pain Relief Spray', 'general', 'Topical spray for muscle and joint pain. 100g bottle.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80&auto=format&fit=crop', true);
