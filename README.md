# The Pharma Generic House

**Website and self-serve admin panel for a family-owned pharmacy in Vijayawada, India.** It is live in production at **[pharmagenerichouse.com](https://www.pharmagenerichouse.com)**.

Customers browse medicines, book doctor appointments and lab tests, and reach the shop on WhatsApp in one tap. The shop's staff run all of it from an admin panel, without touching code: products, doctors, tests, banners, reviews, FAQs, opening hours and announcements.

`Next.js 14 (App Router)` · `TypeScript` · `Supabase (Postgres, Auth, Storage, RLS)` · `Tailwind CSS` · `Vercel` · `Resend`

---

## Highlights

- **Medicine directory, A–Z.** About 4,000 medicines listed by generic (salt) name in five categories, searchable instantly and imported in chunks from the shop's Excel export.
- **Bookings that reach the shop.** Doctor appointments with day and slot validation, lab-test bookings (in shop or home collection), callback requests and product enquiries. Each lands in the admin panel and sends the shop an email alert.
- **Two languages.** A full Telugu/English toggle with Noto Telugu fonts.
- **Made for phones.** A sticky Call/WhatsApp bar, a quick-action dock, a product quick-view drawer and site-wide search (`⌘K`).
- **Found on Google.** Per-page metadata, Pharmacy JSON-LD structured data, a sitemap, robots.txt and generated Open Graph images.
- **Secure by default.** Row-level security on every table: anyone can submit a form, and only signed-in admins can read or change data. `/admin` is guarded by middleware.
- **Admin panel.** A dashboard of today's schedule and 16 managers covering appointments, test bookings, enquiries, callbacks, messages, products (with CSV/Excel bulk upload), doctors, tests, videos, reviews, promo banners, hero photos, family profiles, announcements, FAQs and settings.

## Architecture

```
Browser ──► Next.js on Vercel ──► Supabase
             │  server components        │  Postgres + row-level security
             │  server actions (forms)   │  Auth (admin sign-in)
             │  middleware (/admin)      │  Storage (product & doctor images)
             └► Resend (email alerts)
```

- **Schema:** 20 SQL migrations in `supabase/migrations/`, applied in order.
- **Content without deploys:** shop details, hours and feature flags live in a `settings` table, and `lib/constants.ts` holds fallbacks only.

## Project structure

```
app/
  (public)/        Home, Products, Doctors, Tests, About, Contact, Privacy, Terms
  admin/           /admin/login and the signed-in dashboard (one folder per manager)
  api/             search index and admin endpoints
  sitemap.ts, robots.ts, opengraph-image.tsx
components/
  public/          site components (medicine directory, booking dialogs, search, i18n)
  admin/           admin forms and tables
  ui/              shared primitives
lib/               Supabase clients, settings, types, utilities
supabase/          migrations/ and seed.sql
middleware.ts      auth guard for /admin/*
```

## Run it locally

You need Node.js 18.18+ and a free [Supabase](https://supabase.com) project.

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase URL and keys
```

1. In the Supabase SQL editor, run every file in `supabase/migrations/` in order, then `supabase/seed.sql`.
2. Under **Authentication → Users**, add a user. That user can sign in at `/admin/login`.
3. Start the app:

```bash
npm run dev          # http://localhost:3000, with the admin panel at /admin
npm run build        # production build
npm run type-check   # tsc --noEmit
npm run lint
```

`RESEND_API_KEY` and `NOTIFY_EMAIL` are optional. Without them, submissions still save and the server logs a warning instead of sending email.

## Deploy

The site is deployed on Vercel from this repository. Add the variables from `.env.local.example` under the project's environment variables, and every push to `main` deploys automatically.

## Design

Fraunces (headings) and Inter (body), with a plum `#6B2C5F`, teal `#2A9B8E` and cream `#FAF6F0` palette. It uses hairline borders and generous whitespace.

---

Built and maintained by [Darshak Alapati](https://darshakalapati.com).
