-- The Pharma Generic House — initial schema
-- Run this in the Supabase SQL Editor (or via supabase CLI).

create extension if not exists "uuid-ossp";

-- ENUMS ---------------------------------------------------------------
do $$ begin
  create type product_category as enum ('general','pharma','ayurvedic','cosmetic');
exception when duplicate_object then null; end $$;

do $$ begin
  create type doctor_specialty as enum ('nadi','physiotherapy','homeopathy');
exception when duplicate_object then null; end $$;

do $$ begin
  create type appointment_status as enum ('pending','confirmed','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type test_booking_status as enum ('pending','confirmed','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type enquiry_status as enum ('new','contacted','completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_status as enum ('new','read','replied');
exception when duplicate_object then null; end $$;

do $$ begin
  create type collection_type as enum ('shop','home');
exception when duplicate_object then null; end $$;

-- TABLES --------------------------------------------------------------

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category product_category not null default 'general',
  description text,
  image_url text,
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists doctors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  specialty doctor_specialty not null,
  bio text,
  photo_url text,
  consultation_fee int,
  available_days text[] not null default '{}',
  available_time_start time,
  available_time_end time,
  slot_duration_minutes int not null default 30,
  is_active boolean not null default true,
  is_on_request boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  doctor_id uuid not null references doctors(id) on delete cascade,
  patient_name text not null,
  patient_phone text not null,
  patient_age int,
  preferred_date date not null,
  preferred_time time not null,
  notes text,
  status appointment_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists appointments_doctor_idx on appointments(doctor_id);
create index if not exists appointments_status_idx on appointments(status);
create index if not exists appointments_date_idx on appointments(preferred_date);

create table if not exists tests (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price int,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists test_bookings (
  id uuid primary key default uuid_generate_v4(),
  test_id uuid not null references tests(id) on delete cascade,
  patient_name text not null,
  patient_phone text not null,
  patient_address text,
  preferred_date date not null,
  collection_type collection_type not null default 'shop',
  status test_booking_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists test_bookings_test_idx on test_bookings(test_id);
create index if not exists test_bookings_status_idx on test_bookings(status);
create index if not exists test_bookings_date_idx on test_bookings(preferred_date);

create table if not exists enquiries (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  customer_phone text not null,
  items jsonb not null default '[]'::jsonb,
  status enquiry_status not null default 'new',
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists enquiries_status_idx on enquiries(status);

create table if not exists contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  email text,
  message text not null,
  status message_status not null default 'new',
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_status_idx on contact_messages(status);

create table if not exists settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- STORAGE BUCKETS -----------------------------------------------------
-- One public bucket for product/doctor images. Reads are public; writes are admin-only.
insert into storage.buckets (id, name, public)
values ('public-images', 'public-images', true)
on conflict (id) do nothing;

-- ROW-LEVEL SECURITY --------------------------------------------------
alter table products enable row level security;
alter table doctors enable row level security;
alter table appointments enable row level security;
alter table tests enable row level security;
alter table test_bookings enable row level security;
alter table enquiries enable row level security;
alter table contact_messages enable row level security;
alter table settings enable row level security;

-- products: public can read in-stock or all (we filter in app); admin can do all
drop policy if exists products_public_read on products;
create policy products_public_read on products
  for select using (true);

drop policy if exists products_admin_all on products;
create policy products_admin_all on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- doctors: public can read active; admin can do all
drop policy if exists doctors_public_read on doctors;
create policy doctors_public_read on doctors
  for select using (is_active = true);

drop policy if exists doctors_admin_all on doctors;
create policy doctors_admin_all on doctors
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- tests: public can read active; admin can do all
drop policy if exists tests_public_read on tests;
create policy tests_public_read on tests
  for select using (is_active = true);

drop policy if exists tests_admin_all on tests;
create policy tests_admin_all on tests
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- appointments: anyone can insert; only admin can read/update/delete
drop policy if exists appointments_public_insert on appointments;
create policy appointments_public_insert on appointments
  for insert with check (true);

drop policy if exists appointments_admin_all on appointments;
create policy appointments_admin_all on appointments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- test_bookings: anyone can insert; admin can do all
drop policy if exists test_bookings_public_insert on test_bookings;
create policy test_bookings_public_insert on test_bookings
  for insert with check (true);

drop policy if exists test_bookings_admin_all on test_bookings;
create policy test_bookings_admin_all on test_bookings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- enquiries: anyone can insert; admin can do all
drop policy if exists enquiries_public_insert on enquiries;
create policy enquiries_public_insert on enquiries
  for insert with check (true);

drop policy if exists enquiries_admin_all on enquiries;
create policy enquiries_admin_all on enquiries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- contact_messages: anyone can insert; admin can do all
drop policy if exists contact_messages_public_insert on contact_messages;
create policy contact_messages_public_insert on contact_messages
  for insert with check (true);

drop policy if exists contact_messages_admin_all on contact_messages;
create policy contact_messages_admin_all on contact_messages
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- settings: public read (the storefront needs reservation_pickup_enabled and shop info);
-- only admin can write.
drop policy if exists settings_public_read on settings;
create policy settings_public_read on settings
  for select using (true);

drop policy if exists settings_admin_write on settings;
create policy settings_admin_write on settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- STORAGE POLICIES ----------------------------------------------------
-- Public read of public-images bucket; admin can manage objects.
drop policy if exists "public-images public read" on storage.objects;
create policy "public-images public read" on storage.objects
  for select using (bucket_id = 'public-images');

drop policy if exists "public-images admin write" on storage.objects;
create policy "public-images admin write" on storage.objects
  for all using (bucket_id = 'public-images' and auth.role() = 'authenticated')
  with check (bucket_id = 'public-images' and auth.role() = 'authenticated');
