'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal, ScrollRevealItem } from '@/components/public/motion/scroll-reveal';
import { KenBurnsPhoto, type KenBurnsSlide } from '@/components/public/ken-burns-photo';
import { LeafAccent } from '@/components/public/botanical-accents';
import { Magnetic } from '@/components/public/motion/magnetic';

const HERO_PHOTO =
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&q=85&auto=format&fit=crop';

const HERO_ALT = 'Inside The Pharma Generic House pharmacy';

/** Used until an admin uploads hero photos in /admin/hero-photos. */
const FALLBACK_SLIDE: KenBurnsSlide = {
  id: 'fallback',
  image_url: HERO_PHOTO,
  alt_text: HERO_ALT,
};

/** One photo: a 20s zoom on a loop. Several: a 12s crossfade between them. */
const SINGLE_PHOTO_CYCLE_MS = 20000;
const MULTI_PHOTO_CYCLE_MS = 12000;

export function HomeHero({ photos = [] }: { photos?: KenBurnsSlide[] }) {
  const reduced = useReducedMotion();
  const slides = photos.length > 0 ? photos : [FALLBACK_SLIDE];
  const cycleMs = slides.length > 1 ? MULTI_PHOTO_CYCLE_MS : SINGLE_PHOTO_CYCLE_MS;

  return (
    <ScrollReveal as="section" className="container-public relative pt-12 sm:pt-16 pb-10 sm:pb-16">
      <LeafAccent className="right-4 top-2 xl:right-8" />

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <ScrollRevealItem as="span" className="eyebrow block">
            Vijayawada · Trusted Neighbourhood Pharmacy
          </ScrollRevealItem>
          <ScrollRevealItem as="h1" className="h-hero mt-5 text-balance">
            Medicines, doctors, and lab tests — under one trusted roof.
          </ScrollRevealItem>
          <ScrollRevealItem as="p" className="mt-6 text-[1.0625rem] text-ink-muted leading-[1.7] max-w-[55ch]">
            From everyday medicines to Ayurvedic care, doctor consultations, and Sunday
            lab tests — The Pharma Generic House has served Vijayawada for
            over a decade.
          </ScrollRevealItem>
          <ScrollRevealItem as="div" className="mt-8 flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 md:gap-6">
            <Magnetic className="w-full md:w-auto">
              <Link href="/products" className="btn-plum w-full md:w-auto h-12 md:h-11">
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
            <Link href="/doctors" className="link-underline link-plum text-[0.95rem] w-full md:w-auto inline-flex items-center justify-center md:justify-start min-h-[48px] md:min-h-0">
              Book an Appointment →
            </Link>
          </ScrollRevealItem>
        </div>

        <motion.div
          className="relative"
          initial={reduced ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
        >
          <div className="relative aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden border border-line shadow-card bg-sand">
            <KenBurnsPhoto
              slides={slides}
              cycleMs={cycleMs}
              fallbackAlt={HERO_ALT}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          {/* Tiny floating accent — small teal cross */}
          <div
            aria-hidden
            className="absolute -bottom-3 -left-3 h-12 w-12 rounded-full bg-teal/10 border border-teal/20 hidden sm:flex items-center justify-center"
          >
            <span className="block h-2 w-2 rounded-full bg-teal" />
          </div>
        </motion.div>
      </div>
    </ScrollReveal>
  );
}
