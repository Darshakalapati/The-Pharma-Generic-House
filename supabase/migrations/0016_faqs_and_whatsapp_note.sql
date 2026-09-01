-- 0016 — FAQs, plus the admin-editable WhatsApp reply note.
--
-- Telugu columns are optional: when question_te / answer_te are empty the
-- public accordion falls back to the English text, so an admin can add a FAQ
-- in English today and translate it later without the page breaking.
--
-- Written idempotently to match the rest of supabase/migrations.

create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  question_te text,
  answer_te text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists faqs_active_order_idx on faqs(is_active, display_order, created_at);

alter table faqs enable row level security;

drop policy if exists faqs_public_read on faqs;
create policy faqs_public_read on faqs
  for select using (is_active = true);

drop policy if exists faqs_admin_all on faqs;
create policy faqs_admin_all on faqs
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- The reassurance line in the WhatsApp helper card.
insert into settings (key, value)
values ('whatsapp_reply_note', to_jsonb('We usually reply within 15 minutes.'::text))
on conflict (key) do nothing;

-- Seed the nine questions people actually ask at the counter. Guarded on the
-- English question so re-running never duplicates a row.
insert into faqs (question, answer, question_te, answer_te, display_order)
select * from (values
  (
    'Do I need a prescription to buy medicines?',
    'Prescription medicines are dispensed only against a valid doctor''s prescription, at the shop. Everyday over-the-counter items don''t need one.',
    'మందులు కొనడానికి ప్రిస్క్రిప్షన్ కావాలా?',
    'ప్రిస్క్రిప్షన్ మందులు చెల్లుబాటు అయ్యే డాక్టర్ ప్రిస్క్రిప్షన్‌తో మాత్రమే షాప్‌లో ఇస్తాం. రోజువారీ ఓవర్-ది-కౌంటర్ వస్తువులకు అవసరం లేదు.',
    1
  ),
  (
    'How do I order medicines?',
    'Send your prescription or list on WhatsApp, or add items to the enquiry list on the Products page. We confirm availability and price, and you collect at the shop.',
    'మందులు ఎలా ఆర్డర్ చేయాలి?',
    'మీ ప్రిస్క్రిప్షన్ లేదా జాబితా వాట్సాప్‌లో పంపండి, లేదా ఉత్పత్తుల పేజీలో ఎంక్వైరీ లిస్ట్‌కు జోడించండి. అందుబాటు, ధర నిర్ధారించి చెబుతాం — షాప్‌లో తీసుకోవచ్చు.',
    2
  ),
  (
    'Do you deliver medicines?',
    'Not at the moment. Home sample collection for lab tests is available across Vijayawada.',
    'మందులు ఇంటికి డెలివరీ చేస్తారా?',
    'ప్రస్తుతం లేదు. ల్యాబ్ పరీక్షల కోసం ఇంటి వద్ద శాంపిల్ కలెక్షన్ విజయవాడ అంతటా అందుబాటులో ఉంది.',
    3
  ),
  (
    'How do Sunday lab tests work?',
    'Walk in any Sunday, 9 AM – 1 PM; a ThyroCare technician collects samples at the shop. On other days the technician comes to the shop within 45 minutes, or visits your home.',
    'ఆదివారం ల్యాబ్ పరీక్షలు ఎలా జరుగుతాయి?',
    'ఏ ఆదివారమైనా ఉదయం 9 – మధ్యాహ్నం 1 మధ్య నేరుగా రండి; థైరోకేర్ టెక్నీషియన్ షాప్‌లోనే శాంపిల్స్ తీసుకుంటారు. మిగతా రోజుల్లో టెక్నీషియన్ 45 నిమిషాల్లో షాప్‌కు వస్తారు, లేదా మీ ఇంటికి వస్తారు.',
    4
  ),
  (
    'How do I get my test reports?',
    'Reports are delivered to your WhatsApp. Timing depends on the test — we tell you when you book.',
    'టెస్ట్ రిపోర్టులు ఎలా అందుతాయి?',
    'రిపోర్టులు మీ వాట్సాప్‌కే వస్తాయి. సమయం పరీక్షను బట్టి ఉంటుంది — బుక్ చేసేటప్పుడు చెబుతాం.',
    5
  ),
  (
    'How do I book a doctor?',
    'Choose a doctor and a suggested time on the Doctors page; we confirm on WhatsApp. For on-request doctors, send a request and we arrange a time.',
    'డాక్టర్‌ను ఎలా బుక్ చేయాలి?',
    'డాక్టర్ల పేజీలో డాక్టర్‌ను, సూచించిన సమయాన్ని ఎంచుకోండి; వాట్సాప్‌లో నిర్ధారిస్తాం. అభ్యర్థనపై ఉన్న డాక్టర్లకు అభ్యర్థన పంపండి, సమయం ఏర్పాటు చేస్తాం.',
    6
  ),
  (
    'Do you keep generic medicines?',
    'Yes — both branded medicines and quality generic alternatives. Ask us and we''ll show you the options and prices.',
    'జెనరిక్ మందులు ఉంచుతారా?',
    'అవును — బ్రాండెడ్ మందులు, నాణ్యమైన జెనరిక్ ప్రత్యామ్నాయాలు రెండూ. అడగండి, ఎంపికలు, ధరలు చూపిస్తాం.',
    7
  ),
  (
    'What are your opening hours?',
    'Mon–Sat 9 AM – 10 PM, Sun 9 AM – 2 PM.',
    'మీ షాప్ సమయాలు ఏమిటి?',
    'సోమ–శని ఉదయం 9 – రాత్రి 10, ఆది ఉదయం 9 – మధ్యాహ్నం 2.',
    8
  ),
  (
    'Where is the shop?',
    'The Pharma Generic House, Opp Golden Pavilion, Governerpeta, Vijayawada, Andhra Pradesh 520002.',
    'షాప్ ఎక్కడ ఉంది?',
    'The Pharma Generic House, Opp Golden Pavilion, Governerpeta, Vijayawada, Andhra Pradesh 520002.',
    9
  )
) as seed(question, answer, question_te, answer_te, display_order)
where not exists (select 1 from faqs where faqs.question = seed.question);
