import { OpenStatus } from './open-status';
import { LanguageToggle } from './language-toggle';
import type { Dictionary } from '@/lib/i18n/types';
import type { Schedule } from '@/lib/hours';

/**
 * Thin strip above the main nav carrying the things that used to crowd it —
 * the establishment line, the open/closed pill and the language toggle.
 *
 * Moving them here is what stops the nav overflowing at MacBook widths: the
 * nav is left with the brand, six links and two controls, which fits on one
 * line at every size. Deliberately not sticky — it scrolls away and gives the
 * sticky nav the full width back once the page moves.
 */
export function UtilityBar({
  schedule,
  dict,
}: {
  schedule: Schedule;
  dict: Dictionary;
}) {
  return (
    <div className="border-b border-line bg-bg">
      <div className="container-public flex h-[34px] items-center justify-between gap-4">
        <span className="hidden md:block text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-muted whitespace-nowrap">
          {dict.hero.estTagline}
        </span>
        {/* Pushed right on small screens, where the tagline is hidden. */}
        <div className="ml-auto flex items-center gap-2">
          <OpenStatus
            schedule={schedule}
            compact
            compactBelow="md"
            className="border-transparent px-0 py-0 text-[0.75rem]"
          />
          <LanguageToggle className="whitespace-nowrap px-2.5 py-[3px] text-[0.75rem]" />
        </div>
      </div>
    </div>
  );
}
