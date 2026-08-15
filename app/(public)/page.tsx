import Link from 'next/link';
import Image from 'next/image';
import {
  Pill,
  Leaf,
  Sparkles,
  Stethoscope,
  ArrowRight,
  Phone,
  MapPin,
  FlaskConical,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getShopSettings } from '@/lib/settings';
import { whatsappLink, telLink } from '@/lib/utils';
import { IMG } from '@/lib/images';
import { WhatsAppGlyph } from '@/components/public/whatsapp-glyph';
import { VideoTestimonials } from '@/components/public/video-testimonials';
import { CustomerReviews } from '@/components/public/customer-reviews';
import { PromoBanners } from '@/components/public/promo-banners';
import { HomeHero } from '@/components/public/home-hero';
import { DoctorsCarousel } from '@/components/public/doctors-carousel';
import { HomeStats } from '@/components/public/home-stats';
import { FamilyStory } from '@/components/public/family-story';
import { MortarPestleAccent } from '@/components/public/botanical-accents';
import {
  ScrollReveal,
  ScrollRevealItem,
  StaggerGrid,
  StaggerGridItem,
} from '@/components/public/motion/scroll-reveal';
import type { Doctor, FamilyMember, HeroPhoto, MedicalTest } from '@/lib/types';

const OFFERS = [
  {
    icon: Pill,
    title: 'General & Pharma Medicines',
    body: 'Branded and generic medicines for everyday and prescription needs.',
    href: '/products?cat=general',
  },
  {
    icon: Leaf,
    title: 'Ayurvedic Care',
    body: 'Traditional remedies, classical formulations, and daily wellness products.',
    href: '/products?cat=ayurvedic',
  },
  {
    icon: Sparkles,
    title: 'Cosmetic & Personal Care',
    body: 'Trusted skincare, hair care, and personal hygiene brands.',
    href: '/products?cat=cosmetic',
  },
  {
    icon: Stethoscope,
    title: 'Doctor Consultations',
    body: 'In-house Nadi, Physiotherapy, and Homeopathy consultations.',
    href: '/doctors',
  },
];

// The six diagnostics featured on the home page preview band. Names match
// rows in the `tests` table; the home page queries Supabase and displays
// these specific tests in this order.
const FEATURED_TEST_NAMES = [
  'Thyroid Profile Total (T3, T4, TSH)',
  'Aarogyam 1.3 (Full Body Checkup)',
  'Diabetes Screening (HbA1c + Fasting Sugar)',
  'Vitamin D (25-OH)',
  'Lipid Profile',
  'Complete Blood Count (CBC)',
];

const PRODUCT_TILES = [
  {
    image: IMG.categories.general,
    title: 'General Medicine',
    body: 'Daily essentials, fevers, antacids, and over-the-counter care.',
    href: '/products?cat=general',
  },
  {
    image: IMG.categories.pharma,
    title: 'Pharma (Prescription)',
    body: 'Branded prescription medicines, including cold-chain stored items.',
    href: '/products?cat=pharma',
  },
  {
    image: IMG.categories.ayurvedic,
    title: 'Ayurvedic',
    body: 'Classical formulations — Chyawanprash, Triphala, herbal oils.',
    href: '/products?cat=ayurvedic',
  },
  {
    image: IMG.categories.cosmetic,
    title: 'Cosmetic & Personal Care',
    body: 'Sunscreens, serums, lip balms, and dermatologically sound brands.',
    href: '/products?cat=cosmetic',
  },
];

export default async function HomePage() {
  const supabase = createClient();
  const settings = await getShopSettings();

  // hero_photos and family_members arrive with migrations 0009 / 0010. Until
  // those are applied the queries just return an error and `data` is null, and
  // both sections fall back to their built-in content — so the page renders
  // correctly either way.
  const [
    { data: doctors },
    { data: tests },
    { count: totalTestsCount },
    { data: heroPhotos },
    { data: familyMembers },
  ] = await Promise.all([
    supabase
      .from('doctors')
      .select('*')
      // No limit — the carousel carries every active doctor.
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('tests')
      .select('*')
      .eq('is_active', true)
      .in('name', FEATURED_TEST_NAMES),
    supabase
      .from('tests')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('hero_photos')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('family_members')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(1),
  ]);

  const docs: Doctor[] = doctors ?? [];
  const heroSlides = ((heroPhotos as HeroPhoto[] | null) ?? []).map((p) => ({
    id: p.id,
    image_url: p.image_url,
    alt_text: p.alt_text,
  }));
  const featuredMember = ((familyMembers as FamilyMember[] | null) ?? [])[0] ?? null;
  // Render featured tests in the curated order (Supabase .in() is unordered).
  const featuredOrder = new Map(FEATURED_TEST_NAMES.map((n, i) => [n, i]));
  const testList: MedicalTest[] = ((tests as MedicalTest[]) ?? [])
    .slice()
    .sort((a, b) => (featuredOrder.get(a.name) ?? 99) - (featuredOrder.get(b.name) ?? 99));
  const totalTests = totalTestsCount ?? testList.length;

  return (
    <>
      {/* SECTION 1 — HERO ─────────────────────────────────────────── */}
      <HomeHero photos={heroSlides} />

      {/* Trust bar */}
      <ScrollReveal as="section" className="bg-sand border-y border-line">
        <ScrollRevealItem as="div" className="container-public py-3.5 md:overflow-x-auto">
          {/* Wraps onto two lines on phones rather than scrolling sideways. */}
          <p className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-center md:flex-nowrap md:justify-start md:gap-5 md:whitespace-nowrap md:text-left text-[0.875rem] text-ink-muted">
            <span>Pharmacy built on trust since 2018</span>
            <span aria-hidden className="text-ink-faint">·</span>
            <span>ThyroCare associate</span>
            <span aria-hidden className="text-ink-faint">·</span>
            <span>Home test collection</span>
            <span aria-hidden className="text-ink-faint">·</span>
            <span>Mon–Sat 9 AM – 10 PM</span>
            <span aria-hidden className="text-ink-faint">·</span>
            <span>Sun 9 AM – 2 PM</span>
          </p>
        </ScrollRevealItem>
      </ScrollReveal>

      {/* SECTION 2 — WHAT WE OFFER ────────────────────────────────── */}
      <ScrollReveal as="section" className="container-public relative mt-20 sm:mt-28">
        <MortarPestleAccent className="left-0 -bottom-10" />

        <ScrollRevealItem as="div" className="max-w-2xl">
          <span className="eyebrow">What we offer</span>
          <h2 className="h-section mt-4">Four ways we help you stay well.</h2>
        </ScrollRevealItem>

        <StaggerGrid inherit className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch" stagger={0.06}>
          {OFFERS.map((o) => (
            <StaggerGridItem key={o.title} className="h-full">
            <Link href={o.href} className="card-soft p-7 flex flex-col h-full group">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-plum-tint text-plum">
                <o.icon className="h-5 w-5" />
              </span>
              <h3 className="h-card mt-5">{o.title}</h3>
              <p className="mt-2 text-[0.95rem] text-ink-muted leading-[1.6] flex-1">
                {o.body}
              </p>
              <span className="mt-auto pt-5 inline-flex items-center gap-1 text-[0.875rem] font-medium text-plum">
                Learn more
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            </StaggerGridItem>
          ))}
        </StaggerGrid>
      </ScrollReveal>

      {/* SECTION 2.5 — PROMO BANNERS (hidden when no active banners) ── */}
      <PromoBanners />

      {/* SECTION 2.6 — BY THE NUMBERS ─────────────────────────────── */}
      <HomeStats />

      {/* SECTION 2.7 — OUR STORY / THE PERSON BEHIND THE SHOP ─────── */}
      <FamilyStory member={featuredMember} />

      {/* SECTION 3 — DOCTORS ──────────────────────────────────────── */}
      {docs.length > 0 && (
        <ScrollReveal as="section" className="container-public mt-20 sm:mt-28">
          <ScrollRevealItem as="div" className="max-w-2xl">
            <span className="eyebrow">Consultations</span>
            <h2 className="h-section mt-4">Our practitioners. By appointment.</h2>
            <p className="mt-4 text-ink-muted text-[1.0625rem] leading-[1.7]">
              Visit on scheduled days for in-shop consultations, or request a homeopathy slot.
            </p>
          </ScrollRevealItem>

          <ScrollRevealItem as="div" className="mt-12">
            <DoctorsCarousel doctors={docs} />
          </ScrollRevealItem>
        </ScrollReveal>
      )}

      {/* SECTION 3.5 — VIDEO TESTIMONIALS (hidden when no active videos) ── */}
      <VideoTestimonials />

      {/* SECTION 3.6 — CUSTOMER REVIEWS (hidden when no active reviews) ── */}
      <CustomerReviews />

      {/* SECTION 4 — SUNDAY DIAGNOSTICS ──────────────────────────── */}
      <ScrollReveal as="section" className="mt-24 sm:mt-32 bg-sand border-y border-line">
        <div className="container-public py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <ScrollRevealItem as="span" className="eyebrow eyebrow--teal block">
                Diagnostics · Associated with ThyroCare
              </ScrollRevealItem>
              <ScrollRevealItem as="h2" className="h-section mt-4 text-balance">
                Lab tests, every Sunday at our shop.
              </ScrollRevealItem>
              <ScrollRevealItem as="p" className="mt-5 text-[1.0625rem] text-ink-muted leading-[1.75]">
                Walk in any Sunday between 9 AM and 1 PM and our certified ThyroCare
                technician will collect your samples on-site. Need a test on another day?
                The technician arrives at the shop within 45 minutes — or visits your
                home anywhere in Vijayawada. Reports are delivered to you on WhatsApp.
              </ScrollRevealItem>
              <ScrollRevealItem as="div" className="mt-7">
                <Link href="/tests" className="inline-flex btn-plum">
                  Book a Test
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </ScrollRevealItem>
            </div>

            <ScrollRevealItem as="div" className="relative aspect-[5/4] rounded-2xl overflow-hidden shadow-card border border-line">
              <Image
                src={IMG.diagnostics.labEquipment}
                alt="Lab equipment for diagnostic tests"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </ScrollRevealItem>
          </div>

          {testList.length > 0 && (
            <div className="mt-16">
              <StaggerGrid inherit className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.06}>
                {testList.map((t) => (
                  <StaggerGridItem key={t.id}>
                  <div className="card-soft rounded-lg p-5 h-full">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-teal-tint text-teal-deep shrink-0">
                        <FlaskConical className="h-[1.125rem] w-[1.125rem]" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-serif font-medium text-[1.0625rem] leading-tight">
                          {t.name}
                        </p>
                        <p className="mt-1 text-[0.875rem] text-ink-muted leading-snug">
                          {t.description?.split('.')[0] ?? ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  </StaggerGridItem>
                ))}
              </StaggerGrid>
              <p className="mt-6 text-[0.875rem] text-ink-muted text-center">
                Showing {testList.length} of {totalTests} tests.{' '}
                <Link href="/tests" className="link-plum link-underline">
                  View all diagnostics →
                </Link>
              </p>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* SECTION 5 — PRODUCTS PREVIEW ────────────────────────────── */}
      <ScrollReveal as="section" className="container-public mt-20 sm:mt-28">
        <ScrollRevealItem as="div" className="max-w-2xl">
          <span className="eyebrow">Our Shelves</span>
          <h2 className="h-section mt-4">Browse what we keep in store.</h2>
          <p className="mt-4 text-ink-muted text-[1.0625rem] leading-[1.7]">
            Tap a category to see products. Add items to your enquiry list, then send
            them to us on WhatsApp — we&apos;ll confirm availability and you can pick up
            at the shop.
          </p>
        </ScrollRevealItem>

        <StaggerGrid inherit className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" stagger={0.06}>
          {PRODUCT_TILES.map((t) => (
            <StaggerGridItem key={t.title}>
            <Link href={t.href} className="card-soft overflow-hidden block group">
              <div className="relative aspect-[4/3] bg-sand overflow-hidden">
                <Image
                  src={t.image}
                  alt={t.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover img-hover-zoom"
                />
              </div>
              <div className="p-6">
                <h3 className="h-card">{t.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-ink-muted leading-[1.6]">
                  {t.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-[0.875rem] font-medium text-plum">
                  <span className="link-underline">Browse</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
            </StaggerGridItem>
          ))}
        </StaggerGrid>
      </ScrollReveal>

      {/* SECTION 6 — ABOUT TEASER ────────────────────────────────── */}
      <ScrollReveal as="section" className="container-public mt-20 sm:mt-28">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <ScrollRevealItem as="span" className="eyebrow block">About us</ScrollRevealItem>
            <ScrollRevealItem as="h2" className="h-section mt-4 text-balance">
              A neighbourhood pharmacy, built on trust.
            </ScrollRevealItem>
            <ScrollRevealItem as="p" className="mt-5 text-[1.0625rem] text-ink-muted leading-[1.75]">
              We&apos;re a trusted pharmacy in Vijayawada, serving the same community
              for more than a decade. Our shelves carry general and prescription
              medicines, classical Ayurvedic preparations, and trusted personal care
              brands — chosen with care.
            </ScrollRevealItem>
            <ScrollRevealItem as="p" className="mt-4 text-[1.0625rem] text-ink-muted leading-[1.75]">
              Alongside the shelves, we host visiting doctors and run a Sunday lab day
              with ThyroCare. Everything you need to stay well, in one place.
            </ScrollRevealItem>
            <ScrollRevealItem as="div" className="mt-7">
              <Link
                href="/about"
                className="inline-block link-underline link-plum text-[0.95rem]"
              >
                Read more about us →
              </Link>
            </ScrollRevealItem>
          </div>

          <ScrollRevealItem as="div" className="relative aspect-[5/4] rounded-2xl overflow-hidden shadow-card border border-line">
            <Image
              src={IMG.pharmacy.interior}
              alt="Inside The Pharma Generic House"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </ScrollRevealItem>
        </div>
      </ScrollReveal>

      {/* SECTION 7 — CONTACT CTA ─────────────────────────────────── */}
      <ScrollReveal as="section" className="mt-24 sm:mt-32 bg-plum text-white">
        <div className="container-public py-16 sm:py-20 text-center">
          <ScrollRevealItem as="h2" className="font-serif font-medium text-[clamp(1.875rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.02em] text-white text-balance max-w-3xl mx-auto">
            Have a question? We&apos;re here to help.
          </ScrollRevealItem>
          <ScrollRevealItem as="p" className="mt-4 text-[1.0625rem] text-white/85 max-w-2xl mx-auto leading-[1.7]">
            Call us, message on WhatsApp, or visit the shop. We respond quickly.
          </ScrollRevealItem>

          <ScrollRevealItem as="div" className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
            <a href={telLink(settings.shop_phone)} className="btn-light-outline flex-1 sm:flex-initial">
              <Phone className="h-4 w-4" />
              Call us
            </a>
            <a
              href={whatsappLink(settings.shop_whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-teal flex-1 sm:flex-initial"
            >
              <WhatsAppGlyph className="h-4 w-4" />
              WhatsApp
            </a>
            <Link href="/contact" className="btn-light-outline flex-1 sm:flex-initial">
              <MapPin className="h-4 w-4" />
              Visit
            </Link>
          </ScrollRevealItem>

          <ScrollRevealItem as="p" className="mt-8 text-[0.875rem] text-white/70">
            Mon–Sat 9 AM – 10 PM · Sun 9 AM – 2 PM
          </ScrollRevealItem>
        </div>
      </ScrollReveal>
    </>
  );
}
