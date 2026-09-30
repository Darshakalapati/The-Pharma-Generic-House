import {
  ScrollReveal,
  ScrollRevealItem,
} from '@/components/public/motion/scroll-reveal';
import { formatHoursSegments, type Schedule } from '@/lib/hours';
import type { Dictionary } from '@/lib/i18n/types';

/**
 * The shop's promise, set as a doctor's prescription slip.
 *
 * Entirely decorative — no links, no actions. It restates in the shop's own
 * visual language what the page has already said in prose, immediately before
 * the callback band asks for something.
 */
export function RxCard({
  dict,
  schedule,
}: {
  dict: Dictionary;
  /** Live hours, so Directions can never drift from what the admin set. */
  schedule: Schedule;
}) {
  const hours = formatHoursSegments(schedule, dict);

  return (
    <ScrollReveal as="section" className="container-public">
      <ScrollRevealItem
        as="div"
        // Hover lift matches card-soft, which this deliberately does not use:
        // the slip wants a tighter radius and its own padding scale.
        className="mx-auto max-w-[560px] rounded-xl border border-line bg-bg-elevated p-6 shadow-soft transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          {/* Fraunces 300 is loaded for the pull-quote; the ℞ borrows it. */}
          <span
            aria-hidden
            className="font-serif font-light leading-none text-plum opacity-90 text-[2.25rem] sm:text-[3rem]"
          >
            ℞
          </span>
          <span className="eyebrow mt-1.5 text-[0.65rem]">{dict.rx.eyebrow}</span>
        </div>

        <dl className="mt-6">
          <RxRow label={dict.rx.forLabel}>{dict.rx.forValue}</RxRow>
          <RxRow label={dict.rx.fromLabel}>{dict.rx.fromValue}</RxRow>
          <RxRow label={dict.rx.directionsLabel}>
            {/* Each day-range is nowrap, so a wrap in this narrow column lands
                between segments rather than after the en dash. */}
            <span className="whitespace-nowrap">{dict.rx.visitAnyDay}</span>
            {hours.map((seg) => (
              <span key={seg.label}>
                <span aria-hidden className="text-ink-faint">
                  {' · '}
                </span>
                <span className="whitespace-nowrap">
                  {seg.label} {seg.hours}
                </span>
              </span>
            ))}
          </RxRow>
          <RxRow label={dict.rx.refillsLabel} last>
            {dict.rx.refillsValue}
          </RxRow>
        </dl>

        {/* Signature block, bottom-right as on a real slip. */}
        <div className="mt-8 flex justify-end">
          <div className="text-right">
            <p className="font-serif italic text-[1rem] text-ink-muted">
              {dict.rx.signature}
            </p>
            <span
              aria-hidden
              className="mt-1 ml-auto block h-px w-[120px] bg-line"
            />
            <p className="mt-1.5 text-[0.625rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
              {dict.rx.founderLabel}
            </p>
          </div>
        </div>
      </ScrollRevealItem>
    </ScrollReveal>
  );
}

/**
 * Label beside value from `sm` up, stacked below it on phones — Telugu labels
 * and the long Directions value have nowhere to go in a 295px column.
 */
function RxRow({
  label,
  children,
  last = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={
        'flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4' +
        (last ? '' : ' border-b border-line')
      }
    >
      <dt className="shrink-0 text-[0.75rem] font-medium uppercase tracking-[0.1em] text-ink-muted sm:w-[7.5rem]">
        {label}
      </dt>
      <dd className="min-w-0 font-serif text-[1.0625rem] leading-[1.45] text-ink">
        {children}
      </dd>
    </div>
  );
}
