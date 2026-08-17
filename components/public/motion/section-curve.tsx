import { cn } from '@/lib/utils';

/**
 * A single shallow arc that softens the seam between two bands.
 *
 * Deliberately one path, one flat colour, no gradient or shadow — it should
 * read as the edge of the adjacent band rather than as decoration.
 * `preserveAspectRatio="none"` keeps the arc's height fixed while it stretches
 * to any width, which is what stops a gentle curve deepening into a wave on a
 * wide screen. Height scales down on phones so the proportion holds.
 *
 * Both variants are drawn to sit flush against the band that follows them, so
 * the colour is continuous across the join:
 *  - `valley` — the band's edge dips in the middle and rides higher at the sides.
 *  - `dome`   — the band bulges up in the middle, rising to meet the page.
 */
export function SectionCurve({
  variant,
  color,
  className,
}: {
  variant: 'valley' | 'dome';
  /** Any CSS colour — pass the background of the band this joins. */
  color: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      className={cn('pointer-events-none block w-full', className)}
      style={{ color }}
    >
      <path
        fill="currentColor"
        d={
          variant === 'valley'
            ? // Solid below a dipping arc — meets a band directly beneath it.
              'M0 0 Q 720 48 1440 0 L1440 48 L0 48 Z'
            : // A dome resting on the baseline — the band beneath rises into
              // the page. Zero height at the edges, full height at the centre.
              'M0 48 Q 720 0 1440 48 Z'
        }
      />
    </svg>
  );
}
