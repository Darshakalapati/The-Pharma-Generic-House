import { Star } from 'lucide-react';
import { GOOGLE_REVIEWS_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * Numbers copied from the shop's Google Business Profile by an admin.
 *
 * Both are required: a rating with no count, or a count with no rating, reads
 * as broken, so the component renders nothing at all rather than half a badge.
 * Deliberately display-only — Google's structured-data policy disallows
 * AggregateRating markup for self-reported figures, so there is no JSON-LD.
 */
export function hasGoogleRating(
  rating: number | null | undefined,
  count: number | null | undefined
): boolean {
  return typeof rating === 'number' && rating > 0 && typeof count === 'number' && count > 0;
}

/** Trailing ".0" looks like a typo on a rating; 4.0 reads better as "4". */
function formatRating(rating: number): string {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

/** Pill form — used above the hero eyebrow. */
export function GoogleRatingPill({
  rating,
  count,
  className,
}: {
  rating: number | null;
  count: number | null;
  className?: string;
}) {
  if (!hasGoogleRating(rating, count)) return null;

  return (
    <a
      href={GOOGLE_REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-elevated',
        'px-3 py-1.5 transition-[border-color,transform] duration-200',
        'hover:border-plum hover:-translate-y-px',
        className
      )}
    >
      <Star className="h-3.5 w-3.5 text-plum" fill="currentColor" />
      <span className="font-serif font-medium text-[0.9375rem] text-ink">
        {formatRating(rating!)}
      </span>
      <span className="text-[0.8125rem] font-medium text-ink-muted">on Google</span>
      <span aria-hidden className="text-ink-faint">
        ·
      </span>
      <span className="text-[0.8125rem] font-medium text-ink-muted">
        {count!.toLocaleString('en-IN')} reviews
      </span>
    </a>
  );
}

/** Inline text form — used in the reviews section header. */
export function GoogleRatingLine({
  rating,
  count,
  className,
}: {
  rating: number | null;
  count: number | null;
  className?: string;
}) {
  if (!hasGoogleRating(rating, count)) return null;

  return (
    <a
      href={GOOGLE_REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 text-[0.9375rem] text-ink-muted',
        'transition-colors hover:text-plum whitespace-nowrap',
        className
      )}
    >
      <Star className="h-3.5 w-3.5 text-plum shrink-0" fill="currentColor" />
      <span className="font-serif font-medium text-ink">{formatRating(rating!)}</span>
      <span aria-hidden className="text-ink-faint">
        ·
      </span>
      <span>{count!.toLocaleString('en-IN')} reviews on Google</span>
    </a>
  );
}
