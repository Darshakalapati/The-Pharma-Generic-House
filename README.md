# The Pharma Generic House

Website + admin panel for **The Pharma Generic House**, a family-owned pharmacy in Vijayawada (pharmagenerichouse.com).

Built with **Next.js 14** (App Router) · **TypeScript** · **Tailwind CSS** · **Supabase** (Postgres, Auth, Storage) · **shadcn/ui** primitives.

---

## Features

**Public site**
- Home, Products, Doctors, Tests, About, Contact
- Product browsing with category filter, search, and an enquiry cart (localStorage-persisted) supporting WhatsApp / Submit / Reserve-for-pickup flows
- Doctor appointment booking (with day/slot validation)
- Lab test booking (shop or home collection)
- Contact form
- Floating WhatsApp button on every page

**Admin panel** (`/admin`, password-protected)
- Dashboard with key stats and today's schedule
- Manage appointments, test bookings, product enquiries, contact messages — with status changes, click-to-call, and pre-filled WhatsApp replies
- CRUD for products, doctors, and tests with image upload to Supabase Storage
- Settings panel for shop info (phone, WhatsApp, address, hours) and feature flags (Reservation for Pickup)

---

## Getting started

### 1. Prerequisites

- Node.js 18.18+ and npm
- A Supabase project ([create one for free](https://supabase.com))

### 2. Install

```bash
npm install
```

> **Note:** This project was scaffolded without `git init` because the macOS `git`
> binary required the Xcode license agreement (which can't be accepted from a sandbox).
> Initialize the repo yourself with:
>
> ```bash
> sudo xcodebuild -license accept   # one time, if you haven't already
> git init
> git add .
> git commit -m "Initial commit: The Pharma Generic House"
> ```

### 3. Configure environment

Copy `.env.local.example` to `.env.local` and fill in the three Supabase values from your project's API settings:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 4. Run database migrations and seed

In the Supabase dashboard **SQL Editor**, run the files in order:

1. `supabase/migrations/0001_init.sql` — creates tables, enums, RLS policies, storage bucket
2. `supabase/seed.sql` — seeds 20 products, 3 doctors, 6 tests, and the default settings row

You can paste each file's contents directly into a new query and click **Run**.

### 5. Create the first admin user

In your Supabase dashboard:

1. Go to **Authentication → Users → Add user**
2. Create a user with email + password (e.g. your father's email)
3. Confirm the email manually if needed (toggle "Auto Confirm User")

That user can now sign in at `/admin/login`. Repeat to add more admins.

> Any authenticated user has full admin access. To restrict, add a custom role check.

### 6. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000 — the public site lives at `/`, the admin panel at `/admin`.

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project** and import the GitHub repo.
3. In **Environment Variables**, add the three from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**. Vercel will build and host the site.
5. Add your custom domain (`pharmagenerichouse.com`) in the project's **Domains** tab.

> The middleware uses Supabase auth cookies — Vercel's Edge runtime supports this out of the box.

---

## Updating shop info (phone, WhatsApp, address, hours)

These values are editable from the admin panel without redeploying:

1. Sign in at `/admin`
2. Go to **Settings**
3. Update the fields under **Shop information** and click **Save shop info**

Changes appear on the website within a few seconds (cached server-rendered pages refresh on the next visit).

The values in `lib/constants.ts` are only fallbacks used when no row exists in the `settings` table.

---

## Toggling Reservation for Pickup

In **Settings**, toggle "Enable Reservation for Pickup" on or off. When ON, customers see a third button (alongside WhatsApp and Submit Enquiry) on the products page that places a reserved enquiry tagged with a note for the admin.

---

## Project structure

```
app/
  (public)/                    public site routes
    layout.tsx, page.tsx, products/, doctors/, tests/, about/, contact/
  admin/
    login/                     /admin/login (no auth)
    (dashboard)/               authed layout — sidebar + topbar
      layout.tsx
      page.tsx                 /admin (dashboard)
      appointments/
      test-bookings/
      enquiries/
      messages/
      products/
      doctors/
      tests/
      settings/
  layout.tsx                   root layout (fonts, toaster)
  globals.css

components/
  ui/                          shadcn-style primitives
  public/                      public-site components
  admin/                       admin components

lib/
  supabase/{client,server,admin}.ts
  constants.ts, utils.ts, types.ts, settings.ts

supabase/
  migrations/0001_init.sql
  seed.sql

middleware.ts                  auth guard for /admin/*
```

---

## Design tokens

Brand palette (also in `tailwind.config.ts`):

- Purple `#6B2C5F` · Teal `#2A9B8E`
- Cream `#FBF7F2` · White surfaces
- Ink text `#1F1A1F` · Muted `#6B6470`

Typography: **Fraunces** (serif, headings) and **Inter** (body), via `next/font/google`.

---

## Common tasks

```bash
npm run dev         # start dev server
npm run build       # production build
npm run start       # serve production build
npm run lint        # eslint
npm run type-check  # tsc --noEmit
```

---

## Notes

- All public form submissions (enquiries, appointments, test bookings, contact messages) are inserts protected by RLS — anyone can submit, only admins can read/update.
- Product/doctor images are stored in the public `public-images` bucket. Reads are public; writes require an authenticated admin session.
- Phone numbers are validated as Indian (+91 / 10-digit mobile) on the client. If you ship internationally, update `isValidPhoneIN` in `lib/utils.ts`.
- The home page hero composition is CSS-only (no stock photos). Replace `components/public/hero-art.tsx` if you'd like a different aesthetic.

---

## Support

For issues with the website, contact your developer.
For shop questions, customers should use the WhatsApp button on every page.

© 2026 The Pharma Generic House.
