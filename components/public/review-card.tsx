'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Review } from '@/lib/types';

// Show a "Read more" toggle for reviews that are likely to overflow ~5 lines.
// Heuristic by character length so we don't need DOM measurement.
const EXPAND_THRESHOLD = 240;

export function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = React.useState(false);
  const long = review.review_text.length > EXPAND_THRESHOLD;

  return (
    <article className="card-soft p-7 flex flex-col h-full">
      {/* Top row: stars + Google pill */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-0.5" aria-label={`${review.stars} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              aria-hidden
              className={cn(
                'h-4 w-4',
                n <= review.stars ? 'text-plum fill-plum' : 'text-line fill-line'
              )}
            />
          ))}
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-line bg-bg-elevated px-2.5 py-1 text-[0.75rem] font-medium text-ink">
          <Star aria-hidden className="h-3 w-3 text-plum fill-plum" />
          Google
        </span>
      </div>

      {/* Review text with floating opening quote mark */}
      <div className="relative mt-5 flex-1">
        <span
          aria-hidden
          className="absolute -top-3 -left-1 font-serif font-medium text-[3rem] leading-none text-plum/60 select-none pointer-events-none"
        >
          &ldquo;
        </span>
        <p
          className={cn(
            'pl-6 text-[0.9375rem] text-ink leading-[1.6]',
            !expanded && long && 'line-clamp-5'
          )}
        >
          {review.review_text}
        </p>
        {long && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 ml-6 link-plum text-[0.8125rem] font-medium hover:underline underline-offset-2"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Bottom row: name · date */}
      <div className="mt-6 pt-4 border-t border-line">
        <p className="text-[0.95rem]">
          <span className="font-serif font-medium text-ink">{review.customer_name}</span>
          <span aria-hidden className="mx-2 text-ink-faint">·</span>
          <span className="text-ink-muted text-[0.875rem]">{review.review_date_label}</span>
        </p>
      </div>
    </article>
  );
}
