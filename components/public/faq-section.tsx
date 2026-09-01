import { createClient } from '@/lib/supabase/server';
import { getDictionary, getLocale } from '@/lib/i18n';
import { FaqAccordion } from './faq-accordion';
import {
  ScrollReveal,
  ScrollRevealItem,
} from '@/components/public/motion/scroll-reveal';
import type { Faq } from '@/lib/types';

/**
 * The questions asked at the counter, answered once.
 *
 * The JSON-LD is emitted in English only and always from the English columns —
 * search engines index one canonical language, and the site has no localised
 * URLs for a Telugu variant to point at.
 */
export async function FaqSection() {
  const supabase = createClient();
  const locale = getLocale();
  const dict = getDictionary(locale);

  const { data } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  const faqs = (data as Faq[] | null) ?? [];
  if (faqs.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <ScrollReveal as="section" id="questions" className="container-public mt-20 sm:mt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollRevealItem as="div" className="max-w-2xl">
        <span className="eyebrow">{dict.faq.eyebrow}</span>
        <h2 className="h-section mt-4">{dict.faq.heading}</h2>
      </ScrollRevealItem>

      <ScrollRevealItem as="div" className="mt-10 max-w-3xl">
        <FaqAccordion faqs={faqs} locale={locale} />
      </ScrollRevealItem>
    </ScrollReveal>
  );
}
