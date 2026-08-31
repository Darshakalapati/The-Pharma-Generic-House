-- The Pharma Generic House — seed data
-- Run after 0001_init.sql

-- Products -------------------------------------------------------------
-- Image URLs use Unsplash (general medicines) and picsum (other categories
-- as before). All royalty-free / hot-linkable.
insert into products (name, category, description, image_url, in_stock) values
-- general (10 real OTC medicines, image URLs rotated across 5 Unsplash photos)
('Crocin Advance 500mg', 'general', 'Paracetamol tablet for fever, headache, and body pain. Pack of 15 tablets.', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80&auto=format&fit=crop', true),
('Dolo 650', 'general', 'Paracetamol 650mg for fever and pain relief. Strip of 15 tablets.', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80&auto=format&fit=crop', true),
('Combiflam', 'general', 'Ibuprofen + Paracetamol for inflammation and pain. Pack of 20 tablets.', 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&q=80&auto=format&fit=crop', true),
('Digene Gel (Mint)', 'general', 'Antacid for acidity, heartburn, and indigestion. 200ml bottle.', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&q=80&auto=format&fit=crop', true),
('ENO Fruit Salt (Lemon)', 'general', 'Fast-acting antacid powder for acidity and gas. 100g bottle.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80&auto=format&fit=crop', true),
('Vicks VapoRub', 'general', 'Topical balm for cold, cough, and blocked nose. 50ml jar.', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80&auto=format&fit=crop', true),
('Strepsils Original', 'general', 'Lozenges for sore throat relief. Pack of 8 lozenges.', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80&auto=format&fit=crop', true),
('Cetirizine 10mg', 'general', 'Antihistamine for allergies, runny nose, and sneezing. Strip of 10 tablets.', 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&q=80&auto=format&fit=crop', true),
('ORS Powder (Electrobion)', 'general', 'Oral rehydration salts for dehydration and weakness. 20g sachet.', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&q=80&auto=format&fit=crop', true),
('Volini Pain Relief Spray', 'general', 'Topical spray for muscle and joint pain. 100g bottle.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80&auto=format&fit=crop', true),

-- pharma
('Metformin 500mg', 'pharma', 'For type-2 diabetes management. Strip of 10 tablets.', 'https://picsum.photos/seed/metformin/600/600', true),
('Atorvastatin 20mg', 'pharma', 'Cholesterol-lowering statin. Strip of 10 tablets.', 'https://picsum.photos/seed/atorva/600/600', true),
('Amlodipine 5mg', 'pharma', 'Blood pressure control. Strip of 15 tablets.', 'https://picsum.photos/seed/amlodipine/600/600', true),
('Azithromycin 500mg', 'pharma', 'Broad-spectrum antibiotic. Strip of 5 tablets. Prescription required.', 'https://picsum.photos/seed/azithro/600/600', true),
('Insulin Pen Refills', 'pharma', 'Cartridge refills for insulin pens. Cold-chain stored.', 'https://picsum.photos/seed/insulin/600/600', true),

-- ayurvedic
('Chyawanprash 1kg', 'ayurvedic', 'Traditional immunity tonic with amla and over 40 herbs.', 'https://picsum.photos/seed/chyawan/600/600', true),
('Triphala Powder 200g', 'ayurvedic', 'Classical three-fruit blend for digestion and detox.', 'https://picsum.photos/seed/triphala/600/600', true),
('Ashwagandha Capsules', 'ayurvedic', 'Adaptogen for stress and stamina. 60 capsules.', 'https://picsum.photos/seed/ashwa/600/600', true),
('Brahmi Hair Oil', 'ayurvedic', 'Herbal hair oil with brahmi, bhringraj, and amla. 200ml.', 'https://picsum.photos/seed/brahmi/600/600', true),
('Tulsi Drops 30ml', 'ayurvedic', 'Concentrated tulsi extract for daily wellness.', 'https://picsum.photos/seed/tulsi/600/600', true),

-- cosmetic
('Daily Moisturiser SPF 15', 'cosmetic', 'Lightweight, non-greasy moisturiser for daily wear.', 'https://picsum.photos/seed/moisturiser/600/600', true),
('Mineral Sunscreen SPF 50', 'cosmetic', 'Broad-spectrum sunscreen, suitable for sensitive skin.', 'https://picsum.photos/seed/sunscreen/600/600', true),
('Vitamin C Face Serum', 'cosmetic', 'Brightening serum with 10% vitamin C. 30ml.', 'https://picsum.photos/seed/vitc/600/600', true),
('Aloe Vera Gel', 'cosmetic', 'Pure aloe vera gel for skin and hair. 200ml tube.', 'https://picsum.photos/seed/aloe/600/600', true),
('Lip Balm Trio', 'cosmetic', 'Set of three nourishing lip balms — honey, rose, mint.', 'https://picsum.photos/seed/lipbalm/600/600', true);

-- Doctors --------------------------------------------------------------
-- Photos use real Unsplash URLs (royalty-free, hot-linkable). Admin uploads
-- through /admin/doctors override these via the photo_url column.
insert into doctors (name, specialty, bio, photo_url, consultation_fee, available_days, available_time_start, available_time_end, slot_duration_minutes, is_active, is_on_request) values
('Dr. Ramesh Iyer', 'nadi',
  'Traditional pulse diagnosis combined with personalized Ayurvedic guidance. Over 20 years of practice.',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80&auto=format&fit=crop',
  500, '{Mon,Wed,Fri}', '10:00', '13:00', 30, true, false),

('Dr. Anjali Verma', 'physiotherapy',
  'Sports injuries, post-surgical recovery, and chronic pain management with evidence-based therapy.',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&q=80&auto=format&fit=crop',
  600, '{Tue,Thu,Sat}', '16:00', '19:00', 30, true, false),

('Dr. Priya Nair', 'homeopathy',
  'Constitutional homeopathy for chronic conditions and family wellness. Available on appointment request.',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80&auto=format&fit=crop',
  null, '{}', null, null, 30, true, true);

-- Tests ----------------------------------------------------------------
-- Real ThyroCare-offered tests with 2026 retail-tier INR pricing. Admin can
-- edit any of these from /admin/tests.
insert into tests (name, description, price, is_active) values
('Thyroid Profile Total (T3, T4, TSH)', 'Basic thyroid function panel measuring T3, T4, and TSH levels.', 500, true),
('Thyroid Profile Free (FT3, FT4, TSH)', 'Free thyroid hormones panel for accurate thyroid assessment.', 600, true),
('TSH (Thyroid Stimulating Hormone)', 'Single TSH test for thyroid screening.', 250, true),
('Aarogyam 1.3 (Full Body Checkup)', '63-parameter full body health checkup including thyroid, lipid, liver, kidney, diabetes, and CBC.', 1499, true),
('Aarogyam C (Comprehensive Full Body)', '89-parameter advanced health checkup with thyroid, vitamins, and full panels.', 2200, true),
('Diabetes Screening (HbA1c + Fasting Sugar)', 'Long-term glucose control plus fasting glucose.', 450, true),
('Lipid Profile', 'Total cholesterol, HDL, LDL, triglycerides.', 350, true),
('Liver Function Test (LFT)', 'Complete liver health assessment with 11 parameters.', 400, true),
('Kidney Function Test (KFT)', 'Urea, creatinine, uric acid, and electrolytes.', 450, true),
('Vitamin D (25-OH)', 'Serum 25-hydroxy Vitamin D level.', 999, true),
('Vitamin B12', 'Serum B12 level for energy and nerve health.', 600, true),
('Complete Blood Count (CBC)', 'Hemoglobin, WBC, RBC, platelets, and full blood panel.', 250, true);

-- Settings -------------------------------------------------------------
insert into settings (key, value) values
  ('reservation_pickup_enabled', 'false'::jsonb),
  ('shop_phone', to_jsonb('+91 98850 67198'::text)),
  ('shop_whatsapp', to_jsonb('919885067198'::text)),
  ('shop_address', to_jsonb('The Pharma Generic House, Opp Golden Pavilion, Governerpeta, Vijayawada, Andhra Pradesh 520002'::text)),
  ('shop_hours_schedule', '{"mon":{"open":"09:00","close":"22:00"},"tue":{"open":"09:00","close":"22:00"},"wed":{"open":"09:00","close":"22:00"},"thu":{"open":"09:00","close":"22:00"},"fri":{"open":"09:00","close":"22:00"},"sat":{"open":"09:00","close":"22:00"},"sun":{"open":"09:00","close":"14:00"}}'::jsonb)
on conflict (key) do nothing;
