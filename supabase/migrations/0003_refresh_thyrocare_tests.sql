-- 0003 — Refresh the diagnostics catalogue with real ThyroCare-offered tests
-- and 2026 retail-tier INR pricing.
-- Run on existing databases seeded earlier with the 6-test placeholder list.
-- This deletes ALL rows in the tests table and reinserts the canonical 12.
-- Existing test_bookings rows reference test_id with on-delete cascade and
-- will be removed alongside the tests they pointed at — only run this if
-- that's acceptable, or pause & reassign bookings first via /admin.

delete from tests;

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
