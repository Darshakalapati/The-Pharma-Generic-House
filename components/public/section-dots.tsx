'use client';

import * as React from 'react';
import { useReducedMotion } from 'framer-motion';
import { useT } from './i18n/language-provider';
import { cn } from '@/lib/utils';

/** Section ids in page order, paired with the dictionary path for their label. */
const SECTIONS = [
  { id: 'hero', label: (d: ReturnType<typeof useT>['dict']) => d.hero.eyebrow },
  { id: 'today', label: (d: ReturnType<typeof useT>['dict']) => d.today.eyebrow },
  { id: 'offer', label: (d: ReturnType<typeof useT>['dict']) => d.offer.eyebrow },
  { id: 'numbers', label: (d: ReturnType<typeof useT>['dict']) => d.stats.eyebrow },
  { id: 'story', label: (d: ReturnType<typeof useT>['dict']) => d.founder.eyebrow },
  { id: 'doctors', label: (d: ReturnType<typeof useT>['dict']) => d.doctors.eyebrow },
  { id: 'diagnostics', label: (d: ReturnType<typeof useT>['dict']) => d.diagnostics.eyebrow },
  { id: 'questions', label: (d: ReturnType<typeof useT>['dict']) => d.faq.eyebrow },
];

/**
 * A quiet position indicator down the right edge of the home page.
 *
 * Desktop and fine pointers only: on a phone it would compete with the sticky
 * action bar for the same thumb zone, and the page is short enough to scroll.
 * Positioned clear of the WhatsApp float, which owns the bottom-right corner.
 */
export function SectionDots() {
  const { dict } = useT();
  const reduced = useReducedMotion();
  const [active, setActive] = React.useState<string | null>(null);
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setEnabled(fine.matches);
    sync();
    fine.addEventListener('change', sync);
    return () => fine.removeEventListener('change', sync);
  }, []);

  React.useEffect(() => {
    if (!enabled) return;
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (n): n is HTMLElement => n !== null
    );
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // The entry closest to the top of the viewport wins.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <nav
      aria-label="Sections"
      className="fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex"
    >
      {SECTIONS.map((section) => {
        const isActive = active === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() =>
              document
                .getElementById(section.id)
                ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
            }
            className="group flex items-center gap-2"
          >
            <span className="pointer-events-none max-w-0 overflow-hidden whitespace-nowrap text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink-muted opacity-0 transition-[max-width,opacity] duration-300 group-hover:max-w-[12rem] group-hover:opacity-100">
              {section.label(dict)}
            </span>
            <span
              aria-hidden
              className={cn(
                'block rounded-full transition-all duration-200',
                isActive ? 'h-2 w-2 bg-plum' : 'h-1.5 w-1.5 bg-line group-hover:bg-ink-faint'
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
