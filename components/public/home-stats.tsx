'use client';

import * as React from 'react';
import { useReducedMotion } from 'framer-motion';
import { ScrollReveal, ScrollRevealItem } from '@/components/public/motion/scroll-reveal';
import { cn } from '@/lib/utils';

const STATS = [
  { value: '125+', label: 'customers every day' },
  { value: '50+', label: 'prescriptions filled daily' },
  { value: '30,000+', label: 'prescriptions since 2018' },
  { value: '7+', label: 'years serving Vijayawada' },
];

/**
 * "By the numbers" band.
 *
 * The figures ride a continuous right-to-left marquee — the movement is the
 * animation, so the numbers themselves are static. Under
 * `prefers-reduced-motion` the marquee is replaced outright by the static
 * four-column grid with hairline dividers.
 */
export function HomeStats() {
  const reduced = useReducedMotion();

  return (
    <ScrollReveal as="section" className="mt-20 sm:mt-28 bg-bg-elevated border-y border-line">
      <div className="container-public pt-12 lg:pt-20">
        <ScrollRevealItem as="div" className="text-center">
          <span className="eyebrow">By the numbers</span>
        </ScrollRevealItem>
      </div>

      {reduced ? (
        <div className="container-public">
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={cn(
                  'relative flex flex-col items-center justify-center text-center px-5 py-7',
                  // Hairline divider between columns, desktop only.
                  i > 0 &&
                    "lg:before:content-[''] lg:before:absolute lg:before:left-0 lg:before:top-1/2 lg:before:-translate-y-1/2 lg:before:h-[60%] lg:before:w-px lg:before:bg-line"
                )}
              >
                <span className="font-serif font-normal text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-plum tabular-nums">
                  {stat.value}
                </span>
                <span className="mt-4 text-[1rem] font-normal uppercase tracking-[0.06em] text-ink-muted leading-snug max-w-[18ch]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="marquee mt-10">
          <div className="marquee-track">
            {/* Two identical runs — the second is what the loop wraps onto. */}
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
                {STATS.map((stat) => (
                  <React.Fragment key={stat.label}>
                    <div className="flex items-baseline gap-3 whitespace-nowrap">
                      <span className="font-serif font-normal text-[2.5rem] leading-none text-plum tabular-nums">
                        {stat.value}
                      </span>
                      <span className="text-[1rem] font-normal text-ink-muted first-letter:uppercase">
                        {stat.label}
                      </span>
                    </div>
                    <span
                      aria-hidden
                      className="mx-12 h-1.5 w-1.5 shrink-0 self-center rounded-full bg-teal"
                    />
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container-public pb-12 lg:pb-20">
        <ScrollRevealItem as="p" className="mt-10 text-center font-serif italic font-normal text-[1.125rem] text-ink-muted">
          Real numbers, real trust.
        </ScrollRevealItem>
      </div>
    </ScrollReveal>
  );
}
