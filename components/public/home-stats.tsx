'use client';

import * as React from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { ScrollReveal, ScrollRevealItem } from '@/components/public/motion/scroll-reveal';
import { cn } from '@/lib/utils';

const STATS = [
  { value: 125, suffix: '+', label: 'customers every day' },
  { value: 50, suffix: '+', label: 'prescriptions filled daily' },
  { value: 30000, suffix: '+', label: 'prescriptions since 2018' },
  { value: 7, suffix: '+', label: 'years serving Vijayawada' },
];

const DURATION_MS = 1600;

/** ease-out-cubic — fast off the mark, settling into the final number. */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * "By the numbers" band. All four figures share one requestAnimationFrame
 * loop, so they start together and land together; the count runs once, the
 * first time the band scrolls into view. Under `prefers-reduced-motion` the
 * final values render immediately.
 */
export function HomeStats() {
  const gridRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(gridRef, { once: true, margin: '-100px' });
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setProgress(1);
      return;
    }

    let frame = 0;
    let startedAt: number | null = null;
    const step = (now: number) => {
      if (startedAt === null) startedAt = now;
      const t = Math.min((now - startedAt) / DURATION_MS, 1);
      setProgress(easeOutCubic(t));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced]);

  return (
    <ScrollReveal as="section" className="mt-20 sm:mt-28 bg-bg-elevated border-y border-line">
      <div className="container-public py-12 lg:py-20">
        <ScrollRevealItem as="div" className="text-center">
          <span className="eyebrow">By the numbers</span>
        </ScrollRevealItem>

        <div ref={gridRef} className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <ScrollRevealItem
              key={stat.label}
              as="div"
              className={cn(
                'relative flex flex-col items-center justify-center text-center px-5 py-7',
                // Hairline divider between columns, desktop only.
                i > 0 &&
                  "lg:before:content-[''] lg:before:absolute lg:before:left-0 lg:before:top-1/2 lg:before:-translate-y-1/2 lg:before:h-[60%] lg:before:w-px lg:before:bg-line"
              )}
            >
              <span className="font-serif font-normal text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-plum tabular-nums">
                {Math.round(stat.value * progress).toLocaleString('en-US')}
                {stat.suffix}
              </span>
              <span className="mt-4 text-[1rem] font-normal uppercase tracking-[0.06em] text-ink-muted leading-snug max-w-[18ch]">
                {stat.label}
              </span>
            </ScrollRevealItem>
          ))}
        </div>

        <ScrollRevealItem as="p" className="mt-10 text-center font-serif italic font-normal text-[1.125rem] text-ink-muted">
          Real numbers, real trust.
        </ScrollRevealItem>
      </div>
    </ScrollReveal>
  );
}
