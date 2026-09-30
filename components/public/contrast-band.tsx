import {
  ScrollReveal,
  ScrollRevealItem,
} from '@/components/public/motion/scroll-reveal';
import type { Dictionary } from '@/lib/i18n/types';

/**
 * Two lines, no chrome. The whole point is the beat between them, so it gets
 * air rather than a background, a border or a button — anything else would
 * read as another card and the contrast would stop landing.
 */
export function ContrastBand({ dict }: { dict: Dictionary }) {
  return (
    <ScrollReveal
      as="section"
      id="contrast"
      className="container-public py-12 sm:py-20"
      stagger={0.12}
    >
      <div className="mx-auto max-w-[46ch] text-center">
        <ScrollRevealItem as="p" className="text-[1.0625rem] text-ink-muted leading-[1.6]">
          {dict.contrast.line1}
        </ScrollRevealItem>
        <ScrollRevealItem
          as="p"
          className="mt-3 font-serif font-medium text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.25] tracking-[-0.015em] text-ink text-balance"
        >
          {dict.contrast.line2}
        </ScrollRevealItem>
      </div>
    </ScrollReveal>
  );
}
