import {
  ScrollReveal,
  ScrollRevealItem,
} from '@/components/public/motion/scroll-reveal';
import { resolveContrast } from '@/lib/contrast';
import type { Dictionary, Locale } from '@/lib/i18n/types';
import type { ShopSettings } from '@/lib/types';

/**
 * Two lines, no chrome. The whole point is the beat between them, so it gets
 * air rather than a background, a border or a button — anything else would
 * read as another card and the contrast would stop landing.
 */
export function ContrastBand({
  dict,
  locale,
  settings,
}: {
  dict: Dictionary;
  locale: Locale;
  settings: ShopSettings;
}) {
  const { line1, line2 } = resolveContrast(dict, locale, settings);

  // The big line carries the section. Without it there is nothing to show.
  if (!line2) return null;

  return (
    <ScrollReveal
      as="section"
      id="contrast"
      className="container-public py-12 sm:py-20"
      stagger={0.12}
    >
      <div className="mx-auto max-w-[46ch] text-center">
        {line1 && (
          <ScrollRevealItem as="p" className="text-[1.0625rem] text-ink-muted leading-[1.6]">
            {line1}
          </ScrollRevealItem>
        )}
        <ScrollRevealItem
          as="p"
          className="mt-3 font-serif font-medium text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.25] tracking-[-0.015em] text-ink text-balance"
        >
          {line2}
        </ScrollRevealItem>
      </div>
    </ScrollReveal>
  );
}
