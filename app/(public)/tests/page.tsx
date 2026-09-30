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
import { getDictionary, getLocale } from '@/lib/i18n';
import type { MedicalTest } from '@/lib/types';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title:
    'Lab Tests in Vijayawada — Sunday Walk-ins & Home Collection (ThyroCare associate) | The Pharma Generic House',
  description:
    'Lab tests at our Governerpeta shop or collected at your home. Sunday is test day for walk-ins; home collection runs the rest of the week. Associated with ThyroCare.',
  path: '/tests',
});

export default async function TestsPage({
  searchParams,
}: {
  searchParams?: { book?: string };
}) {
  const dict = getDictionary(getLocale());
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
          <p className="font-serif italic text-[1.125rem] text-plum">
            {dict.diagnostics.sceneOpener}
          </p>
          <span className="eyebrow eyebrow--teal mt-2 block">
            {dict.diagnostics.eyebrow}
          </span>
          <h1 className="h-hero mt-4 text-balance">
            {dict.diagnostics.pageHeading}
          </h1>
        </ScrollRevealItem>
      </ScrollReveal>

      {/* Sunday is Test Day callout + lab photo */}
      <ScrollReveal as="section" className="container-public mt-6">
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          <ScrollRevealItem as="div" className="rounded-2xl bg-sand border border-line p-7 sm:p-8 flex flex-col">
            <span className="eyebrow eyebrow--teal">{dict.diagnostics.sundayEyebrow}</span>
            <h2 className="font-serif font-medium text-[clamp(1.5rem,3vw,2rem)] mt-3 tracking-[-0.015em] leading-tight">
              {dict.diagnostics.sundayHeading}
            </h2>
            <p className="mt-4 text-[1rem] text-ink-muted leading-[1.7]">
              {dict.diagnostics.sundayBody}
            </p>
            <div className="mt-6">
              <Link href="#tests" className="btn-plum">
                {dict.diagnostics.seeAllTests}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollRevealItem>

          <ScrollRevealItem as="div" className="relative aspect-[4/3] lg:aspect-auto rounded-2xl overflow-hidden border border-line shadow-soft">
            <Image
              src={IMG.diagnostics.bloodTest}
              alt="Lab samples being processed"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </ScrollRevealItem>
        </div>
      </ScrollReveal>

      {/* How it works — three steps, between the Sunday callout and the grid */}
      <DiagnosticsHowItWorks dict={dict} />

      {/* Tests grid */}
      <ScrollReveal as="section" id="tests" className="container-public mt-20 sm:mt-24 scroll-mt-24">
        <ScrollRevealItem as="div" className="max-w-2xl">
          <span className="eyebrow">{dict.diagnostics.availableEyebrow}</span>
          <h2 className="h-section mt-4">{dict.diagnostics.availableHeading}</h2>
          <p className="mt-4 text-[1.0625rem] text-ink-muted leading-[1.7]">
            {dict.diagnostics.availableSub}
          </p>
        </ScrollRevealItem>

        <ScrollRevealItem as="div" className="mt-10">
          <TestList tests={tests} openTestId={searchParams?.book} />
        </ScrollRevealItem>
      </ScrollReveal>

      {/* ThyroCare associate note */}
      <ScrollReveal as="section" className="container-public mt-20 sm:mt-24 pb-16">
        <ScrollRevealItem as="div" className="rounded-2xl bg-bg-elevated border border-line p-7 sm:p-9 max-w-3xl">
          <span className="eyebrow eyebrow--teal">{dict.diagnostics.associatedWith}</span>
          <h2 className="font-serif font-medium text-[clamp(1.5rem,3vw,2rem)] mt-3 tracking-[-0.015em]">
            ThyroCare
          </h2>
          <p className="mt-4 text-[1rem] text-ink-muted leading-[1.75]">
            {dict.diagnostics.thyroBody}
          </p>
        </ScrollRevealItem>
      </ScrollReveal>
      </div>
    </>
  );
}
