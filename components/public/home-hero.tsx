'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal, ScrollRevealItem } from '@/components/public/motion/scroll-reveal';
import { HeroCapsuleVisual } from '@/components/public/hero-capsule-visual';

export function HomeHero() {
  return (
    <ScrollReveal as="section" className="container-public pt-12 sm:pt-16 pb-10 sm:pb-16">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <ScrollRevealItem as="span" className="eyebrow block">
            Vijayawada · Established Family Pharmacy
          </ScrollRevealItem>
          <ScrollRevealItem as="h1" className="h-hero mt-5 text-balance">
            Medicines, doctors, and lab tests — under one trusted roof.
          </ScrollRevealItem>
          <ScrollRevealItem as="p" className="mt-6 text-[1.0625rem] text-ink-muted leading-[1.7] max-w-[55ch]">
            From everyday medicines to Ayurvedic care, doctor consultations, and Sunday
            lab tests — The Pharma Generic House has served Vijayawada families for
            over a decade.
          </ScrollRevealItem>
          <ScrollRevealItem as="div" className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/products" className="btn-plum">
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/doctors" className="link-underline link-plum text-[0.95rem]">
              Book an Appointment →
            </Link>
          </ScrollRevealItem>
        </div>

        <ScrollRevealItem as="div" className="relative">
          <div className="relative rounded-2xl overflow-hidden">
            <HeroCapsuleVisual />
          </div>
          {/* Tiny floating accent — small teal cross */}
          <div
            aria-hidden
            className="absolute -bottom-3 -left-3 h-12 w-12 rounded-full bg-teal/10 border border-teal/20 hidden sm:flex items-center justify-center"
          >
            <span className="block h-2 w-2 rounded-full bg-teal" />
          </div>
        </ScrollRevealItem>
      </div>
    </ScrollReveal>
  );
}
