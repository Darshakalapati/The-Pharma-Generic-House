import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { TestList } from '@/components/public/test-list';
import { DiagnosticsBackground3D } from '@/components/public/diagnostics-background-3d';
import { DiagnosticsHowItWorks } from '@/components/public/diagnostics-how-it-works';
import {
  ScrollReveal,
  ScrollRevealItem,
} from '@/components/public/motion/scroll-reveal';
import { IMG } from '@/lib/images';
import type { MedicalTest } from '@/lib/types';

export const metadata = {
  title: 'Diagnostics',
  description:
    'Lab tests at the shop or at home — Sundays at the shop, with home collection on other days. Associated with ThyroCare.',
};

export default async function TestsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('tests')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  const tests: MedicalTest[] = data ?? [];

  return (
    <>
      <DiagnosticsBackground3D />
      <div className="relative z-10">
      {/* Hero */}
      <ScrollReveal as="section" className="container-public pt-12 sm:pt-16 pb-8">
        <ScrollRevealItem as="div" className="max-w-2xl">
          <span className="eyebrow eyebrow--teal">Diagnostics · Associated with ThyroCare</span>
          <h1 className="h-hero mt-4 text-balance">
            Lab tests at the shop or your home.
          </h1>
        </ScrollRevealItem>
      </ScrollReveal>

      {/* Sunday is Test Day callout + lab photo */}
      <ScrollReveal as="section" className="container-public mt-6">
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          <ScrollRevealItem as="div" className="rounded-2xl bg-sand border border-line p-7 sm:p-8 flex flex-col">
            <span className="eyebrow eyebrow--teal">Sunday is Test Day</span>
            <h2 className="font-serif font-medium text-[clamp(1.5rem,3vw,2rem)] mt-3 tracking-[-0.015em] leading-tight">
              Walk-in collection from 9 AM to 1 PM.
            </h2>
            <p className="mt-4 text-[1rem] text-ink-muted leading-[1.7]">
              Every Sunday, our certified ThyroCare technician collects samples right at
              the shop. Need a test on another day? The technician arrives within 45
              minutes — or visits your home anywhere in Vijayawada. Reports are delivered
              on WhatsApp within 24–48 hours.
            </p>
            <div className="mt-6">
              <Link href="#tests" className="btn-plum">
                See all tests
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollRevealItem>

          <ScrollRevealItem as="div" className="relative aspect-[4/3] lg:aspect-auto rounded-2xl overflow-hidden border border-line shadow-soft">
            <Image
              src={IMG.diagnostics.bloodTest}
              alt="Lab samples being processed"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </ScrollRevealItem>
        </div>
      </ScrollReveal>

      {/* How it works — three steps, between the Sunday callout and the grid */}
      <DiagnosticsHowItWorks />

      {/* Tests grid */}
      <ScrollReveal as="section" id="tests" className="container-public mt-20 sm:mt-24 scroll-mt-24">
        <ScrollRevealItem as="div" className="max-w-2xl">
          <span className="eyebrow">Available Tests</span>
          <h2 className="h-section mt-4">All tests offered.</h2>
          <p className="mt-4 text-[1.0625rem] text-ink-muted leading-[1.7]">
            Tap any test to book your slot. We&apos;ll confirm by WhatsApp.
          </p>
        </ScrollRevealItem>

        <ScrollRevealItem as="div" className="mt-10">
          <TestList tests={tests} />
        </ScrollRevealItem>
      </ScrollReveal>

      {/* ThyroCare associate note */}
      <ScrollReveal as="section" className="container-public mt-20 sm:mt-24 pb-24">
        <ScrollRevealItem as="div" className="rounded-2xl bg-bg-elevated border border-line p-7 sm:p-9 max-w-3xl">
          <span className="eyebrow eyebrow--teal">Associated with</span>
          <h2 className="font-serif font-medium text-[clamp(1.5rem,3vw,2rem)] mt-3 tracking-[-0.015em]">
            ThyroCare
          </h2>
          <p className="mt-4 text-[1rem] text-ink-muted leading-[1.75]">
            Samples collected at our shop are processed at ThyroCare — one of India&apos;s
            largest accredited diagnostic labs. Reports arrive on WhatsApp within 24–48
            hours. If a specific test isn&apos;t listed, just ask — we can almost always
            arrange it.
          </p>
        </ScrollRevealItem>
      </ScrollReveal>
      </div>
    </>
  );
}
